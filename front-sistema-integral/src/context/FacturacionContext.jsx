// src/context/FacturacionContext.jsx

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

  // Obtener clientes
  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await customFetch("/clientes");
      setClientes(data || []);
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
      setServicios(data.servicios || []);
    } catch (error) {
      console.error("Error al obtener los servicios:", error);
      setError("Error al obtener los servicios.");
    }
  }, []);

  // Obtener períodos (ejemplo existente)
  const fetchPeriodosByClienteYServicio = useCallback(
    async (clienteId, servicioId, tributoId) => {
      try {
        const url = `/cuentas/cliente/${clienteId}/periodos?servicio_id=${servicioId}&tributo_id=${tributoId}`;
        const data = await customFetch(url);
        
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

  const fetchClienteById = useCallback(async (clienteId) => {
    setLoading(true);
    try {
      const data = await customFetch(`/cuentas/cliente/${clienteId}`);
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

  // Obtener recibo por número
  const fetchReciboByNumero = useCallback(async (numero) => {
    try {
      const data = await customFetch(`/recibos?numero=${numero}`);
      return data; 
    } catch (error) {
      console.error("Error al obtener el recibo:", error);
      setError("Error al obtener el recibo.");
      throw error;
    }
  }, []);

  // Obtener varios recibos dada una lista de números
  const fetchRecibosByNumeros = useCallback(async (numeros) => {
    try {
      const promises = numeros.map((num) => fetchReciboByNumero(num));
      const results = await Promise.all(promises);
      // results es algo como [Array(…), 200, Array(…), 200, ...]
      // Solo retornamos directamente results, lo filtraremos en el componente.
      return results;
    } catch (error) {
      console.error("Error al obtener los recibos:", error);
      setError("Error al obtener los recibos.");
      throw error;
    }
  }, [fetchReciboByNumero]);

  // Funciones de gráficos omitidas por brevedad (mantener si las usas)

  useEffect(() => {
    fetchClientes();
    fetchTributos();
  }, [fetchClientes, fetchTributos]);

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
    fetchReciboByNumero,
    fetchRecibosByNumeros,
    // Aquí seguirían las funciones de gráficos si las necesitas
  };

  return (
    <FacturacionContext.Provider value={value}>
      {children}
    </FacturacionContext.Provider>
  );
};
