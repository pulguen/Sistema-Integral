// EditClientModal.jsx
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
import customFetch from '../../../context/CustomFetch.js';
import { FacturacionContext } from '../../../context/FacturacionContext';

export default function EditClientModal({
  show,
  handleClose,
  handleSubmit,
  clientData,
}) {
  const {
    calles: ctxCalles,
    municipiosOrdenados,
    provincias,
    serviciosDisponibles,
    tributos,
  } = useContext(FacturacionContext);

  // Local copy of calles so we can append new ones
  const [calles, setCalles] = useState(ctxCalles);
  useEffect(() => setCalles(ctxCalles), [ctxCalles]);

  const [localShow, setLocalShow] = useState(show);
  useEffect(() => setLocalShow(show), [show]);

  const [step, setStep] = useState(1);
  const [clientType, setClientType] = useState('');

  // Persona vs Empresa data
  const [personaData, setPersonaData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    telefono: '',
    f_nacimiento: '',
  });
  const [empresaData, setEmpresaData] = useState({
    nombre: '',
    cuit: '',
  });

  // Dirección
  const [domicilio, setDomicilio] = useState({
    provincia_id: '',
    municipio_id: '',
    calle_id: '',
    altura: '',
    codigo_postal: '',
    n_casa: '',
    n_piso: '',
    n_departamento: '',
    es_esquina: false,
    calle_esquina_id: '',
    referencia: '',
  });

  // Servicios pre-seleccionados
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);

  // Agrupar servicios por tributo
  const groupedServices = useMemo(() => {
    return serviciosDisponibles.reduce((acc, svc) => {
      const tid = svc.tributo_id;
      const tname = tributos.find((t) => t.id === tid)?.nombre || `Tributo ${tid}`;
      if (!acc[tid]) acc[tid] = { tributo: { id: tid, nombre: tname }, services: [] };
      acc[tid].services.push(svc);
      return acc;
    }, {});
  }, [serviciosDisponibles, tributos]);

  // Filtrar municipios según provincia seleccionada
  const filteredMunicipios = useMemo(() => {
    if (!domicilio.provincia_id) return [];
    return municipiosOrdenados.filter(
      (m) => String(m.provincia_id) === domicilio.provincia_id
    );
  }, [municipiosOrdenados, domicilio.provincia_id]);

  // Pre-cargar datos desde clientData.clientable
  useEffect(() => {
    if (!clientData) return;
    const modelo = clientData.clientable || {};  // aquí vienen los datos de persona o empresa

    if (String(clientData.clientable_type).includes('Persona')) {
      setClientType('Persona');
      setPersonaData({
        nombre: modelo.nombre || '',
        apellido: modelo.apellido || '',
        dni: modelo.dni ? String(modelo.dni) : '',
        email: modelo.email || '',
        telefono: modelo.telefono || '',
        // Aseguramos formato YYYY-MM-DD
        f_nacimiento: modelo.f_nacimiento
          ? modelo.f_nacimiento.split('T')[0]
          : '',
      });
    } else {
      setClientType('Empresa');
      setEmpresaData({
        nombre: modelo.nombre || '',
        cuit: modelo.cuit ? String(modelo.cuit) : '',
      });
    }

    // Dirección
    if (clientData.direccion) {
      const d = clientData.direccion;
      setDomicilio({
        provincia_id: d.provincia?.id ? String(d.provincia.id) : '',
        municipio_id: d.municipio?.id ? String(d.municipio.id) : '',
        calle_id: d.calle?.id ? String(d.calle.id) : '',
        altura: d.altura ? String(d.altura) : '',
        codigo_postal: d.codigo_postal || '',
        n_casa: d.n_casa ? String(d.n_casa) : '',
        n_piso: d.n_piso || '',
        n_departamento: d.n_departamento || '',
        es_esquina: !!d.es_esquina,
        calle_esquina_id: d.calle_esquina?.id ? String(d.calle_esquina.id) : '',
        referencia: d.referencia || '',
      });
    }

    // Servicios
    if (Array.isArray(clientData.servicios)) {
      setServiciosSeleccionados(clientData.servicios.map((s) => s.id));
    }
  }, [clientData]);

  // Handlers de formulario
  const handleClientTypeChange = (e) => {
    setClientType(e.target.value);
  };
  const handlePersonaChange = (e) =>
    setPersonaData((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleEmpresaChange = (e) =>
    setEmpresaData((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleDomicilioChange = (e) => {
    const { name, type, checked, value } = e.target;
    setDomicilio((d) => ({
      ...d,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'provincia_id' && { municipio_id: '', calle_id: '' }),
      ...(name === 'municipio_id' && { calle_id: '' }),
    }));
  };
  const handleServiceCheckboxChange = (e) => {
    const id = parseInt(e.target.value, 10);
    setServiciosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Agregar nueva calle igual que en NewClientModal
  const handleAddNewCalle = async () => {
    const { value: nombre } = await Swal.fire({
      title: 'Agregar nueva calle',
      input: 'text',
      inputLabel: 'Nombre de la calle',
      inputPlaceholder: 'Ingresa el nombre de la calle',
      showCancelButton: true,
      inputValidator: (v) => (!v?.trim() ? 'Ingresa un nombre válido.' : null),
    });
    if (!nombre) return;
    const trimmed = nombre.trim();
    if (calles.some((c) => c.nombre.toLowerCase() === trimmed.toLowerCase())) {
      return Swal.fire('Calle existente', 'Ya existe esa calle.', 'warning');
    }
    try {
      const nueva = await customFetch('/calles', 'POST', { nombre: trimmed });
      setCalles((c) => [...c, nueva]);
      setDomicilio((d) => ({ ...d, calle_id: String(nueva.id) }));
      Swal.fire('Éxito', 'Calle agregada correctamente.', 'success');
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo agregar la calle.', 'error');
    }
  };

  // Funciones de navegación entre pasos y validación
  const goNext = () => {
    if (step === 1) {
      if (!clientType) {
        return Swal.fire('Atención', 'Selecciona Persona o Empresa.', 'warning');
      }
      if (clientType === 'Persona') {
        const { nombre, apellido, dni, email, telefono, f_nacimiento } = personaData;
        if (!nombre || !apellido || !dni || !email || !telefono || !f_nacimiento) {
          return Swal.fire('Campos incompletos', 'Completa todos los datos.', 'warning');
        }
      } else {
        const { nombre, cuit } = empresaData;
        if (!nombre || !cuit) {
          return Swal.fire('Campos incompletos', 'Completa nombre y CUIT.', 'warning');
        }
      }
      setStep(2);
    } else if (step === 2) {
      const { provincia_id, municipio_id, calle_id, altura } = domicilio;
      if (!provincia_id || !municipio_id || !calle_id || !altura) {
        return Swal.fire('Campos incompletos', 'Completa la dirección.', 'warning');
      }
      setStep(3);
    }
  };
  const goBack = () => step > 1 && setStep((s) => s - 1);

  const resetForm = () => {
    setStep(1);
    setClientType('');
    setPersonaData({ nombre: '', apellido: '', dni: '', email: '', telefono: '', f_nacimiento: '' });
    setEmpresaData({ nombre: '', cuit: '' });
    setDomicilio({
      provincia_id: '',
      municipio_id: '',
      calle_id: '',
      altura: '',
      codigo_postal: '',
      n_casa: '',
      n_piso: '',
      n_departamento: '',
      es_esquina: false,
      calle_esquina_id: '',
      referencia: '',
    });
    setServiciosSeleccionados([]);
  };
  const handleModalClose = () => {
    resetForm();
    handleClose();
  };

  // Envío final
  const onSubmit = async (e) => {
    e.preventDefault();
    // Construir payload igual que antes...
    let payload = {
      provincia_id: Number(domicilio.provincia_id),
      municipio_id: Number(domicilio.municipio_id),
      calle_id: Number(domicilio.calle_id),
      altura: Number(domicilio.altura),
      // solo incluir si el usuario puso un CP
      ...(domicilio.codigo_postal && { codigo_postal: Number(domicilio.codigo_postal) }),
      // n_casa debe ser string
      ...(domicilio.n_casa && { n_casa: domicilio.n_casa }),
      ...(domicilio.n_piso && { n_piso: domicilio.n_piso }),
      ...(domicilio.n_departamento && { n_departamento: domicilio.n_departamento }),
      es_esquina: domicilio.es_esquina,
      ...(domicilio.es_esquina && { calle_esquina_id: Number(domicilio.calle_esquina_id) }),
      ...(domicilio.referencia && { referencia: domicilio.referencia }),
    };
    if (clientType === 'Persona') {
      payload = {
        ...payload,
        nombre: personaData.nombre,
        apellido: personaData.apellido,
        dni: Number(personaData.dni),
        email: personaData.email,
        telefono: personaData.telefono,
        f_nacimiento: personaData.f_nacimiento,
      };
    } else {
      payload = {
        ...payload,
        nombre: empresaData.nombre,
        cuit: Number(empresaData.cuit),
      };
    }

    const confirm = await Swal.fire({
      title: 'Confirmar cambios',
      text: '¿Deseas modificar este cliente?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, modificar',
    });
    if (!confirm.isConfirmed) return;

    try {
      await handleSubmit({ ...payload, id: clientData.id });
      if (serviciosSeleccionados.length) {
        await customFetch(
          `/clientes/${clientData.id}/serv-sinc`,
          'POST',
          { servicios: serviciosSeleccionados.map(String) }
        );
      }
      Swal.fire('Éxito', 'Cliente modificado correctamente.', 'success');
      handleModalClose();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.message || 'No se pudo modificar el cliente.', 'error');
    }
  };

  return (
    <Modal show={localShow} onHide={handleModalClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Modificar Cliente</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          {step === 1 && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>¿Es Persona o Empresa?</Form.Label>
                <Form.Select value={clientType} onChange={handleClientTypeChange}>
                  <option value="">-- Seleccione --</option>
                  <option value="Persona">Persona</option>
                  <option value="Empresa">Empresa</option>
                </Form.Select>
              </Form.Group>
              {clientType === 'Persona' && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                      type="text"
                      name="nombre"
                      value={personaData.nombre}
                      onChange={handlePersonaChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Apellido</Form.Label>
                    <Form.Control
                      type="text"
                      name="apellido"
                      value={personaData.apellido}
                      onChange={handlePersonaChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>DNI</Form.Label>
                    <Form.Control
                      type="text"
                      name="dni"
                      value={personaData.dni}
                      onChange={handlePersonaChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={personaData.email}
                      onChange={handlePersonaChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Teléfono</Form.Label>
                    <Form.Control
                      type="text"
                      name="telefono"
                      value={personaData.telefono}
                      onChange={handlePersonaChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha de Nacimiento</Form.Label>
                    <Form.Control
                      type="date"
                      name="f_nacimiento"
                      value={personaData.f_nacimiento}
                      onChange={handlePersonaChange}
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
                      value={empresaData.nombre}
                      onChange={handleEmpresaChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>CUIT</Form.Label>
                    <Form.Control
                      type="text"
                      name="cuit"
                      value={empresaData.cuit}
                      onChange={handleEmpresaChange}
                    />
                  </Form.Group>
                </>
              )}
              <div className="d-flex justify-content-end">
                <Button variant="primary" onClick={goNext} disabled={!clientType}>
                  Siguiente
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h5 className="mb-3">Dirección</h5>
              <Form.Group className="mb-3">
                <Form.Label>Provincia</Form.Label>
                <Form.Select
                  name="provincia_id"
                  value={domicilio.provincia_id}
                  onChange={handleDomicilioChange}
                >
                  <option value="">-- Seleccione provincia --</option>
                  {provincias.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Municipio</Form.Label>
                <Form.Select
                  name="municipio_id"
                  value={domicilio.municipio_id}
                  onChange={handleDomicilioChange}
                  disabled={!domicilio.provincia_id}
                >
                  <option value="">-- Seleccione municipio --</option>
                  {filteredMunicipios.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Calle</Form.Label>
                <Form.Select
                  name="calle_id"
                  value={domicilio.calle_id}
                  onChange={handleDomicilioChange}
                  disabled={!domicilio.municipio_id}
                >
                  <option value="">-- Seleccione calle --</option>
                  {calles.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </Form.Select>
                <Button variant="link" onClick={handleAddNewCalle}>
                  Agregar nueva calle
                </Button>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Altura</Form.Label>
                <Form.Control
                  type="number"
                  name="altura"
                  value={domicilio.altura}
                  onChange={handleDomicilioChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Código Postal</Form.Label>
                <Form.Control
                  type="text"
                  name="codigo_postal"
                  value={domicilio.codigo_postal}
                  onChange={handleDomicilioChange}
                />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>N° Casa (opc.)</Form.Label>
                    <Form.Control
                      type="number"
                      name="n_casa"
                      value={domicilio.n_casa}
                      onChange={handleDomicilioChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Piso (opc.)</Form.Label>
                    <Form.Control
                      type="text"
                      name="n_piso"
                      value={domicilio.n_piso}
                      onChange={handleDomicilioChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Depto (opc.)</Form.Label>
                    <Form.Control
                      type="text"
                      name="n_departamento"
                      value={domicilio.n_departamento}
                      onChange={handleDomicilioChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="¿Es esquina?"
                  name="es_esquina"
                  checked={domicilio.es_esquina}
                  onChange={handleDomicilioChange}
                />
              </Form.Group>
              {domicilio.es_esquina && (
                <Form.Group className="mb-3">
                  <Form.Label>Calle Esquina</Form.Label>
                  <Form.Select
                    name="calle_esquina_id"
                    value={domicilio.calle_esquina_id}
                    onChange={handleDomicilioChange}
                  >
                    <option value="">-- Seleccione calle --</option>
                    {calles.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}
              <Form.Group className="mb-3">
                <Form.Label>Referencia (opc.)</Form.Label>
                <Form.Control
                  type="text"
                  name="referencia"
                  value={domicilio.referencia}
                  onChange={handleDomicilioChange}
                />
              </Form.Group>
              <div className="d-flex justify-content-between">
                <Button variant="secondary" onClick={goBack}>
                  Volver
                </Button>
                <Button variant="primary" onClick={goNext}>
                  Siguiente
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h5 className="mb-3">Servicios a Asignar</h5>
              {Object.keys(groupedServices).length === 0 ? (
                <p>No hay servicios disponibles</p>
              ) : (
                Object.entries(groupedServices).map(([_, grp]) => (
                  <div key={grp.tributo.id} className="mb-3">
                    <h6>{grp.tributo.nombre}</h6>
                    <Row>
                      {grp.services.map((svc) => (
                        <Col md={6} key={svc.id}>
                          <Form.Check
                            type="checkbox"
                            label={svc.nombre}
                            value={svc.id}
                            checked={serviciosSeleccionados.includes(svc.id)}
                            onChange={handleServiceCheckboxChange}
                          />
                        </Col>
                      ))}
                    </Row>
                  </div>
                ))
              )}
              <div className="d-flex justify-content-between mt-4">
                <Button variant="secondary" onClick={goBack}>
                  Volver
                </Button>
                <Button variant="primary" type="submit">
                  Guardar
                </Button>
              </div>
            </>
          )}
        </Form>
      </Modal.Body>
    </Modal>
  );
}
