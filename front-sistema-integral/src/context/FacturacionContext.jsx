import React, { createContext, useState, useCallback, useEffect, useMemo } from "react";
import customFetch from "./CustomFetch";
import { transformarCliente, unpackData, titleCase } from "../utils/clienteUtils.js";
import Swal from "sweetalert2";

export const FacturacionContext = createContext();

export const FacturacionProvider = ({ children }) => {
  const [clientes, setClientes] = useState([]);
  const [tributos, setTributos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
  const [error, setError] = useState(null);
  const [modules, setModules] = useState({});
  const [condicionesPago, setCondicionesPago] = useState([]);
  const [calles, setCalles] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [pendingRequests, setPendingRequests] = useState(0);

  // Nuevo estado para el valor del módulo
  const [moduleInfo, setModuleInfo] = useState({
    valor_modulo: 0,
    ordenanza_modulo: "",
    updated_at: ""
  });

  // "loading" será verdadero mientras haya al menos una petición pendiente.
  const loading = pendingRequests > 0;

  // Limpia error si la sesión expira
  useEffect(() => {
    const clearOnLogout = () => setError(null);
    window.addEventListener('tokenExpired', clearOnLogout);
    return () => window.removeEventListener('tokenExpired', clearOnLogout);
  }, []);

  const startLoading = () => setPendingRequests(prev => prev + 1);
  const finishLoading = () => setPendingRequests(prev => Math.max(prev - 1, 0));

  const fetchClientes = useCallback(async () => {
    startLoading();
    try {
      const response = await customFetch("/clientes");
      console.log("Clientes API response:", response);
      const rawClientes = Array.isArray(response)
        ? response
        : Array.isArray(response.data)
          ? response.data
          : [];
      const clientesFormateados = rawClientes.map(transformarCliente);
      setClientes(clientesFormateados);
      setError(null);
    } catch (err) {
      if (err.status === 401 || err.status === 403) return;
      console.error("Error al obtener los clientes:", err);
      setError("Error al obtener los clientes.");
    } finally {
      finishLoading();
    }
  }, []);

  const fetchTributos = useCallback(async () => {
    startLoading();
    try {
      const data = await customFetch("/tributos");
      console.log("Tributos obtenidos:", data);
      setTributos(data || []);
      setError(null);
    } catch (err) {
      if (err.status === 401 || err.status === 403) return;
      console.error("Error al obtener los tributos:", err);
      setError("Error al obtener los tributos.");
    } finally {
      finishLoading();
    }
  }, []);

  const fetchServiciosByTributo = useCallback(async (tributoId) => {
    try {
      const data = await customFetch(`/tributos/${tributoId}`);
      console.log("Servicios para tributo", tributoId, ":", data);
      setServicios(data.servicios || []);
    } catch (err) {
      if (err.status === 401 || err.status === 403) return;
      console.error("Error al obtener los servicios:", err);
      setError("Error al obtener los servicios.");
    }
  }, []);

  const fetchPeriodosByClienteYServicio = useCallback(
    async (clienteId, servicioId, tributoId) => {
      try {
        const url = `/cuentas/cliente/${clienteId}/periodos?servicio_id=${servicioId}&tributo_id=${tributoId}`;
        const data = await customFetch(url);
        console.log("Períodos obtenidos:", data);
        let periods = [];
        if (Array.isArray(data)) {
          data.forEach((item) => {
            if (Array.isArray(item)) {
              periods = periods.concat(item);
            } else {
              periods.push(item);
            }
          });
        } else {
          console.error("Formato de datos inesperado:", data);
          return [];
        }
        return (periods || []).map((periodo) => {
          const i_debito = parseFloat(periodo.i_debito) || 0;
          const i_descuento = parseFloat(periodo.i_descuento) || 0;
          const i_recargo_actualizado =
            parseFloat(periodo.i_recargo_actualizado || periodo.i_recargo) || 0;
          return {
            ...periodo,
            i_recargo_actualizado,
            total: i_debito - i_descuento + i_recargo_actualizado,
          };
        });
      } catch (err) {
        if (err.status === 401 || err.status === 403) return [];
        console.error("Error al obtener los períodos:", err);
        setError("Error al obtener los períodos.");
        throw err;
      }
    },
    []
  );

  const fetchClienteById = useCallback(async (clienteId) => {
    startLoading();
    try {
      const data = await customFetch(`/cuentas/cliente/${clienteId}`);
      console.log("Cliente obtenido por ID:", data);
      setError(null);
      return data;
    } catch (err) {
      if (err.status === 401 || err.status === 403) return null;
      console.error("Error al obtener el cliente:", err);
      setError("Error al obtener el cliente.");
      throw err;
    } finally {
      finishLoading();
    }
  }, []);

  const fetchRecibosByCliente = useCallback(async (clienteId, showAlert = true) => {
    try {
      const response = await customFetch(
        `/recibos/cliente/${clienteId}?page=1&per_page=100`,
        "GET",
        null,
        showAlert
      );
      console.log(`Recibos para cliente ${clienteId}:`, response);
      let dataArray = [];
      if (Array.isArray(response)) {
        if (response.length === 2 && Array.isArray(response[0])) {
          dataArray = response[0];
        }
      } else if (response.data && Array.isArray(response.data)) {
        dataArray = response.data;
      }
      console.log("Todos los recibos del cliente:", dataArray);
      return dataArray;
    } catch (err) {
      if (err.status === 401 || err.status === 403) return [];
      console.error("Error al obtener los recibos del cliente:", err);
      setError("Error al obtener los recibos del cliente.");
      throw err;
    }
  }, []);

  const fetchCondicionesPago = useCallback(async () => {
    try {
      const data = await customFetch("/condiciones_pago");
      console.log("Condiciones de pago obtenidas:", data);
      let flatConditions = [];
      if (Array.isArray(data)) {
        const flatten = (arr) =>
          arr.reduce(
            (acc, item) =>
              Array.isArray(item) ? acc.concat(flatten(item)) : acc.concat(item),
            []
          );
        flatConditions = flatten(data).filter(
          (item) =>
            item &&
            typeof item === "object" &&
            "id" in item &&
            "nombre" in item
        );
      }
      setCondicionesPago(flatConditions);
    } catch (err) {
      if (err.status === 401 || err.status === 403) return;
      console.error("Error al obtener condiciones de pago:", err);
    }
  }, []);

  const fetchCalles = useCallback(async () => {
    try {
      const data = await customFetch("/calles");
      const formatted = unpackData(data)
        .map(calle => ({
          ...calle,
          nombre: titleCase(calle.nombre)
        }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
      console.log("Calles formateadas y ordenadas:", formatted);
      setCalles(formatted);
    } catch (err) {
      if (err.status === 401 || err.status === 403) return;
      console.error("Error al obtener las calles:", err);
    }
  }, []);

  const fetchMunicipios = useCallback(async () => {
    try {
      const data = await customFetch("/municipios");
      console.log("Municipios obtenidos:", data);
      setMunicipios(unpackData(data));
    } catch (err) {
      if (err.status === 401 || err.status === 403) return;
      console.error("Error al obtener los municipios:", err);
    }
  }, []);

  const fetchProvincias = useCallback(async () => {
    try {
      const data = await customFetch("/provincias");
      console.log("Provincias obtenidas:", data);
      setProvincias(unpackData(data));
    } catch (err) {
      if (err.status === 401 || err.status === 403) return;
      console.error("Error al obtener las provincias:", err);
    }
  }, []);

  const fetchModuleValue = useCallback(async () => {
    try {
      const data = await customFetch("/general");
      setModuleInfo({
        valor_modulo: data.valor_modulo,
        ordenanza_modulo: data.ordenanza_modulo,
        updated_at: data.updated_at || data.created_at || ""
      });
    } catch (err) {
      if (err.status === 401 || err.status === 403) return;
      console.error("Error al obtener el valor del módulo:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al obtener el valor del módulo.",
      });
    }
  }, []);

  // Cargar datos al montar.
  useEffect(() => {
    fetchClientes();
    fetchTributos();
    fetchCondicionesPago();
    fetchCalles();
    fetchMunicipios();
    fetchProvincias();
    fetchModuleValue();
    async function fetchServicios() {
      try {
        const data = await customFetch("/servicios");
        console.log("Servicios obtenidos:", data);
        setServiciosDisponibles(unpackData(data));
      } catch (err) {
        if (err.status === 401 || err.status === 403) return;
        console.error("Error al obtener servicios:", err);
      }
    }
    fetchServicios();
  }, [
    fetchClientes,
    fetchTributos,
    fetchCondicionesPago,
    fetchCalles,
    fetchMunicipios,
    fetchProvincias,
    fetchModuleValue,
  ]);

  const municipiosOrdenados = useMemo(() => {
    const copy = [...municipios];
    copy.sort((a, b) => a.nombre.localeCompare(b.nombre));
    return copy;
  }, [municipios]);

  const registerModule = useCallback((moduleName, moduleData) => {
    setModules((prevModules) => ({
      ...prevModules,
      [moduleName]: moduleData,
    }));
  }, []);

  const value = {
    clientes,
    tributos,
    servicios,
    serviciosDisponibles,
    fetchClientes,
    fetchTributos,
    fetchServiciosByTributo,
    fetchPeriodosByClienteYServicio,
    fetchClienteById,
    registerModule,
    modules,
    loading,
    error,
    fetchRecibosByCliente,
    condicionesPago,
    calles,
    municipios,
    municipiosOrdenados,
    provincias,
    moduleInfo,
  };

  return (
    <FacturacionContext.Provider value={value}>
      {children}
    </FacturacionContext.Provider>
  );
};

export default FacturacionProvider;
