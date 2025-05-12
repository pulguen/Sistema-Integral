// FacturacionContext.jsx
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
  const [moduleValue, setModuleValue] = useState(0);

  // "loading" será verdadero mientras haya al menos una petición pendiente.
  const loading = pendingRequests > 0;

  // Funciones para gestionar el contador de carga.
  const startLoading = () => setPendingRequests(prev => prev + 1);
  const finishLoading = () => setPendingRequests(prev => Math.max(prev - 1, 0));

const fetchClientes = useCallback(async () => {
  startLoading();
  try {
    const response = await customFetch("/clientes");
    console.log("Clientes API response:", response);

    // 1) Extraigo la lista real
    const rawClientes = Array.isArray(response)
      ? response
      : Array.isArray(response.data)
        ? response.data
        : [];

    // 2) Transformo
    const clientesFormateados = rawClientes.map(transformarCliente);

    // 3) Seteo
    setClientes(clientesFormateados);
    setError(null);
  } catch (err) {
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
    } catch (error) {
      console.error("Error al obtener los tributos:", error);
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
    } catch (error) {
      console.error("Error al obtener los servicios:", error);
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
      } catch (error) {
        console.error("Error al obtener los períodos:", error);
        setError("Error al obtener los períodos.");
        throw error;
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
    } catch (error) {
      console.error("Error al obtener el cliente:", error);
      setError("Error al obtener el cliente.");
      throw error;
    } finally {
      finishLoading();
    }
  }, []);

  const fetchRecibosByCliente = useCallback(async (clienteId) => {
    try {
      const response = await customFetch(
        `/recibos/cliente/${clienteId}?page=1&per_page=100`
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
    } catch (error) {
      console.error("Error al obtener los recibos del cliente:", error);
      setError("Error al obtener los recibos del cliente.");
      throw error;
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
    } catch (error) {
      console.error("Error al obtener condiciones de pago:", error);
    }
  }, []);

  const fetchCalles = useCallback(async () => {
    try {
      const data = await customFetch("/calles");
      // Aplicamos titleCase a cada nombre de calle
      const formatted = unpackData(data).map(calle => ({
        ...calle,
        nombre: titleCase(calle.nombre)
      }));
      console.log("Calles formateadas:", formatted);
      setCalles(formatted);
    } catch (error) {
      console.error("Error al obtener las calles:", error);
    }
  }, []);
  
  

  const fetchMunicipios = useCallback(async () => {
    try {
      const data = await customFetch("/municipios");
      console.log("Municipios obtenidos:", data);
      setMunicipios(unpackData(data));
    } catch (error) {
      console.error("Error al obtener los municipios:", error);
    }
  }, []);

  const fetchProvincias = useCallback(async () => {
    try {
      const data = await customFetch("/provincias");
      console.log("Provincias obtenidas:", data);
      setProvincias(unpackData(data));
    } catch (error) {
      console.error("Error al obtener las provincias:", error);
    }
  }, []);

  // NUEVO: Función para obtener el valor del módulo.
  const fetchModuleValue = useCallback(async () => {
    try {
      const data = await customFetch("/general");
      console.log("Valor del módulo obtenido:", data);
      setModuleValue(data.valor_modulo);
    } catch (error) {
      console.error("Error al obtener el valor del módulo:", error);
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
    // Llamamos a fetchModuleValue para establecer moduleValue.
    fetchModuleValue();
    async function fetchServicios() {
      try {
        const data = await customFetch("/servicios");
        console.log("Servicios obtenidos:", data);
        setServiciosDisponibles(unpackData(data));
      } catch (error) {
        console.error("Error al obtener servicios:", error);
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
    moduleValue,
  };

  return (
    <FacturacionContext.Provider value={value}>
      {children}
    </FacturacionContext.Provider>
  );
};

export default FacturacionProvider;