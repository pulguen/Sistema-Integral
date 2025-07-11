import React from 'react';
import CustomButton from '../../../../components/common/botons/CustomButton.jsx';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { formatDateToDMY } from '../../../../utils/dateUtils.js';

export default function DetalleClienteDisplay({
  cliente,
  onEditMode,
  hasPermission,
  handleDelete
}) {
  const tipo = cliente.clientable_type
    ? cliente.clientable_type.split("\\").pop()
    : 'Desconocido';

  const isPersona = tipo.toLowerCase() === 'persona';
  const isEmpresa = tipo.toLowerCase() === 'empresa' || tipo.toLowerCase() === 'jurídico';
  const fechaNacimientoRaw =
    cliente.persona?.f_nacimiento ||
    cliente.clientable?.f_nacimiento ||
    '';
  const fechaNacimiento = fechaNacimientoRaw
    ? formatDateToDMY(fechaNacimientoRaw)
    : 'No disponible';

  const dir = cliente.direccion || {};
  return (
    <>
      <p><strong>Tipo de Cliente:</strong> {tipo}</p>
      {isPersona && (
        <>
          <p><strong>Nombre:</strong> {cliente.persona?.nombre || '—'}</p>
          <p><strong>Apellido:</strong> {cliente.persona?.apellido || '—'}</p>
          <p><strong>DNI:</strong> {cliente.persona?.dni || '—'}</p>
        </>
      )}
      {isEmpresa && (
        <>
          <p><strong>Razón Social:</strong> {cliente.persona?.nombre || '—'}</p>
          <p><strong>CUIT:</strong> {cliente.persona?.dni || '—'}</p>
        </>
      )}
      <p><strong>Email:</strong> {cliente.persona?.email || '—'}</p>
      <p><strong>Teléfono:</strong> {cliente.persona?.telefono || '—'}</p>
      {isPersona && (
        <p><strong>Fecha de Nacimiento:</strong> {fechaNacimiento}</p>
      )}
      <hr />
      <h4 className="text-primary">Direccion</h4>
      <p><strong>Provincia:</strong> {dir.provincia?.nombre || 'Sin provincia'}</p>
      <p><strong>Municipio:</strong> {dir.municipio?.nombre || 'Sin municipio'}</p>
      <p><strong>Calle:</strong> {dir.calle?.nombre || 'Sin calle'}</p>
      <p><strong>Altura:</strong> {dir.altura ?? 'Sin altura'}</p>
      <p><strong>Código Postal:</strong> {dir.codigo_postal || '—'}</p>
      <p><strong>N° Casa:</strong> {dir.n_casa || '—'}</p>
      <p><strong>Piso:</strong> {dir.n_piso || '—'}</p>
      <p><strong>Depto:</strong> {dir.n_departamento || '—'}</p>
      <p><strong>¿Es esquina?:</strong> {dir.es_esquina ? 'Sí' : 'No'}</p>
      {dir.es_esquina && (
        <p><strong>Calle Esquina:</strong> {dir.calle_esquina?.nombre || '—'}</p>
      )}
      <p><strong>Referencia:</strong> {dir.referencia || '—'}</p>
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
