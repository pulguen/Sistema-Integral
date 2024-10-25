import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const TarifasContext = createContext();

export function TarifasProvider({ children }) {
  const [tarifas, setTarifas] = useState([]);

  useEffect(() => {
    const fetchTarifas = async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://tu-api.com/tarifas', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTarifas(response.data);
    };
    fetchTarifas();
  }, []);

  return (
    <TarifasContext.Provider value={{ tarifas }}>
      {children}
    </TarifasContext.Provider>
  );
}


