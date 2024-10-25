// src/features/facturacion/components/Clientes/ClienteDetalle.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Table, Form, Breadcrumb, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
import CustomButton from '../../../../components/common/botons/CustomButton.jsx';
import { FaEdit, FaTrash, FaSave } from 'react-icons/fa';
import Loading from '../../../../components/common/loading/Loading.jsx';
import customFetch from '../../../../context/CustomFetch.js';

const ClienteDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
  const [serviciosAsignados, setServiciosAsignados] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editedCliente, setEditedCliente] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    email: '',
    calle: '',
    altura: '',
    f_nacimiento: '',
    tipo_cliente: 'fisico',
    piso: '',
    departamento: '',
    calle_esquina: '',
    altura_esquina: '',
  });

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const data = await customFetch(
          `http://10.0.0.17/municipalidad/public/api/clientes/${id}`
        );

        // Aplanar los datos de 'persona' y 'cliente' en un solo objeto
        const combinedData = {
          ...data,
          ...data.persona,
        };

        setCliente(combinedData);
        setEditedCliente({
          nombre: combinedData.nombre || '',
          apellido: combinedData.apellido || '',
          dni: combinedData.dni || '',
          telefono: combinedData.telefono || '',
          email: combinedData.email || '',
          calle: combinedData.calle || '',
          altura: combinedData.altura || '',
          piso: combinedData.piso || '',
          departamento: combinedData.departamento || '',
          calle_esquina: combinedData.calle_esquina || '',
          altura_esquina: combinedData.altura_esquina || '',
          f_nacimiento: combinedData.f_nacimiento || '',
          tipo_cliente: combinedData.tipo_cliente || 'fisico',
        });

        const serviciosAsignadosIds = data.servicios.map(
          (servicio) => servicio.id
        );
        setServiciosAsignados(serviciosAsignadosIds);
      } catch (error) {
        console.error(
          'Error al obtener el cliente:',
          error
        );
        Swal.fire('Error', 'Error al obtener el cliente.', 'error');
      }
    };

    const fetchServicios = async () => {
      try {
        const data = await customFetch(
          'http://10.0.0.17/municipalidad/public/api/servicios'
        );
        setServiciosDisponibles(data);
      } catch (error) {
        Swal.fire('Error', 'Error al obtener los servicios.', 'error');
      }
    };

    fetchCliente();
    fetchServicios();
  }, [id]);

  const handleAsignarServicios = async () => {
    try {
      await customFetch(
        `http://10.0.0.17/municipalidad/public/api/clientes/${id}/serv-sinc`,
        'POST',
        JSON.stringify({
          servicios: serviciosAsignados,
        })
      );
      Swal.fire('Éxito', 'Servicios asignados correctamente.', 'success');
      setCliente((prev) => ({
        ...prev,
        servicios: serviciosDisponibles.filter((serv) =>
          serviciosAsignados.includes(serv.id)
        ),
      }));
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al asignar los servicios.', 'error');
    }
  };

  const handleCheckboxChange = (servicioId) => {
    setServiciosAsignados((prevSelected) => {
      if (prevSelected.includes(servicioId)) {
        return prevSelected.filter((id) => id !== servicioId);
      } else {
        return [...prevSelected, servicioId];
      }
    });
  };

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
        await customFetch(
          `http://10.0.0.17/municipalidad/public/api/clientes/${id}`,
          'DELETE'
        );
        Swal.fire('Eliminado', 'El cliente ha sido eliminado.', 'success');
        navigate('/facturacion/clientes');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al eliminar el cliente.', 'error');
    }
  };

  const handleEditCliente = async () => {
    console.log('handleEditCliente called');
    try {
      const updatedData = {
        id: cliente.id,
        tipo_cliente: editedCliente.tipo_cliente,
        nombre: editedCliente.nombre,
        apellido: editedCliente.apellido,
        dni: editedCliente.dni,
        telefono: editedCliente.telefono,
        email: editedCliente.email,
        calle: editedCliente.calle,
        altura: editedCliente.altura,
        piso: editedCliente.piso,
        departamento: editedCliente.departamento,
        calle_esquina: editedCliente.calle_esquina,
        altura_esquina: editedCliente.altura_esquina,
        f_nacimiento: editedCliente.f_nacimiento,
      };

      await customFetch(
        `http://10.0.0.17/municipalidad/public/api/clientes/${id}`,
        'PUT',
        JSON.stringify(updatedData)
      );

      Swal.fire('Éxito', 'Cliente modificado correctamente.', 'success');
      setEditMode(false);
      setCliente((prevCliente) => ({
        ...prevCliente,
        ...updatedData,
      }));
    } catch (error) {
      console.error('Error al modificar el cliente:', error);
      Swal.fire('Error', `Hubo un problema al modificar el cliente: ${error.message}`, 'error');
    }
  };

  if (!cliente) return <Loading />;

  return (
    <Card className="p-4">
      {/* Breadcrumb para navegación con nombre del cliente */}
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Home</Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/facturacion/clientes' }}>
          Gestión de Clientes
        </Breadcrumb.Item>
        <Breadcrumb.Item active>
          {cliente.nombre} {cliente.apellido}
        </Breadcrumb.Item>
      </Breadcrumb>

      <Row>
        {/* Columna de Información del Cliente */}
        <Col md={6}>
          <h4 className="text-primary">Datos del Cliente</h4>
          {!editMode ? (
            <>
              <p style={{ fontSize: '1.2rem' }}>
                <strong>Nombre:</strong> {cliente.nombre}
              </p>
              <p style={{ fontSize: '1.2rem' }}>
                <strong>Apellido:</strong> {cliente.apellido}
              </p>
              <p style={{ fontSize: '1.2rem' }}>
                <strong>DNI/CIUT:</strong> {cliente.dni}
              </p>
              <p style={{ fontSize: '1.2rem' }}>
                <strong>Teléfono:</strong> {cliente.telefono}
              </p>
              <p style={{ fontSize: '1.2rem' }}>
                <strong>Email:</strong> {cliente.email}
              </p>
              <p style={{ fontSize: '1.2rem' }}>
                <strong>Dirección:</strong> {cliente.calle} {cliente.altura}
              </p>
              <p style={{ fontSize: '1.2rem' }}>
                <strong>Piso:</strong> {cliente.piso}
              </p>
              <p style={{ fontSize: '1.2rem' }}>
                <strong>Departamento:</strong> {cliente.departamento}
              </p>
              <p style={{ fontSize: '1.2rem' }}>
                <strong>Esquina:</strong> {cliente.calle_esquina}{' '}
                {cliente.altura_esquina}
              </p>
              <p style={{ fontSize: '1.2rem' }}>
                <strong>Fecha de Nacimiento:</strong> {cliente.f_nacimiento}
              </p>
              <p style={{ fontSize: '1.2rem' }}>
                <strong>Tipo de Cliente:</strong> {cliente.tipo_cliente}
              </p>
              <CustomButton
                variant="warning"
                className="mt-3"
                onClick={() => setEditMode(true)}
              >
                <FaEdit /> Modificar Datos
              </CustomButton>
              <CustomButton
                variant="danger"
                className="mt-3 ms-3"
                onClick={handleDeleteCliente}
              >
                <FaTrash /> Eliminar Cliente
              </CustomButton>
            </>
          ) : (
            <Form>
              {/* Campos del formulario de edición */}
              <Row>
                <Col md={6}>
                  <Form.Group controlId="nombre">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                      type="text"
                      value={editedCliente.nombre}
                      onChange={(e) =>
                        setEditedCliente({ ...editedCliente, nombre: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="apellido">
                    <Form.Label>Apellido</Form.Label>
                    <Form.Control
                      type="text"
                      value={editedCliente.apellido}
                      onChange={(e) =>
                        setEditedCliente({ ...editedCliente, apellido: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group controlId="dni">
                    <Form.Label>DNI/CIUT</Form.Label>
                    <Form.Control
                      type="text"
                      value={editedCliente.dni}
                      onChange={(e) =>
                        setEditedCliente({ ...editedCliente, dni: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="telefono">
                    <Form.Label>Teléfono</Form.Label>
                    <Form.Control
                      type="text"
                      value={editedCliente.telefono}
                      onChange={(e) =>
                        setEditedCliente({ ...editedCliente, telefono: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={editedCliente.email}
                  onChange={(e) =>
                    setEditedCliente({ ...editedCliente, email: e.target.value })
                  }
                />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group controlId="calle">
                    <Form.Label>Calle</Form.Label>
                    <Form.Control
                      type="text"
                      value={editedCliente.calle}
                      onChange={(e) =>
                        setEditedCliente({ ...editedCliente, calle: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="altura">
                    <Form.Label>Altura</Form.Label>
                    <Form.Control
                      type="text"
                      value={editedCliente.altura}
                      onChange={(e) =>
                        setEditedCliente({ ...editedCliente, altura: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group controlId="piso">
                    <Form.Label>Piso</Form.Label>
                    <Form.Control
                      type="text"
                      value={editedCliente.piso}
                      onChange={(e) =>
                        setEditedCliente({ ...editedCliente, piso: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="departamento">
                    <Form.Label>Departamento</Form.Label>
                    <Form.Control
                      type="text"
                      value={editedCliente.departamento}
                      onChange={(e) =>
                        setEditedCliente({
                          ...editedCliente,
                          departamento: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group controlId="calle_esquina">
                    <Form.Label>Calle Esquina</Form.Label>
                    <Form.Control
                      type="text"
                      value={editedCliente.calle_esquina}
                      onChange={(e) =>
                        setEditedCliente({
                          ...editedCliente,
                          calle_esquina: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="altura_esquina">
                    <Form.Label>Altura Esquina</Form.Label>
                    <Form.Control
                      type="text"
                      value={editedCliente.altura_esquina}
                      onChange={(e) =>
                        setEditedCliente({
                          ...editedCliente,
                          altura_esquina: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group controlId="f_nacimiento">
                <Form.Label>Fecha de Nacimiento</Form.Label>
                <Form.Control
                  type="date"
                  value={editedCliente.f_nacimiento}
                  onChange={(e) =>
                    setEditedCliente({
                      ...editedCliente,
                      f_nacimiento: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group controlId="tipo_cliente" className="mt-2">
                <Form.Label>Tipo de Cliente</Form.Label>
                <Form.Control
                  as="select"
                  value={editedCliente.tipo_cliente}
                  onChange={(e) =>
                    setEditedCliente({
                      ...editedCliente,
                      tipo_cliente: e.target.value,
                    })
                  }
                >
                  <option value="fisico">Físico</option>
                  <option value="juridico">Jurídico</option>
                </Form.Control>
              </Form.Group>
              {/* Botones para guardar o cancelar */}
              <CustomButton
                variant="success"
                className="mt-3"
                onClick={handleEditCliente}
              >
                <FaSave /> Guardar Cambios
              </CustomButton>
              <CustomButton
                variant="danger"
                className="mt-3 ms-3"
                onClick={() => setEditMode(false)}
              >
                Cancelar
              </CustomButton>
            </Form>
          )}
        </Col>

        {/* Columna de Servicios */}
        <Col md={6}>
          <h4 className="text-primary">Servicios Asignados</h4>
          {cliente.servicios && cliente.servicios.length > 0 ? (
            <Table striped bordered hover className="mt-3">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Servicio</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cliente.servicios.map((servicio, index) => (
                  <tr key={servicio.id}>
                    <td>{index + 1}</td>
                    <td>{servicio.nombre}</td>
                    <td>
                      <CustomButton
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          // Lógica para eliminar servicio
                        }}
                      >
                        <FaTrash /> Eliminar
                      </CustomButton>
                    </td>
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
                {serviciosDisponibles.map((servicio) => (
                  <Col md={6} key={servicio.id}>
                    <Form.Check
                      type="checkbox"
                      label={servicio.nombre}
                      value={servicio.id}
                      checked={serviciosAsignados.includes(servicio.id)}
                      onChange={() => handleCheckboxChange(servicio.id)}
                    />
                  </Col>
                ))}
              </Row>
            </Form.Group>

            <CustomButton
              variant="primary"
              className="mt-3"
              onClick={handleAsignarServicios}
            >
              <FaSave /> Asignar Servicios
            </CustomButton>
          </Form>
        </Col>
      </Row>
    </Card>
  );
};

export default ClienteDetalle;
