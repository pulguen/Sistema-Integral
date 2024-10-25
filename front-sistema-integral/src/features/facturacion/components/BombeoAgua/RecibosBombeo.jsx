import React, { useState } from 'react';
import RecibosBombeoForm from './RecibosBombeoForm';
import RecibosBombeoList from './RecibosBombeoList';

const RecibosBombeo = () => {
  const [recibos, setRecibos] = useState([]);

  const handleAddRecibo = (nuevoRecibo) => {
    console.log('Nuevo recibo agregado:', nuevoRecibo)
    setRecibos([...recibos, nuevoRecibo]);
  };

  const handleConfirmRecibo = (recibo) => {
    console.log('Recibo confirmado:', recibo)
    setRecibos(recibos.filter(r => r !== recibo));
  };

  const handleDeleteRecibo = (recibo) => {
    console.log('Recibo eliminado:', recibo)
    setRecibos(recibos.filter(r => r !== recibo));
  };

  return (
    <div>
      <RecibosBombeoForm onAddRecibo={handleAddRecibo} />
      <RecibosBombeoList
        recibos={recibos}
        onConfirmRecibo={handleConfirmRecibo}
        onDeleteRecibo={handleDeleteRecibo}
      />
    </div>
  );
};

export default RecibosBombeo;
