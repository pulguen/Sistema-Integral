// src/components/common/modals/NewClientModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
import customFetch from '../../../context/CustomFetch.js';

export default function NewClientModal({ show, handleClose, handleSubmit, onClientCreated }) {
  // Estado local para el modal (para mostrar/ocultar sin resetear el formulario)
  const [localShow, setLocalShow] = useState(show);

  useEffect(() => {
    setLocalShow(show);
  }, [show]);

  const [newClient, setNewClient] = useState({
    tipo_cliente: '',      // id obtenido de /cliente-tipos
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    telefono: '',
    f_nacimiento: '',
    calle_id: '',          // id obtenido de /calles
    altura: '',
    municipio_id: '',      // id obtenido de /municipios
    provincia_id: '',      // id obtenido de /provincias
    servicios: []          // IDs de servicios seleccionados
  });

  // Estados para las listas dinámicas
  const [clienteTipos, setClienteTipos] = useState([]);
  const [calles, setCalles] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
  // Estado para almacenar los detalles de cada tributo (mapeo: id -> objeto tributo)
  const [tributos, setTributos] = useState({});

  // Obtener tipos de cliente desde /cliente-tipos
  useEffect(() => {
    async function fetchClienteTipos() {
      try {
        const data = await customFetch('/cliente-tipos', 'GET');
        console.log('Tipos de cliente recibidos:', data);
        setClienteTipos(data);
      } catch (error) {
        console.error('Error fetching cliente tipos:', error);
      }
    }
    fetchClienteTipos();
  }, []);

  // Función auxiliar para desempaquetar datos anidados
  const unpackData = (data) => {
    return Array.isArray(data) && Array.isArray(data[0]) ? data[0] : data;
  };

  // Obtener listas: calles, municipios, provincias y servicios
  useEffect(() => {
    async function fetchLists() {
      try {
        const callesData = await customFetch('/calles', 'GET');
        console.log('Calles recibidas:', callesData);
        setCalles(unpackData(callesData));
      } catch (error) {
        console.error('Error fetching calles:', error);
      }
      try {
        const municipiosData = await customFetch('/municipios', 'GET');
        console.log('Municipios recibidos:', municipiosData);
        setMunicipios(unpackData(municipiosData));
      } catch (error) {
        console.error('Error fetching municipios:', error);
      }
      try {
        const provinciasData = await customFetch('/provincias', 'GET');
        console.log('Provincias recibidas:', provinciasData);
        setProvincias(unpackData(provinciasData));
      } catch (error) {
        console.error('Error fetching provincias:', error);
      }
      try {
        const serviciosData = await customFetch('/servicios', 'GET');
        console.log('Servicios recibidos:', serviciosData);
        setServiciosDisponibles(unpackData(serviciosData));
      } catch (error) {
        console.error('Error fetching servicios:', error);
      }
    }
    fetchLists();
  }, []);

  // Una vez que se carguen los servicios, extraemos los IDs únicos de tributo
  // y hacemos un GET a http://10.0.200.31:8001/api/tributos/{id} para traer los datos
  useEffect(() => {
    const uniqueTributoIds = [
      ...new Set(serviciosDisponibles.map((s) => s.tributo_id))
    ];
    if (uniqueTributoIds.length > 0) {
      Promise.all(
        uniqueTributoIds.map((id) =>
          customFetch(`/tributos/${id}`, 'GET')
        )
      )
        .then((results) => {
          const mapping = {};
          results.forEach((tributo) => {
            if (tributo && tributo.id) {
              mapping[tributo.id] = tributo;
            }
          });
          setTributos(mapping);
        })
        .catch((error) => {
          console.error("Error fetching tributos details:", error);
        });
    }
  }, [serviciosDisponibles]);

  // Agrupar servicios por tributo usando los datos obtenidos
  const groupedServices = React.useMemo(() => {
    return serviciosDisponibles.reduce((acc, servicio) => {
      const tributoId = servicio.tributo_id;
      // Se utiliza el nombre obtenido del GET a tributos; si no existe, se usa un valor por defecto.
      const tributoName = tributos[tributoId]?.nombre || `Tributo ${tributoId}`;
      if (!acc[tributoId]) {
        acc[tributoId] = {
          tributo: {
            id: tributoId,
            nombre: tributoName,
          },
          services: [],
        };
      }
      acc[tributoId].services.push(servicio);
      return acc;
    }, {});
  }, [serviciosDisponibles, tributos]);

  // Al cambiar el campo provincia, resetea el municipio
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Cambio en ${name}: ${value}`);
    setNewClient((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'provincia_id' && { municipio_id: '' }),
    }));
  };

  // Manejar la selección de servicios (checkboxes)
  const handleServiceCheckboxChange = (e) => {
    const serviceId = parseInt(e.target.value, 10);
    console.log(`Servicio ${serviceId} seleccionado/des-seleccionado`);
    setNewClient((prev) => {
      let newServicios = [...prev.servicios];
      if (newServicios.includes(serviceId)) {
        newServicios = newServicios.filter((id) => id !== serviceId);
      } else {
        newServicios.push(serviceId);
      }
      console.log('Servicios actualizados:', newServicios);
      return { ...prev, servicios: newServicios };
    });
  };

  // Filtrar municipios según la provincia seleccionada
  const filteredMunicipios = newClient.provincia_id
    ? municipios.filter((mun) => mun.provincia_id.toString() === newClient.provincia_id)
    : [];

  // Validar campos requeridos
  const validateFields = () => {
    const { tipo_cliente, nombre, apellido, dni, email, telefono, altura, calle_id, municipio_id, provincia_id, f_nacimiento } = newClient;
    if (
      !tipo_cliente ||
      !nombre ||
      (clienteTipos.find(tipo => tipo.nombre.toLowerCase() === 'físico')?.id.toString() === newClient.tipo_cliente && !apellido) ||
      !dni ||
      !email ||
      !telefono ||
      !altura ||
      !calle_id ||
      !municipio_id ||
      !provincia_id ||
      !f_nacimiento
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos vacíos',
        text: 'Por favor, completa todos los campos requeridos.',
      });
      return false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      Swal.fire({
        icon: 'error',
        title: 'Correo inválido',
        text: 'Por favor, ingresa un correo electrónico válido.',
      });
      return false;
    }
    if (!/^\d+$/.test(dni)) {
      Swal.fire({
        icon: 'error',
        title: 'DNI/CUIT inválido',
        text: 'El DNI/CUIT solo debe contener números.',
      });
      return false;
    }
    if (!/^\d+$/.test(telefono)) {
      Swal.fire({
        icon: 'error',
        title: 'Teléfono inválido',
        text: 'El teléfono solo debe contener números.',
      });
      return false;
    }
    if (isNaN(altura) || parseInt(altura, 10) <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Altura inválida',
        text: 'La altura debe ser un número positivo.',
      });
      return false;
    }
    return true;
  };

  // onSubmit: crear el cliente y sincronizar servicios; si falla la asignación, se elimina el cliente
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;
    console.log('Datos del formulario validados.');

    // Objeto para crear el cliente (sin incluir "servicios")
    const clientToSend = {
      nombre: newClient.nombre,
      apellido: newClient.apellido,
      f_nacimiento: newClient.f_nacimiento,
      dni: parseInt(newClient.dni, 10),
      email: newClient.email,
      telefono: newClient.telefono,
      cliente_tipo_id: newClient.tipo_cliente,
      calle_id: parseInt(newClient.calle_id, 10),
      altura: parseInt(newClient.altura, 10),
      municipio_id: parseInt(newClient.municipio_id, 10),
      provincia_id: parseInt(newClient.provincia_id, 10),
    };

    console.log('Datos a enviar para crear cliente:', clientToSend);

    try {
      const confirmation = await Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Estás seguro de que quieres agregar este cliente?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, agregar',
        cancelButtonText: 'Cancelar',
      });

      if (confirmation.isConfirmed) {
        // 1. Crear el cliente
        const newClientResponse = await handleSubmit(clientToSend);
        console.log('Cliente creado:', newClientResponse);
        if (!newClientResponse || !newClientResponse.id) {
          console.error("No se obtuvo el ID del cliente creado:", newClientResponse);
          throw new Error("No se obtuvo el ID del cliente creado.");
        }

        // 2. Si se seleccionaron servicios, sincronizarlos
        if (newClient.servicios && newClient.servicios.length > 0) {
          const serviciosToSend = newClient.servicios.map(String);
          console.log(`Sincronizando servicios para el cliente ${newClientResponse.id}:`, serviciosToSend);
          try {
            await customFetch(
              `/clientes/${newClientResponse.id}/serv-sinc`,
              'POST',
              { servicios: serviciosToSend }
            );
            console.log('Servicios asignados correctamente.');
          } catch (assignError) {
            console.error('Error al asignar servicios:', assignError);
            // Eliminar el cliente si falla la asignación de servicios
            await customFetch(`/clientes/${newClientResponse.id}`, 'DELETE');
            throw new Error('Error al asignar los servicios. Se eliminó el cliente.');
          }
        }

        await Swal.fire({
          icon: 'success',
          title: 'Cliente agregado',
          text: 'El cliente ha sido agregado exitosamente!',
        });
        console.log('Proceso completado exitosamente.');
        handleReset();
        handleClose();
        if (typeof onClientCreated === 'function') {
          onClientCreated();
        }
      }
    } catch (error) {
      console.error('Error en el proceso de creación y asignación:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo agregar el cliente. Intenta nuevamente.',
      });
    }
  };

  const handleReset = () => {
    setNewClient({
      tipo_cliente: '',
      nombre: '',
      apellido: '',
      dni: '',
      email: '',
      telefono: '',
      f_nacimiento: '',
      calle_id: '',
      altura: '',
      municipio_id: '',
      provincia_id: '',
      servicios: [],
    });
  };

  // Cierre definitivo del modal (resetear y notificar al padre)
  const handleModalClose = () => {
    handleReset();
    handleClose();
  };

  // Función para agregar nueva calle
  const handleAddNewCalle = async () => {
    setLocalShow(false);
    const { value: nombre } = await Swal.fire({
      title: 'Agregar nueva calle',
      input: 'text',
      inputLabel: 'Nombre de la calle',
      inputPlaceholder: 'Ingresa el nombre de la calle',
      target: document.body,
      focusConfirm: false,
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Por favor, ingresa un nombre válido.';
        }
      }
    });
    setLocalShow(true);
    if (nombre) {
      const nombreTrimmed = nombre.trim();
      const calleExiste = calles.some(
        (calle) => calle.nombre.toLowerCase() === nombreTrimmed.toLowerCase()
      );
      if (calleExiste) {
        Swal.fire({
          icon: 'warning',
          title: 'Calle existente',
          text: 'La calle ya existe, por favor ingresa otro nombre.'
        });
        return;
      }
      try {
        const payload = { nombre: nombreTrimmed };
        const newCalleResponse = await customFetch('/calles', 'POST', payload);
        console.log('Nueva calle agregada:', newCalleResponse);
        Swal.fire('Éxito', 'Calle agregada correctamente', 'success');
        setCalles((prevCalles) => [...prevCalles, newCalleResponse]);
        setNewClient((prev) => ({ ...prev, calle_id: newCalleResponse.id }));
      } catch (error) {
        console.error('Error agregando la calle:', error);
        Swal.fire('Error', 'No se pudo agregar la calle', 'error');
      }
    }
  };

  return (
    <Modal show={localShow} onHide={handleModalClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Agregar Cliente</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          {/* Tipo de Cliente */}
          <Form.Group controlId="tipo_cliente" className="mb-3">
            <Form.Label className="font-weight-bold">
              Tipo de Cliente <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="select"
              name="tipo_cliente"
              value={newClient.tipo_cliente}
              onChange={handleChange}
              required
              className="rounded"
              aria-label="Seleccione el tipo de cliente"
            >
              <option value="">Seleccione el tipo de cliente</option>
              {clienteTipos.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          {newClient.tipo_cliente && (
            <>
              {/* Nombre */}
              <Form.Group controlId="nombre" className="mb-3">
                <Form.Label className="font-weight-bold">
                  Nombre <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={newClient.nombre}
                  onChange={handleChange}
                  placeholder="Ingrese el nombre"
                  required
                  className="rounded"
                  aria-label="Ingrese el nombre del cliente"
                />
              </Form.Group>

              {/* Apellido (solo si es Físico) */}
              {clienteTipos.find(tipo => tipo.nombre.toLowerCase() === 'físico')?.id.toString() === newClient.tipo_cliente && (
                <Form.Group controlId="apellido" className="mb-3">
                  <Form.Label className="font-weight-bold">
                    Apellido <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="apellido"
                    value={newClient.apellido}
                    onChange={handleChange}
                    placeholder="Ingrese el apellido"
                    required
                    className="rounded"
                    aria-label="Ingrese el apellido del cliente"
                  />
                </Form.Group>
              )}

              {/* Selección de Servicios agrupados por Tributo */}
              <Form.Group controlId="servicios" className="mb-3">
                <Form.Label className="font-weight-bold">
                  Servicios a asignar
                </Form.Label>
                {Object.keys(groupedServices).length === 0 ? (
                  <p>No hay servicios disponibles</p>
                ) : (
                  Object.entries(groupedServices).map(([tributoId, group]) => (
                    <div key={tributoId} className="mb-3">
                      {/* Se muestra el nombre del tributo obtenido vía GET */}
                      <h6 className="text-primary">{group.tributo.nombre}</h6>
                      <Row>
                        {group.services.map((servicio) => (
                          <Col md={6} key={servicio.id}>
                            <Form.Check
                              id={`servicio-${servicio.id}`}
                              name={`servicio-${servicio.id}`}
                              type="checkbox"
                              label={servicio.nombre}
                              value={servicio.id}
                              checked={newClient.servicios.includes(servicio.id)}
                              onChange={handleServiceCheckboxChange}
                            />
                          </Col>
                        ))}
                      </Row>
                    </div>
                  ))
                )}
              </Form.Group>

              {/* DNI/CUIT */}
              <Form.Group controlId="dni" className="mb-3">
                <Form.Label className="font-weight-bold">
                  DNI/CUIT <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="dni"
                  value={newClient.dni}
                  onChange={handleChange}
                  placeholder="Ingrese el DNI o CUIT"
                  required
                  className="rounded"
                  aria-label="Ingrese el DNI o CUIT del cliente"
                />
              </Form.Group>

              {/* Email */}
              <Form.Group controlId="email" className="mb-3">
                <Form.Label className="font-weight-bold">
                  Email <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={newClient.email}
                  onChange={handleChange}
                  placeholder="Ingrese el correo electrónico"
                  required
                  className="rounded"
                  aria-label="Ingrese el correo electrónico del cliente"
                />
              </Form.Group>

              {/* Teléfono */}
              <Form.Group controlId="telefono" className="mb-3">
                <Form.Label className="font-weight-bold">
                  Teléfono <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="telefono"
                  value={newClient.telefono}
                  onChange={handleChange}
                  placeholder="Ingrese el teléfono"
                  required
                  className="rounded"
                  aria-label="Ingrese el teléfono del cliente"
                />
              </Form.Group>

              {/* Dirección: Provincia, Municipio, Calle y Altura */}
              <Form.Group controlId="provincia_id" className="mb-3">
                <Form.Label className="font-weight-bold">
                  Provincia <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  as="select"
                  name="provincia_id"
                  value={newClient.provincia_id}
                  onChange={handleChange}
                  required
                  className="rounded"
                  aria-label="Seleccione la provincia"
                >
                  <option value="">Seleccione una provincia</option>
                  {provincias.map((provincia) => (
                    <option key={provincia.id} value={provincia.id}>
                      {provincia.nombre}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="municipio_id" className="mb-3">
                <Form.Label className="font-weight-bold">
                  Municipio <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  as="select"
                  name="municipio_id"
                  value={newClient.municipio_id}
                  onChange={handleChange}
                  required
                  className="rounded"
                  aria-label="Seleccione el municipio"
                  disabled={!newClient.provincia_id}
                >
                  <option value="">{newClient.provincia_id ? 'Seleccione un municipio' : 'Seleccione una provincia primero'}</option>
                  {filteredMunicipios.map((municipio) => (
                    <option key={municipio.id} value={municipio.id}>
                      {municipio.nombre}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="calle_id" className="mb-3">
                <Form.Label className="font-weight-bold">
                  Calle <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  as="select"
                  name="calle_id"
                  value={newClient.calle_id}
                  onChange={handleChange}
                  required
                  className="rounded"
                  aria-label="Seleccione la calle"
                  disabled={!newClient.provincia_id || !newClient.municipio_id}
                >
                  <option value="">Seleccione una calle</option>
                  {calles.map((calle) => (
                    <option key={calle.id} value={calle.id}>
                      {calle.nombre}
                    </option>
                  ))}
                </Form.Control>
                <Button variant="link" onClick={handleAddNewCalle}>
                  Agregar nueva calle
                </Button>
              </Form.Group>

              <Form.Group controlId="altura" className="mb-3">
                <Form.Label className="font-weight-bold">
                  Altura <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  name="altura"
                  value={newClient.altura}
                  onChange={handleChange}
                  placeholder="Ingrese la altura"
                  required
                  className="rounded"
                  aria-label="Ingrese la altura del cliente"
                />
              </Form.Group>

              <Form.Group controlId="f_nacimiento" className="mb-3">
                <Form.Label className="font-weight-bold">
                  Fecha de Nacimiento <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="f_nacimiento"
                  value={newClient.f_nacimiento}
                  onChange={handleChange}
                  required
                  className="rounded"
                  aria-label="Seleccione la fecha de nacimiento del cliente"
                />
              </Form.Group>

              <div className="d-flex justify-content-end mt-4">
                <Button variant="secondary" onClick={handleModalClose} className="me-3">
                  Cancelar
                </Button>
                <Button variant="primary" type="submit">
                  Guardar Cliente
                </Button>
              </div>
            </>
          )}
        </Form>
      </Modal.Body>
    </Modal>
  );
}
