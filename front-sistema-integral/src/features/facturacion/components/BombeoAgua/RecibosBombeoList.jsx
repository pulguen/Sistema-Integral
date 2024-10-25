import React from 'react';
import { Table } from 'react-bootstrap';
import { FaTrash, FaCheck, FaInfoCircle } from 'react-icons/fa';
import CustomButton from '../../../../components/common/botons/CustomButton';
import Swal from 'sweetalert2';
import '../../../../styles/EmptyState.css';
import customFetch from '../../../../context/CustomFetch.js';

const RecibosBombeoList = ({ recibos, onConfirmRecibo, onDeleteRecibo }) => {
  const confirmRecibo = async (recibo) => {
    try {
      const confirmResult = await Swal.fire({
        title: '¿Confirmar Recibo?',
        text: "No podrás revertir esta acción.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, confirmar',
      });

      if (confirmResult.isConfirmed) {
        if (!recibo.cliente_id || !recibo.vencimiento || !recibo.periodos || recibo.periodos.length === 0) {
          Swal.fire('Error', 'Faltan datos obligatorios para confirmar el recibo.', 'error');
          return;
        }

        const formatVencimiento = (vencimiento) => {
          const date = new Date(vencimiento);
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        };

        const newRecibosData = {
          cliente_id: recibo.cliente_id.toString(),
          cuenta_corriente: recibo.periodos.map(periodo => periodo.id.toString()),
          f_vencimiento: formatVencimiento(recibo.vencimiento),
        };

        await customFetch(
          'http://10.0.0.17/municipalidad/public/api/recibos',
          'POST',
          newRecibosData
        );

        Swal.fire('Confirmado!', 'El recibo ha sido confirmado.', 'success');
        onConfirmRecibo(newRecibosData);
      }
    } catch (error) {
      console.error('Error al confirmar el recibo:', error);
      Swal.fire('Error', 'Hubo un problema al confirmar el recibo.', 'error');
    }
  };

  const deleteRecibo = (recibo) => {
    Swal.fire({
      title: '¿Eliminar Recibo?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          onDeleteRecibo(recibo);
          Swal.fire('Eliminado!', 'El recibo ha sido eliminado.', 'success');
        } catch (error) {
          console.error('Error al eliminar el recibo:', error);
          Swal.fire('Error', 'Hubo un problema al intentar eliminar el recibo.', 'error');
        }
      }
    });
  };

  return recibos.length > 0 ? (
    <Table striped bordered hover className="mt-5">
      <thead>
        <tr>
          <th>#</th>
          <th>Cliente</th>
          <th>DNI/CUIT</th>
          <th>Total a Pagar</th>
          <th>Vencimiento</th>
          <th>Períodos Incluidos</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {recibos.map((recibo, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>{recibo.cliente_nombre} {recibo.cliente_apellido}</td>
            <td>{recibo.cliente_dni}</td>
            <td>{`AR$ ${recibo.totalAmount.toFixed(2)}`}</td>
            <td>{new Date(recibo.vencimiento).toLocaleDateString()}</td>
            <td>
              {recibo.periodos.map((periodo, i) => (
                <span key={i}>
                  {periodo.mes}/{periodo.año}
                  {i < recibo.periodos.length - 1 ? ', ' : ''}
                </span>
              ))}
            </td>
            <td>
              <CustomButton variant="success" onClick={() => confirmRecibo(recibo)}>
                <FaCheck className="me-1" /> Confirmar
              </CustomButton>{' '}
              <CustomButton variant="danger" onClick={() => deleteRecibo(recibo)}>
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
      <h4 className="text-muted">No hay recibos disponibles</h4>
      <p className="text-muted">Parece que no hay recibos generados todavía. Puedes comenzar creando uno nuevo.</p>
    </div>
  );
};

export default RecibosBombeoList;
