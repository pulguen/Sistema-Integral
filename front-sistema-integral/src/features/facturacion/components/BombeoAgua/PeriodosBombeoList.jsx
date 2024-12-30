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

  /**
   * Esta función devuelve un string en formato "YYYY-MM-DD"
   * (ideal para enviarlo al backend, que lo requiere así).
   */
  const formatDateForServer = (dateString) => {
    if (!dateString) return null;

    const date = new Date(dateString);
    if (isNaN(date)) return null;

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`; // => "2024-12-31", por ejemplo
  };

  /**
   * Esta función devuelve un string en formato "DD/MM/YYYY"
   * (ideal para mostrarlo en la UI).
   */
  const formatDateForUI = (dateString) => {
    if (!dateString) return 'Sin fecha';

    const date = new Date(dateString);
    if (isNaN(date)) return 'Fecha inválida';

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');

    return `${day}/${month}/${year}`; // => "31/12/2024", por ejemplo
  };

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

          // OJO: Para enviar al backend, usamos "formatDateForServer"
          // para que quede en "YYYY-MM-DD"
          const payload = {
            cliente_id: periodo.cliente_id.toString(),
            tributo_id: '1', // Ajustalo según tu implementación
            servicio_id: periodo.servicio_id.toString(),
            año: periodo.year,
            mes: monthNameToNumber(periodo.month).toString(),
            cuota: periodo.cuota.toString(),
            f_vencimiento: formatDateForServer(periodo.vencimiento),
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

          try {
            console.log('periodo a confirmar', payload);
            await customFetch('/cuentas', 'POST', payload);

            Swal.fire(
              'Confirmado',
              'El periodo ha sido confirmado y registrado en la base de datos.',
              'success'
            );
            handleConfirmPeriodo(periodo);
          } catch (error) {
            console.error('Error al confirmar el periodo:', error);
            if (error.body && error.body.error.includes('Duplicate entry')) {
              Swal.fire(
                'Error',
                'Ya existe un periodo con los mismos detalles. Verifica la información ingresada.',
                'error'
              );
            } else {
              Swal.fire(
                'Error',
                'Hubo un problema al confirmar el periodo. Intenta nuevamente.',
                'error'
              );
            }
          }
        }
      } catch (error) {
        console.error('Error al confirmar el periodo:', error);
        Swal.fire(
          'Error',
          'Hubo un problema al confirmar el periodo. Intenta nuevamente.',
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
    <div className="table-responsive">
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
            <th>Año</th>
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
              <td>{periodo.year}</td>
              <td>
                {
                  // Para mostrar en la UI, usamos "formatDateForUI"
                  periodo.vencimiento
                    ? formatDateForUI(periodo.vencimiento)
                    : 'Sin fecha'
                }
              </td>
              <td>
                <CustomButton
                  variant="success"
                  onClick={() => handleConfirmClick(periodo)}
                  aria-label={`Confirmar periodo de ${periodo.clientName}`}
                >
                  <FaCheck className="me-1" />
                </CustomButton>{' '}
                <CustomButton
                  variant="danger"
                  onClick={() => handleDeleteClick(periodo)}
                  aria-label={`Eliminar periodo de ${periodo.clientName}`}
                >
                  <FaTrash className="me-1" />
                </CustomButton>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  ) : (
    <div className="empty-state-container text-center mt-5">
      <FaInfoCircle className="empty-state-icon text-muted mb-3" size={60} />
      <h4 className="text-muted">No hay periodos disponibles para generar</h4>
      <p className="text-muted">
        Parece que no hay periodos de bombeo de agua creados todavía.
        Puedes comenzar generando uno nuevo.
      </p>
    </div>
  );
};

export default PeriodosBombeoList;
