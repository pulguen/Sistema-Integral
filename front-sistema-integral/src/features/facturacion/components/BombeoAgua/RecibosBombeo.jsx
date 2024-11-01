// src/features/facturacion/components/BombeoAgua/RecibosBombeo.jsx
import React, { useContext } from 'react';
import RecibosBombeoForm from './RecibosBombeoForm';
import RecibosBombeoList from './RecibosBombeoList';
import { BombeoAguaContext } from '../../../../context/BombeoAguaContext.jsx';

const RecibosBombeo = () => {
  const {
    recibos,
    handleCreateRecibo,
    handleConfirmRecibo,
    handleDeleteRecibo,
  } = useContext(BombeoAguaContext);

  return (
    <div>
      <RecibosBombeoForm onAddRecibo={handleCreateRecibo} />
      <RecibosBombeoList
        recibos={recibos}
        onConfirmRecibo={handleConfirmRecibo}
        onDeleteRecibo={handleDeleteRecibo}
      />
    </div>
  );
};

export default RecibosBombeo;
