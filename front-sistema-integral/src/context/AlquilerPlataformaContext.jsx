import { createContext, useState, useCallback, useEffect, useMemo, useContext } from 'react';
import customFetch from './CustomFetch';
import { FacturacionContext } from './FacturacionContext';
import { transformarCliente } from '../utils/clienteUtils';
import { AuthContext } from './AuthContext';

export const AlquilerPlataformaContext = createContext();

export const AlquilerPlataformaProvider = ({ children }) => {
  const [periodos, setPeriodos] = useState([]);
  const [recibos, setRecibos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loadingServicios, setLoadingServicios] = useState(true);
  const { user } = useContext(AuthContext);
  const { registerModule } = useContext(FacturacionContext);
  const TRIBUTO_ID = 3; // <<< ID para Alquiler Terminal

  // Fetch servicios de alquiler
  const fetchServicios = useCallback(async () => {
    try {
      const response = await customFetch(`/tributos/${TRIBUTO_ID}`);
      const lista = Array.isArray(response.servicios)
        ? response.servicios
        : Array.isArray(response.data?.servicios)
          ? response.data.servicios
          : [];
      setServicios(lista);
    } catch (error) {
      console.error('Error al obtener los servicios:', error);
    } finally {
      setLoadingServicios(false);
    }
  }, []);

  useEffect(() => {
    fetchServicios();
  }, [fetchServicios]);

  // Clientes de alquiler terminal
  const clientesAlquiler = useMemo(() => {
    if (!servicios.length) return [];
    // Filtrá servicios del tributo 3
    const serviciosAlquiler = servicios.filter(s => s.tributo_id === TRIBUTO_ID);
    // Filtrá por permisos de usuario si corresponde
    const serviciosPermitidos = Array.isArray(user?.services) && user.services.length > 0
      ? serviciosAlquiler.filter(s => user.services.includes(s.id))
      : serviciosAlquiler;
    // Juntá todos los clientes
    let todosClientes = [];
    for (const servicio of serviciosPermitidos) {
      if (Array.isArray(servicio.clientes)) {
        todosClientes.push(...servicio.clientes);
      }
    }
    // Sin duplicados
    const unique = Array.from(new Map(todosClientes.map(c => [c.id, c])).values());
    return unique.map(transformarCliente);
  }, [servicios, user?.services]);

  // Periodos y recibos: podrías replicar los métodos de BombeoAguaContext, adaptados
  // ... (aquí irían los métodos de creación/edición/borrado, igual que en Bombeo)
  
  // Registrar el módulo (opcional pero útil)
  useEffect(() => {
    registerModule("alquiler", { servicios, periodos, clientesAlquiler });
  }, [registerModule, servicios, periodos, clientesAlquiler]);

  const value = useMemo(() => ({
    periodos,
    setPeriodos,
    recibos,
    setRecibos,
    servicios,
    clientesAlquiler,
    loadingServicios,
    // ...otros métodos
  }), [
    periodos,
    recibos,
    servicios,
    clientesAlquiler,
    loadingServicios,
    // ...otros métodos
  ]);

  return (
    <AlquilerPlataformaContext.Provider value={value}>
      {children}
    </AlquilerPlataformaContext.Provider>
  );
};
