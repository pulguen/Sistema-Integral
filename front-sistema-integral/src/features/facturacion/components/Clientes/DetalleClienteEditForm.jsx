import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import CustomButton from '../../../../components/common/botons/CustomButton.jsx';
import { FaSave, FaPlus } from 'react-icons/fa';

const DetalleClienteEditForm = ({
  cliente,
  editedCliente,
  handleEditedChange,
  handleEditCliente,
  handleAddNewCalle,
  cancelEdit,
  provincias = [],
  municipios = [],
  calles = [],
}) => {
  // Determinar tipo de cliente (Persona/Empresa) según el modelo recibido
  const [clientType, setClientType] = useState('');

  useEffect(() => {
    if (cliente?.clientable_type) {
      if (String(cliente.clientable_type).toLowerCase().includes('persona')) {
        setClientType('Persona');
      } else if (String(cliente.clientable_type).toLowerCase().includes('empresa')) {
        setClientType('Empresa');
      } else {
        setClientType('');
      }
    }
  }, [cliente]);

  return (
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Tipo de Cliente</Form.Label>
        <Form.Control as="select" value={clientType} disabled>
          <option value="">Seleccione el tipo de cliente</option>
          <option value="Persona">Persona</option>
          <option value="Empresa">Empresa</option>
        </Form.Control>
      </Form.Group>

      {clientType === 'Persona' && (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={editedCliente.nombre || ''}
              onChange={handleEditedChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Apellido</Form.Label>
            <Form.Control
              type="text"
              name="apellido"
              value={editedCliente.apellido || ''}
              onChange={handleEditedChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>DNI</Form.Label>
            <Form.Control
              type="text"
              name="dni"
              value={editedCliente.dni || ''}
              onChange={handleEditedChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={editedCliente.email || ''}
              onChange={handleEditedChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="text"
              name="telefono"
              value={editedCliente.telefono || ''}
              onChange={handleEditedChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Fecha de Nacimiento</Form.Label>
            <Form.Control
              type="date"
              name="f_nacimiento"
              value={editedCliente.f_nacimiento || ''}
              onChange={handleEditedChange}
              required
            />
          </Form.Group>
        </>
      )}

      {clientType === 'Empresa' && (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Razón Social</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={editedCliente.nombre || ''}
              onChange={handleEditedChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>CUIT</Form.Label>
            <Form.Control
              type="text"
              name="dni"
              value={editedCliente.dni || ''}
              onChange={handleEditedChange}
              required
            />
          </Form.Group>
        </>
      )}

      <Form.Group className="mb-3">
        <Form.Label>Provincia</Form.Label>
        <Form.Control
          as="select"
          name="provincia_id"
          value={editedCliente.provincia_id || ''}
          onChange={handleEditedChange}
          required
        >
          <option value="">Seleccione una provincia</option>
          {(provincias || []).map((p) => (
            <option key={p.id} value={p.id.toString()}>
              {p.nombre}
            </option>
          ))}
        </Form.Control>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Municipio</Form.Label>
        <Form.Control
          as="select"
          name="municipio_id"
          value={editedCliente.municipio_id || ''}
          onChange={handleEditedChange}
          disabled={!editedCliente.provincia_id}
          required
        >
          <option value="">
            {editedCliente.provincia_id
              ? 'Seleccione un municipio'
              : 'Seleccione provincia primero'}
          </option>
          {(municipios || [])
            .filter((m) => String(m.provincia_id) === String(editedCliente.provincia_id))
            .map((m) => (
              <option key={m.id} value={m.id.toString()}>
                {m.nombre}
              </option>
            ))}
        </Form.Control>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Calle</Form.Label>
        <Form.Control
          as="select"
          name="calle_id"
          value={editedCliente.calle_id || ''}
          onChange={handleEditedChange}
          disabled={!editedCliente.municipio_id}
          required
        >
          <option value="">Seleccione una calle</option>
          {(calles || []).map((calle) => (
            <option key={calle.id} value={calle.id.toString()}>
              {calle.nombre}
            </option>
          ))}
        </Form.Control>
        <Button variant="link" onClick={handleAddNewCalle} className="p-0">
          <FaPlus /> Agregar nueva calle
        </Button>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Altura</Form.Label>
        <Form.Control
          type="number"
          name="altura"
          value={editedCliente.altura || ''}
          onChange={handleEditedChange}
          required
        />
      </Form.Group>

      <div className="d-flex justify-content-end mt-4">
        <CustomButton variant="secondary" className="me-3" onClick={cancelEdit}>
          Cancelar
        </CustomButton>
        <CustomButton variant="primary" onClick={handleEditCliente}>
          <FaSave /> Guardar Cambios
        </CustomButton>
      </div>
    </Form>
  );
};

export default DetalleClienteEditForm;
