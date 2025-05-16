// src/features/facturacion/components/BombeoAgua/PeriodosBombeoList.jsx
import React, { useContext, useCallback } from 'react';
import { Table } from 'react-bootstrap';
import { FaTrash, FaCheck, FaInfoCircle } from 'react-icons/fa';
import CustomButton from '../../../../components/common/botons/CustomButton';
import Swal from 'sweetalert2';
import '../../../../styles/EmptyState.css';
import customFetch from '../../../../context/CustomFetch';
import { BombeoAguaContext } from '../../../../context/BombeoAguaContext';

const PeriodosBombeoList = () => {
  const {
    periodos,            // Períodos pendientes de confirmar
    homePeriodos,        // Historial cargado al seleccionar cliente
    handleConfirmPeriodo,
    handleDeletePeriodo
  } = useContext(BombeoAguaContext);

  // → YYYY-MM-DD (ya en formato ISO)  
  const formatDateForServer = (dateString) => {
    if (!dateString) return null;
    const d = new Date(dateString);
    if (isNaN(d)) return null;
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // → DD/MM/YYYY para UI
  const formatDateForUI = (dateString) => {
    if (!dateString) return 'Sin fecha';
    const d = new Date(dateString);
    if (isNaN(d)) return 'Fecha inválida';
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = d.getUTCFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  // map mes nombre → número
  const monthNameToNumber = (name) => ({
    Enero:1,Febrero:2,Marzo:3,Abril:4,Mayo:5,Junio:6,
    Julio:7,Agosto:8,Septiembre:9,Octubre:10,Noviembre:11,Diciembre:12
  }[name] || 0);

  const handleConfirmClick = useCallback(
    async (p) => {
      const { isConfirmed } = await Swal.fire({
        title: '¿Confirmar Periodo?',
        text: 'No podrás revertir esta acción.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, confirmar',
      });
      if (!isConfirmed) return;

      const mesNum = monthNameToNumber(p.month);

      // ① Chequear duplicado LOCAL
      const existe = homePeriodos.some(h =>
        h.cliente_id === p.cliente_id &&
        h.servicio_id === p.servicio_id &&
        Number(h.año) === Number(p.year) &&
        Number(h.mes) === mesNum &&
        Number(h.cuota) === Number(p.cuota)
      );
      if (existe) {
        return Swal.fire('Duplicado', 'Ya existe un periodo igual en el historial.', 'info');
      }

      // ② Armar payload
      const payload = {
        cliente_id: String(p.cliente_id),
        tributo_id: '1',
        servicio_id: String(p.servicio_id),
        año: p.year,
        mes: String(mesNum),
        cuota: String(p.cuota),
        f_vencimiento: formatDateForServer(p.vencimiento),
        cant: String(p.volume),
      };

      // ③ Validar antes de enviar
      if (
        !payload.cliente_id ||
        !payload.servicio_id ||
        !payload.mes ||
        !payload.cuota ||
        !payload.cant ||
        !payload.f_vencimiento
      ) {
        return Swal.fire('Error', 'Faltan campos obligatorios.', 'error');
      }

      // ④ POST al backend
      try {
        await customFetch('/cuentas', 'POST', payload);
        Swal.fire('Confirmado', 'Periodo registrado correctamente.', 'success');
        handleConfirmPeriodo(p);
      } catch (err) {
        console.error('Error al confirmar periodo:', err);
        Swal.fire('Error', 'No se pudo confirmar el periodo. Intenta de nuevo.', 'error');
      }
    },
    [homePeriodos, handleConfirmPeriodo]
  );

  const handleDeleteClick = useCallback(
    (p) => {
      Swal.fire({
        title: '¿Eliminar Periodo?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
      }).then(({ isConfirmed }) => {
        if (isConfirmed) {
          handleDeletePeriodo(p);
          Swal.fire('Eliminado', 'Periodo eliminado de la lista.', 'success');
        }
      });
    },
    [handleDeletePeriodo]
  );

  return periodos.length > 0 ? (
    <div className="table-responsive">
      <h3 className="mt-4">Vista Previa de datos para el Periodo</h3>
      <Table striped bordered hover className="mt-2">
        <thead>
          <tr>
            <th>#</th>
            <th>Cliente</th>
            <th>DNI/CUIT</th>
            <th>Volumen (m³)</th>
            <th>Servicio</th>
            <th>Total</th>
            <th>Cuota</th>
            <th>Mes</th>
            <th>Año</th>
            <th>Vencimiento</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {periodos.map((p, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{p.clientName}</td>
              <td>{p.dni}</td>
              <td>{p.volume} m³</td>
              <td>{p.service}</td>
              <td>{p.totalAmount}</td>
              <td>{p.cuota}</td>
              <td>{p.month}</td>
              <td>{p.year}</td>
              <td>{p.vencimiento ? formatDateForUI(p.vencimiento) : 'Sin fecha'}</td>
              <td>
                <CustomButton variant="success" onClick={() => handleConfirmClick(p)}>
                  <FaCheck />
                </CustomButton>{' '}
                <CustomButton variant="danger" onClick={() => handleDeleteClick(p)}>
                  <FaTrash />
                </CustomButton>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  ) : (
    <div className="empty-state-container text-center mt-5">
      <FaInfoCircle size={60} className="text-muted mb-3" />
      <h4 className="text-muted">No hay periodos para confirmar</h4>
      <p className="text-muted">
        Genera uno arriba y luego podrás confirmarlo.
      </p>
    </div>
  );
};

export default PeriodosBombeoList;
