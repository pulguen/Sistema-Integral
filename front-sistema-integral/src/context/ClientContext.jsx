import React, { createContext, useState, useCallback, useEffect } from 'react';
import customFetch from './CustomFetch';
import { transformarCliente, unpackData } from '../utils/clienteUtils.js';

export const ClientContext = createContext();

export const ClientProvider = ({ children }) => {
  const BATCH_SIZE = 15;

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [currentClient, setCurrentClient] = useState(null);
  const [loadingClient, setLoadingClient] = useState(false);

  // 1. Listar / paginar
  const fetchClients = useCallback(async ({ page = 1, per_page = BATCH_SIZE } = {}) => {
    setLoading(true);
    try {
      const pagesNeeded = Math.ceil(per_page / BATCH_SIZE);
      const startPage = (page - 1) * pagesNeeded + 1;
      let all = [];
      let total = 0;

      for (let i = 0; i < pagesNeeded; i++) {
        const srvPage = startPage + i;
        const res = await customFetch(`/clientes?page=${srvPage}&per_page=${BATCH_SIZE}`);
        const data = Array.isArray(res.data) ? res.data : unpackData(res);
        all = all.concat(data);
        total = res.total;
      }

      setClients(all.map(transformarCliente));
      setPageCount(Math.ceil(total / per_page));
    } catch (err) {
      console.error('Error fetching clients:', err);
      setClients([]);
      setPageCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Búsqueda
const searchClients = useCallback(
  async term => {
    setSearchTerm(term);
    if (!term.trim()) {
      setIsSearching(false);
      await fetchClients({ page: 1, per_page: BATCH_SIZE });
      return [];
    }

    setLoading(true);
    try {
      const res = await customFetch(`/clientes/search/${encodeURIComponent(term)}`);
      const data = Array.isArray(res) ? res : unpackData(res.data);
      const clientesTransformados = data.map(transformarCliente);

      setClients(clientesTransformados);
      setPageCount(1);
      setIsSearching(true);

      return clientesTransformados;
    } catch (err) {
      console.error('Error searching clients:', err);
      setClients([]);
      setPageCount(0);
      setIsSearching(false);
      return [];
    } finally {
      setLoading(false);
    }
  },
  [fetchClients]
);

  // 3. Obtener uno por ID
  const fetchClientById = useCallback(async id => {
    setLoadingClient(true);
    try {
      const data = await customFetch(`/clientes/${id}`);
      setCurrentClient(transformarCliente(data));
      return transformarCliente(data);
    } catch (err) {
      console.error('Error fetching client by id:', err);
      setCurrentClient(null);
      throw err;
    } finally {
      setLoadingClient(false);
    }
  }, []);

  // 4. Crear — ahora devuelve el cliente recién creado
  const addClient = useCallback(async clientData => {
    const newClient = await customFetch('/clientes', 'POST', clientData);
    await fetchClients({ page: 1, per_page: BATCH_SIZE });
    return newClient;
  }, [fetchClients]);

  // 5. Editar
  const updateClient = useCallback(async clientData => {
    const updated = await customFetch(`/clientes/${clientData.id}`, 'PUT', clientData);
    if (currentClient?.id === updated.id) {
      setCurrentClient(transformarCliente(updated));
    }
    await fetchClients({ page: 1, per_page: BATCH_SIZE });
    return updated;
  }, [fetchClients, currentClient]);

  // 6. Borrar
  const removeClient = useCallback(async id => {
    await customFetch(`/clientes/${id}`, 'DELETE');
    if (currentClient?.id === id) setCurrentClient(null);
    await fetchClients({ page: 1, per_page: BATCH_SIZE });
  }, [fetchClients, currentClient]);

  // carga inicial
  useEffect(() => {
    fetchClients({ page: 1, per_page: BATCH_SIZE });
  }, [fetchClients]);

  return (
    <ClientContext.Provider value={{
      clients,
      loading,
      pageCount,
      searchTerm,
      isSearching,
      fetchClients,
      searchClients,
      currentClient,
      loadingClient,
      fetchClientById,
      addClient,
      updateClient,
      removeClient,
    }}>
      {children}
    </ClientContext.Provider>
  );
};
