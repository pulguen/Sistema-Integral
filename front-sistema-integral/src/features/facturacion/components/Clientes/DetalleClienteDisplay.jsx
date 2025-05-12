// src/pages/facturacion/DetalleClienteDisplay.jsx
import React from 'react';
import CustomButton from '../../../../components/common/botons/CustomButton.jsx';
import { FaEdit, FaTrash } from 'react-icons/fa';

export default function DetalleClienteDisplay({
  cliente,
  onEditMode,
  hasPermission,
  handleDelete
}) {
  const tipo = cliente.clientable_type
    ? cliente.clientable_type.split("\\").pop()
    : 'Desconocido';

  const fechaNacimiento = cliente.persona?.f_nacimiento
    ? new Date(cliente.persona.f_nacimiento).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'No disponible';

  return (
    <>
      <p><strong>Tipo de Cliente:</strong> {tipo}</p>
      <p><strong>Nombre:</strong> {cliente.persona?.nombre || '—'}</p>
      {tipo.toLowerCase() !== 'jurídico' && (
        <p><strong>Apellido:</strong> {cliente.persona?.apellido || '—'}</p>
      )}
      <p><strong>DNI/CUIT:</strong> {cliente.persona?.dni || '—'}</p>
      <p><strong>Email:</strong> {cliente.persona?.email || '—'}</p>
      <p><strong>Teléfono:</strong> {cliente.persona?.telefono || '—'}</p>
      <p><strong>Fecha de Nacimiento:</strong> {fechaNacimiento}</p>
      <p>
        <strong>Provincia:</strong>{" "}
        {cliente.direccion?.provincia?.nombre || 'Sin provincia'}
      </p>
      <p>
        <strong>Municipio:</strong>{" "}
        {cliente.direccion?.municipio?.nombre || 'Sin municipio'}
      </p>
      <p>
        <strong>Calle:</strong>{" "}
        {cliente.direccion?.calle?.nombre || 'Sin calle'}
      </p>
      <p>
        <strong>Altura:</strong>{" "}
        {cliente.direccion?.altura ?? 'Sin altura'}
      </p>

      <div className="d-flex mt-3">
        <CustomButton
          variant="warning"
          onClick={onEditMode}
          disabled={!hasPermission('clientes.update')}
          className="me-2"
        >
          <FaEdit /> Modificar
        </CustomButton>
        <CustomButton
          variant="danger"
          onClick={handleDelete}
          disabled={!hasPermission('clientes.destroy')}
        >
          <FaTrash /> Eliminar
        </CustomButton>
      </div>
    </>
  );
}
