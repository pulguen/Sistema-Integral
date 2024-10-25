// src/features/facturacion/components/BombeoAgua/PeriodosBombeoList.jsx
import React, { useContext } from 'react';
import { Table } from 'react-bootstrap';
import { FaTrash, FaCheck, FaInfoCircle } from 'react-icons/fa';
import CustomButton from '../../../../components/common/botons/CustomButton';
import Swal from 'sweetalert2';
import '../../../../styles/EmptyState.css'; 
import customFetch from '../../../../context/CustomFetch.js';
import { BombeoAguaContext } from '../../../../context/BombeoAguaContext.jsx';

const PeriodosBombeoList = () => {
  const { facturas, handleConfirmInvoice, handleDeleteInvoice } = useContext(BombeoAguaContext);

  const facturaList = Array.isArray(facturas) ? facturas : [];

  const handleConfirmClick = async (factura) => {
    try {
      const confirmResult = await Swal.fire({
        title: '¿Confirmar Periodo?',
        text: "No podrás revertir esta acción.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, confirmar',
      });
  
      if (confirmResult.isConfirmed) {
        // Convertir el mes de nombre a número
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
  
        // Función para formatear la fecha de vencimiento
        const formatVencimiento = (vencimiento) => {
          const date = new Date(vencimiento);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`; // Y-m-d formato requerido
        };
  
        // Crear el payload asegurando que todos los campos están presentes y bien formateados
        const payload = {
          cliente_id: factura.cliente_id.toString(),
          tributo_id: '1', // Fijo según tu implementación
          servicio_id: factura.servicio_id.toString(),
          año: new Date().getFullYear().toString(),
          mes: monthNameToNumber(factura.month).toString(),
          cuota: factura.cuota.toString(),
          f_vencimiento: formatVencimiento(factura.vencimiento),
          cant: factura.volume.toString(),
        };
  
        console.log("Payload enviado:", payload); // Imprimir el payload para verificar
  
        // Validar los campos del payload
        if (!payload.cliente_id || !payload.servicio_id || !payload.mes || !payload.cuota || !payload.cant || !payload.f_vencimiento) {
          Swal.fire('Error', 'Algunos campos requeridos están vacíos. Por favor verifica la información del periodo.', 'error');
          return;
        }
  
        // Enviar el payload al servidor
        await customFetch(
          'http://10.0.0.17/municipalidad/public/api/cuentas',
          'POST',
          payload
        );
        
        Swal.fire('Confirmado!', 'El periodo ha sido confirmado y registrado en la base de datos.', 'success');
        handleConfirmInvoice(factura);
      }
    } catch (error) {
      console.error('Error al confirmar el periodo:', error);
      Swal.fire('Error', 'Hubo un problema al confirmar el periodo. Intente nuevamente.', 'error');
    }
  };

  const handleDeleteClick = (factura) => {
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
        handleDeleteInvoice(factura); 
        Swal.fire('Eliminado!', 'El periodo ha sido eliminado.', 'success');
      }
    });
  };

  return facturaList.length > 0 ? (
    <Table striped bordered hover className="mt-2">
      <thead>
        <tr>
          <th>#</th>
          <th>Cliente</th>
          <th>DNI/CIUT</th>
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
        {facturaList.map((factura, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>{factura.clientName}</td>
            <td>{factura.dni}</td>
            <td>{factura.volume} m³ ({factura.volume * 1000} litros)</td>
            <td>{factura.service}</td>
            <td>{factura.totalAmount}</td>
            <td>{factura.cuota}</td>
            <td>{factura.month}</td>
            <td>{factura.vencimiento}</td>
            <td>
              <CustomButton variant="success" onClick={() => handleConfirmClick(factura)}>
                <FaCheck className="me-1" /> Confirmar
              </CustomButton>{' '}
              <CustomButton variant="danger" onClick={() => handleDeleteClick(factura)}>
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
      <p className="text-muted">Parece que no hay periodos de bombeo de agua creados todavía. Puedes comenzar generando uno nuevo.</p>
    </div>
  );
};

export default PeriodosBombeoList;