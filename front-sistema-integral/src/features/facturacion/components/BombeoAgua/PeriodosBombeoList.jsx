import React, { useContext, useCallback } from 'react';
import { Table } from 'react-bootstrap';
import { FaTrash, FaCheck, FaInfoCircle } from 'react-icons/fa';
import CustomButton from '../../../../components/common/botons/CustomButton';
import Swal from 'sweetalert2';
import '../../../../styles/EmptyState.css';
import customFetch from '../../../../context/CustomFetch';
import { BombeoAguaContext } from '../../../../context/BombeoAguaContext';

const PeriodosBombeoList = () => {
  const { periodos, handleConfirmPeriodo, handleDeletePeriodo } = useContext(BombeoAguaContext);

  const handleConfirmClick = useCallback(
    async (periodo) => {
      try {
        const confirmResult = await Swal.fire({
          title: '¿Confirmar Periodo?',
          text: 'No podrás revertir esta acción.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, confirmar',
        });

        if (confirmResult.isConfirmed) {
          const monthNameToNumber = (monthName) => {
            const months = {
              Enero: 1,
              Febrero: 2,
              Marzo: 3,
              Abril: 4,
              Mayo: 5,
              Junio: 6,
              Julio: 7,
              Agosto: 8,
              Septiembre: 9,
              Octubre: 10,
              Noviembre: 11,
              Diciembre: 12,
            };
            return months[monthName] || 0;
          };

          const formatVencimiento = (vencimiento) => {
            const date = new Date(vencimiento);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          };

          const payload = {
            cliente_id: periodo.cliente_id.toString(),
            tributo_id: '1', // Según implementación
            servicio_id: periodo.servicio_id.toString(),
            año: new Date().getFullYear().toString(),
            mes: monthNameToNumber(periodo.month).toString(),
            cuota: periodo.cuota.toString(),
            f_vencimiento: formatVencimiento(periodo.vencimiento),
            cant: periodo.volume.toString(),
          };

          if (
            !payload.cliente_id ||
            !payload.servicio_id ||
            !payload.mes ||
            !payload.cuota ||
            !payload.cant ||
            !payload.f_vencimiento
          ) {
            Swal.fire(
              'Error',
              'Algunos campos requeridos están vacíos. Por favor verifica la información del periodo.',
              'error'
            );
            return;
          }

          await customFetch(
            'http://10.0.0.17/municipalidad/public/api/cuentas',
            'POST',
            payload
          );

          Swal.fire(
            'Confirmado',
            'El periodo ha sido confirmado y registrado en la base de datos.',
            'success'
          );
          handleConfirmPeriodo(periodo);
        }
      } catch (error) {
        console.error('Error al confirmar el periodo:', error);
        Swal.fire(
          'Error',
          'Hubo un problema al confirmar el periodo. Intente nuevamente.',
          'error'
        );
      }
    },
    [handleConfirmPeriodo]
  );

  const handleDeleteClick = useCallback(
    (periodo) => {
      Swal.fire({
        title: '¿Eliminar Periodo?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
      }).then((result) => {
        if (result.isConfirmed) {
          handleDeletePeriodo(periodo);
          Swal.fire('Eliminado', 'El periodo ha sido eliminado.', 'success');
        }
      });
    },
    [handleDeletePeriodo]
  );

  return periodos.length > 0 ? (
    <Table striped bordered hover className="mt-2">
      <thead>
        <tr>
          <th>#</th>
          <th>Cliente</th>
          <th>DNI/CUIT</th>
          <th>Volumen (m³)</th>
          <th>Tipo de Servicio</th>
          <th>Total a Pagar</th>
          <th>Cuota</th>
          <th>Mes</th>
          <th>Vencimiento</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {periodos.map((periodo, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>{periodo.clientName}</td>
            <td>{periodo.dni}</td>
            <td>
              {periodo.volume} m³ ({periodo.volume * 1000} litros)
            </td>
            <td>{periodo.service}</td>
            <td>{periodo.totalAmount}</td>
            <td>{periodo.cuota}</td>
            <td>{periodo.month}</td>
            <td>{periodo.vencimiento}</td>
            <td>
              <CustomButton
                variant="success"
                onClick={() => handleConfirmClick(periodo)}
                aria-label={`Confirmar periodo de ${periodo.clientName}`}
              >
                <FaCheck className="me-1" /> Confirmar
              </CustomButton>{' '}
              <CustomButton
                variant="danger"
                onClick={() => handleDeleteClick(periodo)}
                aria-label={`Eliminar periodo de ${periodo.clientName}`}
              >
                <FaTrash className="me-1" /> Eliminar
              </CustomButton>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  ) : (
    <div className="empty-state-container text-center mt-5">
      <FaInfoCircle className="empty-state-icon text-muted mb-3" size={60} />
      <h4 className="text-muted">No hay periodos disponibles para generar</h4>
      <p className="text-muted">
        Parece que no hay periodos de bombeo de agua creados todavía. Puedes comenzar generando uno nuevo.
      </p>
    </div>
  );
};

export default PeriodosBombeoList;
