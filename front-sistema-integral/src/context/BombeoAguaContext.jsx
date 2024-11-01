import React, { createContext, useState } from 'react';

export const BombeoAguaContext = createContext();

export const BombeoAguaProvider = ({ children }) => {
  const [periodos, setPeriodos] = useState([]);
  const [recibos, setRecibos] = useState([]);
  const [homePeriodos, setHomePeriodos] = useState([]);
  const [loadingHomePeriodos, setLoadingHomePeriodos] = useState(false);
  const [servicios, setServicios] = useState([]);

  const handleCreatePeriodo = (newPeriodo) => {
    if (!newPeriodo || typeof newPeriodo !== 'object' || !newPeriodo.clientName) {
      console.warn('Error: el periodo proporcionado no es válido.');
      return;
    }
    setPeriodos((prevPeriodos) => [...prevPeriodos, newPeriodo]);
    console.log('Periodo creado:', newPeriodo);
  };

  const handleConfirmPeriodo = (periodo) => {
    if (!periodo || !periodos.includes(periodo)) {
      console.warn('Error: el periodo no es válido o no existe.');
      return;
    }
    setPeriodos((prevPeriodos) => prevPeriodos.filter((p) => p !== periodo));
    console.log('Periodo confirmado:', periodo);
  };

  const handleDeletePeriodo = (periodo) => {
    if (!periodo || !periodos.includes(periodo)) {
      console.warn('Error: el periodo no es válido o no existe.');
      return;
    }
    setPeriodos((prevPeriodos) => prevPeriodos.filter((p) => p !== periodo));
    console.log('Periodo eliminado:', periodo);
  };

  const handleCreateRecibo = (newRecibo) => {
    if (!newRecibo || typeof newRecibo !== 'object' || typeof newRecibo.totalAmount !== 'number') {
      console.warn('Error: el recibo proporcionado no es válido.');
      return;
    }
    setRecibos((prevRecibos) => [...prevRecibos, newRecibo]);
    console.log('Recibo creado:', newRecibo);
  };

  const handleConfirmRecibo = (recibo) => {
    if (!recibo || !recibos.includes(recibo)) {
      console.warn('Error: el recibo no es válido o no existe.');
      return;
    }
    setRecibos((prevRecibos) => prevRecibos.filter((r) => r !== recibo));
    console.log('Recibo confirmado:', recibo);
  };

  const handleDeleteRecibo = (recibo) => {
    if (!recibo || !recibos.includes(recibo)) {
      console.warn('Error: el recibo no es válido o no existe.');
      return;
    }
    setRecibos((prevRecibos) => prevRecibos.filter((r) => r !== recibo));
    console.log('Recibo eliminado:', recibo);
  };

  return (
    <BombeoAguaContext.Provider
      value={{
        periodos,
        setPeriodos,
        recibos,
        setRecibos,
        handleCreatePeriodo,
        handleConfirmPeriodo,
        handleDeletePeriodo,
        handleCreateRecibo,
        handleConfirmRecibo,
        handleDeleteRecibo,
        homePeriodos,
        setHomePeriodos,
        loadingHomePeriodos,
        setLoadingHomePeriodos,
        servicios,
        setServicios,
      }}
    >
      {children}
    </BombeoAguaContext.Provider>
  );
};
