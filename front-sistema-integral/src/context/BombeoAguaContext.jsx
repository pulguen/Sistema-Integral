import React, { createContext, useState } from 'react';

export const BombeoAguaContext = createContext();

export const BombeoAguaProvider = ({ children }) => {
  const [facturas, setFacturas] = useState([]);
  const [recibos, setRecibos] = useState([]); // Estado para los recibos

  // Función para manejar creación de facturas
  const handleCreateInvoice = (newInvoice) => {
    setFacturas((prevFacturas) => [...prevFacturas, newInvoice]);
  };

  // Función para confirmar una factura
  const handleConfirmInvoice = (factura) => {
    const updatedFacturas = facturas.filter(f => f !== factura);
    setFacturas(updatedFacturas);
    console.log('Factura confirmada:', factura);
  };

  // Función para eliminar una factura
  const handleDeleteInvoice = (factura) => {
    const updatedFacturas = facturas.filter(f => f !== factura);
    setFacturas(updatedFacturas);
  };

  // Función para agregar un recibo
  const handleCreateRecibo = (newRecibo) => {
    setRecibos((prevRecibos) => [...prevRecibos, newRecibo]);
  };

  // Función para confirmar un recibo
  const handleConfirmRecibo = (recibo) => {
    const updatedRecibos = recibos.filter(r => r !== recibo);
    setRecibos(updatedRecibos);
    console.log('Recibo confirmado:', recibo);
  };

  // Función para eliminar un recibo
  const handleDeleteRecibo = (recibo) => {
    const updatedRecibos = recibos.filter(r => r !== recibo);
    setRecibos(updatedRecibos);
    console.log('Recibo eliminado:', recibo);
  };

  return (
    <BombeoAguaContext.Provider value={{
      facturas,
      recibos,
      handleCreateInvoice,
      handleConfirmInvoice,
      handleDeleteInvoice,
      handleCreateRecibo, // Añadido para recibos
      handleConfirmRecibo, // Añadido para recibos
      handleDeleteRecibo, // Añadido para recibos
    }}>
      {children}
    </BombeoAguaContext.Provider>
  );
};
