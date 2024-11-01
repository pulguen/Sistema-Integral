import React, { useContext } from 'react';
import PeriodosBombeoForm from './PeriodosBombeoForm';
import PeriodosBombeoList from './PeriodosBombeoList';
import { BombeoAguaContext } from '../../../../context/BombeoAguaContext';

const PeriodosBombeo = () => {
  const { periodos, handleCreatePeriodo, handleConfirmPeriodo, handleDeletePeriodo } = useContext(BombeoAguaContext);

  return (
    <div>
      <PeriodosBombeoForm onAddPeriodo={handleCreatePeriodo} />
      <PeriodosBombeoList
        periodos={periodos}
        onConfirmPeriodo={handleConfirmPeriodo}
        onDeletePeriodo={handleDeletePeriodo}
      />
    </div>
  );
};

export default PeriodosBombeo;
