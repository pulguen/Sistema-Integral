import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Table, Form, Breadcrumb, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
import CustomButton from '../../../../components/common/botons/CustomButton.jsx';
import { FaEdit, FaTrash, FaSave } from 'react-icons/fa';
import Loading from '../../../../components/common/loading/Loading.jsx';
import customFetch from '../../../../context/CustomFetch.js';
import { AuthContext } from '../../../../context/AuthContext';

const unpackData = (data) => {
  if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
    return data[0];
  }
  return data;
};

export default function ClienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estado principal del cliente
  const [cliente, setCliente] = useState(null);

  // Listas para selects
  const [clienteTipos, setClienteTipos] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [calles, setCalles] = useState([]);
  const [serviciosDisponibles, setServiciosDisponibles] = useState([]);

  // Servicios asignados (IDs)
  const [serviciosAsignados, setServiciosAsignados] = useState([]);

  // Modo edición y estado del formulario de edición
  const [editMode, setEditMode] = useState(false);
  const [editedCliente, setEditedCliente] = useState({
    tipo_cliente: '',
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    telefono: '',
    f_nacimiento: '',
    provincia_id: '',
    municipio_id: '',
    calle_id: '',
    altura: '',
  });

  // Permisos
  const { user } = useContext(AuthContext);
  const hasPermission = useCallback(
    (perm) => user?.permissions?.includes(perm),
    [user?.permissions]
  );

  // ------------------ FUNCIONES DE FETCH ------------------

  const fetchCliente = useCallback(async () => {
    try {
      // Llamada a la API
      const data = await customFetch(`/clientes/${id}`, 'GET');
      console.log('[fetchCliente] Respuesta original:', data);

      // OBTÉN PERSONA Y DIRECCION DESDE data.persona
      const { persona = {} } = data;
      const { direccion = {} } = persona;

      // Combina datos para la vista
      const combined = { ...data, ...persona, ...direccion };
      console.log('[fetchCliente] Datos combinados:', combined);
      setCliente(combined);

      // Para el formulario de edición, asigna los datos que vienen de persona/direccion
      setEditedCliente({
        tipo_cliente: data.cliente_tipo_id ? String(data.cliente_tipo_id) : '',
        nombre: persona.nombre || '',
        apellido: persona.apellido || '',
        dni: persona.dni ? String(persona.dni) : '',
        email: persona.email || '',
        telefono: persona.telefono ? String(persona.telefono) : '',
        f_nacimiento: persona.f_nacimiento || '',

        // NOTA: Extraemos los IDs desde direccion.provincia, direccion.municipio, etc.
        provincia_id: direccion.provincia ? String(direccion.provincia.id) : '',
        municipio_id: direccion.municipio ? String(direccion.municipio.id) : '',
        calle_id: direccion.calle ? String(direccion.calle.id) : '',
        altura: direccion.altura ? String(direccion.altura) : '',
      });

      // Servicios asignados
      if (data.servicios) {
        const servIDs = data.servicios.map((s) => s.id);
        setServiciosAsignados(servIDs);
      }
    } catch (err) {
      console.error('[fetchCliente] Error:', err);
      Swal.fire('Error', 'Error al obtener el cliente.', 'error');
    }
  }, [id]);

  const fetchClienteTipos = useCallback(async () => {
    try {
      const tiposData = await customFetch('/cliente-tipos', 'GET');
      const tipos = unpackData(tiposData);
      setClienteTipos(tipos);
    } catch (err) {
      console.error('[fetchClienteTipos] Error:', err);
    }
  }, []);

  const fetchProvincias = useCallback(async () => {
    try {
      const provData = await customFetch('/provincias', 'GET');
      const provs = unpackData(provData);
      setProvincias(provs);
    } catch (err) {
      console.error('[fetchProvincias] Error:', err);
    }
  }, []);

  const fetchMunicipios = useCallback(async () => {
    try {
      const munData = await customFetch('/municipios', 'GET');
      const muns = unpackData(munData);
      setMunicipios(muns);
    } catch (err) {
      console.error('[fetchMunicipios] Error:', err);
    }
  }, []);

  const fetchCalles = useCallback(async () => {
    try {
      const callData = await customFetch('/calles', 'GET');
      const cls = unpackData(callData);
      setCalles(cls);
    } catch (err) {
      console.error('[fetchCalles] Error:', err);
    }
  }, []);

  const fetchServicios = useCallback(async () => {
    try {
      const servData = await customFetch('/servicios', 'GET');
      const servs = unpackData(servData);
      setServiciosDisponibles(servs);
    } catch (err) {
      console.error('[fetchServicios] Error:', err);
    }
  }, []);

  useEffect(() => {
    fetchCliente();
    fetchClienteTipos();
    fetchProvincias();
    fetchMunicipios();
    fetchCalles();
    fetchServicios();
  }, [
    fetchCliente,
    fetchClienteTipos,
    fetchProvincias,
    fetchMunicipios,
    fetchCalles,
    fetchServicios,
  ]);

  // ------------------ FUNCIONES DE EDICIÓN ------------------

  const handleEditedChange = (e) => {
    const { name, value } = e.target;
    console.log('[handleEditedChange]', name, value);

    // Si cambio provincia, limpio municipio y calle
    if (name === 'provincia_id') {
      setEditedCliente((prev) => ({
        ...prev,
        provincia_id: value,
        municipio_id: '',
        calle_id: '',
      }));
    } else if (name === 'municipio_id') {
      // Si cambio municipio, limpio calle
      setEditedCliente((prev) => ({
        ...prev,
        municipio_id: value,
        calle_id: '',
      }));
    } else {
      setEditedCliente((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditCliente = async () => {
    try {
      const updatedData = {
        id: cliente.id,
        nombre: editedCliente.nombre,
        apellido: editedCliente.apellido,
        f_nacimiento: editedCliente.f_nacimiento,
        dni: editedCliente.dni ? parseInt(editedCliente.dni, 10) : null,
        email: editedCliente.email,
        telefono: editedCliente.telefono,
        cliente_tipo_id: editedCliente.tipo_cliente,
        provincia_id: editedCliente.provincia_id
          ? Number(editedCliente.provincia_id)
          : null,
        municipio_id: editedCliente.municipio_id
          ? Number(editedCliente.municipio_id)
          : null,
        calle_id: editedCliente.calle_id
          ? Number(editedCliente.calle_id)
          : null,
        altura: editedCliente.altura ? parseInt(editedCliente.altura, 10) : null,
      };
      console.log('[handleEditCliente] Datos a enviar:', updatedData);

      // PUT a la API
      await customFetch(`/clientes/${id}`, 'PUT', updatedData);
      Swal.fire('Éxito', 'Cliente modificado correctamente.', 'success');

      // Actualiza el estado principal con los nuevos datos
      setCliente((prev) => ({
        ...prev,
        ...updatedData,
      }));
      setEditMode(false);
    } catch (err) {
      console.error('[handleEditCliente] Error:', err);
      Swal.fire('Error', `Error al modificar el cliente: ${err.message}`, 'error');
    }
  };

  // ------------------ ASIGNAR SERVICIOS ------------------

  const handleCheckboxChange = (servicioId) => {
    setServiciosAsignados((prev) => {
      if (prev.includes(servicioId)) {
        const newSelected = prev.filter((id) => id !== servicioId);
        console.log('[handleCheckboxChange] Servicios actualizados:', newSelected);
        return newSelected;
      }
      const newSelected = [...prev, servicioId];
      console.log('[handleCheckboxChange] Servicios actualizados:', newSelected);
      return newSelected;
    });
  };

  const handleAsignarServicios = async () => {
    if (serviciosAsignados.length === 0) {
      Swal.fire('Error', 'Debe seleccionar al menos un servicio.', 'error');
      return;
    }
    try {
      console.log('[handleAsignarServicios] Servicios a asignar:', serviciosAsignados);
      await customFetch(`/clientes/${id}/serv-sinc`, 'POST', {
        servicios: serviciosAsignados,
      });
      Swal.fire('Éxito', 'Servicios asignados correctamente.', 'success');
      setCliente((prev) => ({
        ...prev,
        servicios: serviciosDisponibles.filter((s) =>
          serviciosAsignados.includes(s.id)
        ),
      }));
    } catch (err) {
      console.error('[handleAsignarServicios] Error:', err);
      Swal.fire('Error', 'Hubo un problema al asignar los servicios.', 'error');
    }
  };

  // ------------------ ELIMINAR CLIENTE ------------------

  const handleDeleteCliente = async () => {
    try {
      const confirmResult = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'No podrás revertir esta acción',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      });
      if (confirmResult.isConfirmed) {
        await customFetch(`/clientes/${id}`, 'DELETE');
        Swal.fire('Eliminado', 'El cliente ha sido eliminado.', 'success');
        navigate('/facturacion/clientes');
      }
    } catch (err) {
      console.error('[handleDeleteCliente] Error:', err);
      Swal.fire('Error', 'Hubo un problema al eliminar el cliente.', 'error');
    }
  };

  // ------------------ RENDER ------------------

  if (!cliente) {
    return <Loading />;
  }

  return (
    <Card className="p-4">
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/facturacion/clientes' }}>
          Gestión de Clientes
        </Breadcrumb.Item>
        <Breadcrumb.Item active>
          {cliente.nombre} {cliente.apellido}
        </Breadcrumb.Item>
      </Breadcrumb>

      <Row>
        <Col md={6}>
          <h4 className="text-primary">Datos del Cliente</h4>
          {!editMode ? (
            <>
              <p>
                <strong>Nombre:</strong> {cliente.nombre}
              </p>
              <p>
                <strong>Apellido:</strong> {cliente.apellido}
              </p>
              <p>
                <strong>DNI/CIUT:</strong> {cliente.dni}
              </p>
              <p>
                <strong>Teléfono:</strong> {cliente.telefono}
              </p>
              <p>
                <strong>Email:</strong> {cliente.email}
              </p>
              <p>
                <strong>Fecha de Nacimiento:</strong> {cliente.f_nacimiento}
              </p>
              <p>
                <strong>Tipo de Cliente:</strong>{' '}
                {cliente.tipo?.nombre || 'Desconocido'}
              </p>
              <p>
                <strong>Provincia:</strong>{' '}
                {cliente.provincia?.nombre || 'Sin provincia'}
              </p>
              <p>
                <strong>Municipio:</strong>{' '}
                {cliente.municipio?.nombre || 'Sin municipio'}
              </p>
              <p>
                <strong>Calle:</strong>{' '}
                {cliente.calle?.nombre || 'Sin calle'}{' '}
                {cliente.altura ? `- ${cliente.altura}` : ''}
              </p>

              <CustomButton
                variant="warning"
                className="mt-3"
                onClick={() => setEditMode(true)}
                disabled={!hasPermission('clientes.update')}
              >
                <FaEdit /> Modificar Datos
              </CustomButton>
              <CustomButton
                variant="danger"
                className="mt-3 ms-3"
                onClick={handleDeleteCliente}
                disabled={!hasPermission('clientes.destroy')}
              >
                <FaTrash /> Eliminar Cliente
              </CustomButton>
            </>
          ) : (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Tipo de Cliente</Form.Label>
                <Form.Control
                  as="select"
                  name="tipo_cliente"
                  value={editedCliente.tipo_cliente}
                  onChange={handleEditedChange}
                  required
                >
                  <option value="">Seleccione el tipo de cliente</option>
                  {clienteTipos.map((tipo) => (
                    <option key={tipo.id} value={tipo.id.toString()}>
                      {tipo.nombre}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={editedCliente.nombre}
                  onChange={handleEditedChange}
                  required
                />
              </Form.Group>

              {(() => {
                const tipoEncontrado = clienteTipos.find(
                  (t) => String(t.id) === String(editedCliente.tipo_cliente)
                );
                if (
                  tipoEncontrado &&
                  tipoEncontrado.nombre.toLowerCase() === 'físico'
                ) {
                  return (
                    <Form.Group className="mb-3">
                      <Form.Label>Apellido</Form.Label>
                      <Form.Control
                        type="text"
                        name="apellido"
                        value={editedCliente.apellido}
                        onChange={handleEditedChange}
                        required
                      />
                    </Form.Group>
                  );
                }
                return null;
              })()}

              <Form.Group className="mb-3">
                <Form.Label>DNI/CUIT</Form.Label>
                <Form.Control
                  type="text"
                  name="dni"
                  value={editedCliente.dni}
                  onChange={handleEditedChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={editedCliente.email}
                  onChange={handleEditedChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="text"
                  name="telefono"
                  value={editedCliente.telefono}
                  onChange={handleEditedChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Fecha de Nacimiento</Form.Label>
                <Form.Control
                  type="date"
                  name="f_nacimiento"
                  value={editedCliente.f_nacimiento}
                  onChange={handleEditedChange}
                  required
                />
              </Form.Group>

              {/* Select de Provincia */}
              <Form.Group className="mb-3">
                <Form.Label>Provincia</Form.Label>
                <Form.Control
                  as="select"
                  name="provincia_id"
                  value={editedCliente.provincia_id}
                  onChange={handleEditedChange}
                  required
                >
                  <option value="">Seleccione una provincia</option>
                  {provincias.map((p) => (
                    <option key={p.id} value={p.id.toString()}>
                      {p.nombre}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              {/* Select de Municipio */}
              <Form.Group className="mb-3">
                <Form.Label>Municipio</Form.Label>
                <Form.Control
                  as="select"
                  name="municipio_id"
                  value={editedCliente.municipio_id}
                  onChange={handleEditedChange}
                  disabled={!editedCliente.provincia_id}
                  required
                >
                  <option value="">
                    {editedCliente.provincia_id
                      ? 'Seleccione un municipio'
                      : 'Seleccione provincia primero'}
                  </option>
                  {municipios
                    .filter(
                      (m) => m.provincia_id === Number(editedCliente.provincia_id)
                    )
                    .map((m) => (
                      <option key={m.id} value={m.id.toString()}>
                        {m.nombre}
                      </option>
                    ))}
                </Form.Control>
              </Form.Group>

              {/* Select de Calle */}
              <Form.Group className="mb-3">
                <Form.Label>Calle</Form.Label>
                <Form.Control
                  as="select"
                  name="calle_id"
                  value={editedCliente.calle_id}
                  onChange={handleEditedChange}
                  disabled={!editedCliente.municipio_id}
                  required
                >
                  <option value="">
                    {editedCliente.municipio_id
                      ? 'Seleccione una calle'
                      : 'Seleccione municipio primero'}
                  </option>
                  {calles
                    .filter(
                      (c) => c.municipio_id === Number(editedCliente.municipio_id)
                    )
                    .map((c) => (
                      <option key={c.id} value={c.id.toString()}>
                        {c.nombre}
                      </option>
                    ))}
                </Form.Control>
              </Form.Group>

              {/* Input para Altura */}
              <Form.Group className="mb-3">
                <Form.Label>Altura</Form.Label>
                <Form.Control
                  type="number"
                  name="altura"
                  value={editedCliente.altura}
                  onChange={handleEditedChange}
                  required
                />
              </Form.Group>

              <div className="d-flex justify-content-end mt-4">
                <CustomButton
                  variant="secondary"
                  className="me-3"
                  onClick={() => setEditMode(false)}
                >
                  Cancelar
                </CustomButton>
                <CustomButton
                  variant="primary"
                  onClick={handleEditCliente}
                  disabled={!hasPermission('clientes.update')}
                >
                  <FaSave /> Guardar Cambios
                </CustomButton>
              </div>
            </Form>
          )}
        </Col>

        <Col md={6}>
          <h4 className="text-primary">Servicios Asignados</h4>
          {cliente.servicios && cliente.servicios.length > 0 ? (
            <Table striped bordered hover className="mt-3">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Servicio</th>
                </tr>
              </thead>
              <tbody>
                {cliente.servicios.map((serv, index) => (
                  <tr key={serv.id}>
                    <td>{index + 1}</td>
                    <td>{serv.nombre}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No hay servicios asignados.</p>
          )}

          <hr />
          <h4>Asignar Servicios</h4>
          <Form>
            <Form.Group controlId="servicios">
              <Form.Label>Seleccionar Servicios</Form.Label>
              <Row>
                {serviciosDisponibles.map((serv) => (
                  <Col md={6} key={serv.id}>
                    <Form.Check
                      id={`servicio-${serv.id}`}
                      name={`servicio-${serv.id}`}
                      type="checkbox"
                      label={serv.nombre}
                      value={serv.id}
                      checked={serviciosAsignados.includes(serv.id)}
                      onChange={() => handleCheckboxChange(serv.id)}
                    />
                  </Col>
                ))}
              </Row>
            </Form.Group>

            <CustomButton
              variant="primary"
              className="mt-3"
              onClick={handleAsignarServicios}
              disabled={!hasPermission('clientes.sync-serv')}
            >
              <FaSave /> Asignar Servicios
            </CustomButton>
          </Form>
        </Col>
      </Row>
    </Card>
  );
}
