// src/hooks/usePaginatedFetch.js
import { useState, useEffect, useCallback } from 'react';
import customFetch from '../context/CustomFetch.js'; // ajusta la ruta

/**
 * Hook genérico para paginación y búsqueda en un endpoint Laravel.
 * @param {string} baseEndpoint e.g. '/clientes'
 */
export function usePaginatedFetch(baseEndpoint) {
  const [data, setData] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState('');

  const fetchPage = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: (pageIndex + 1).toString(),
        per_page: pageSize.toString()
      });
      const url = search
        ? `${baseEndpoint}/search/${encodeURIComponent(search)}?${params}`
        : `${baseEndpoint}?${params}`;
      console.log('[usePaginatedFetch] GET', url);
      const res = await customFetch(url);
      const pageData = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : res.data?.data || [];
      const total = res.total ?? res.meta?.total ?? pageData.length;
      setData(pageData);
      setPageCount(Math.ceil(total / pageSize));
    } catch (err) {
      console.error('[usePaginatedFetch]', err);
      setData([]);
      setPageCount(0);
    } finally {
      setLoading(false);
    }
  }, [baseEndpoint, pageIndex, pageSize, search]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  return {
    data,
    loading,
    pageCount,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    search,
    setSearch,
    refresh: fetchPage,
  };
}
