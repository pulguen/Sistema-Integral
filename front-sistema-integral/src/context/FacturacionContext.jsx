import React, { createContext, useState, useCallback, useEffect } from "react";
import customFetch from "./CustomFetch";

export const FacturacionContext = createContext();

export const FacturacionProvider = ({ children }) => {
  const [clientes, setClientes] = useState([]);
  const [tributos, setTributos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modules, setModules] = useState({});
  const [condicionesPago, setCondicionesPago] = useState([]);
  const [calles, setCalles] = useState([]);

  // Función auxiliar para esperar (en ms)
  //const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Obtener clientes
  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await customFetch("/clientes");
      console.log("Clientes obtenidos:", data);
      setClientes(data);
      setError(null);
    } catch (error) {
      console.error("Error al obtener los clientes:", error);
      setError("Error al obtener los clientes.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener tributos
  const fetchTributos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await customFetch("/tributos");
      console.log("Tributos obtenidos:", data);
      setTributos(data || []);
      setError(null);
    } catch (error) {
      console.error("Error al obtener los tributos:", error);
      setError("Error al obtener los tributos.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener servicios de un tributo
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

  // Obtener períodos
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

  const registerModule = useCallback((moduleName, moduleData) => {
    setModules((prevModules) => ({
      ...prevModules,
      [moduleName]: moduleData,
    }));
  }, []);

  // Obtener cliente por id
  const fetchClienteById = useCallback(async (clienteId) => {
    setLoading(true);
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
      setLoading(false);
    }
  }, []);

  /**
   * NUEVA FUNCIÓN: Obtener recibos de un cliente usando la nueva ruta:
   * /recibos/cliente/{id}
   * Se asume que la respuesta es:
   *   - Un arreglo de dos elementos, donde el primero es el array de recibos
   *     y el segundo es el status (por ejemplo, [ dataArray, 201 ]), o
   *   - Un objeto con una propiedad "data" (caso anterior).
   */
  const fetchRecibosByCliente = useCallback(
    async (clienteId) => {
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
    },
    []
  );

  // Obtener condiciones de pago
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

  // Obtener calles
  const fetchCalles = useCallback(async () => {
    try {
      const data = await customFetch("/calles");
      console.log("Calles obtenidas:", data);
      let flatCalles = [];
      if (Array.isArray(data)) {
        const flatten = (arr) =>
          arr.reduce(
            (acc, item) =>
              Array.isArray(item) ? acc.concat(flatten(item)) : acc.concat(item),
            []
          );
        flatCalles = flatten(data).filter(
          (item) =>
            item &&
            typeof item === "object" &&
            "id" in item &&
            "nombre" in item
        );
      }
      setCalles(flatCalles);
    } catch (error) {
      console.error("Error al obtener las calles:", error);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
    fetchTributos();
    fetchCondicionesPago();
    fetchCalles();
  }, [fetchClientes, fetchTributos, fetchCondicionesPago, fetchCalles]);

  const value = {
    clientes,
    tributos,
    servicios,
    fetchClientes,
    fetchTributos,
    fetchServiciosByTributo,
    fetchPeriodosByClienteYServicio,
    fetchClienteById,
    registerModule,
    modules,
    loading,
    error,
    fetchRecibosByCliente, // NUEVA función para obtener recibos por cliente
    condicionesPago,
    calles,
  };

  return (
    <FacturacionContext.Provider value={value}>
      {children}
    </FacturacionContext.Provider>
  );
};

export default FacturacionProvider;
