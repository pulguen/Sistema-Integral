import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
import customFetch from '../../../context/CustomFetch';
import { FacturacionContext } from '../../../context/FacturacionContext';

export default function NewClientModal({
  show,
  handleClose,
  handleSubmit,
  onClientCreated,
}) {
  const {
    calles,
    municipiosOrdenados,
    provincias,
    serviciosDisponibles,
    tributos,
  } = useContext(FacturacionContext);

  // Estados
  const [localCalles, setLocalCalles] = useState(calles);
  const [localShow, setLocalShow] = useState(show);
  const [keyboardEnabled, setKeyboardEnabled] = useState(true);
  const [step, setStep] = useState(1);

  const [clientType, setClientType] = useState(''); // 'Persona' | 'Empresa'
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

  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);

  // Sincronizar props/contexto
  useEffect(() => setLocalCalles(calles), [calles]);
  useEffect(() => setLocalShow(show), [show]);

  // Agrupar servicios por tributo
  const groupedServices = useMemo(() => {
    return serviciosDisponibles.reduce((acc, svc) => {
      const tid = svc.tributo_id;
      const tname =
        tributos.find((t) => t.id === tid)?.nombre || `Tributo ${tid}`;
      if (!acc[tid]) acc[tid] = { tributo: { id: tid, nombre: tname }, services: [] };
      acc[tid].services.push(svc);
      return acc;
    }, {});
  }, [serviciosDisponibles, tributos]);

  // Filtrar municipios
  const filteredMunicipios = useMemo(() => {
    if (!domicilio.provincia_id) return [];
    return municipiosOrdenados.filter(
      (m) => String(m.provincia_id) === domicilio.provincia_id
    );
  }, [municipiosOrdenados, domicilio.provincia_id]);

  // Handlers
  const handleClientTypeChange = (e) => {
    const v = e.target.value;
    setClientType(v);
    if (v === 'Persona') {
      setEmpresaData({ nombre: '', cuit: '' });
    } else {
      setPersonaData({
        nombre: '',
        apellido: '',
        dni: '',
        email: '',
        telefono: '',
        f_nacimiento: '',
      });
    }
  };
  const handlePersonaChange = (e) =>
    setPersonaData((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleEmpresaChange = (e) =>
    setEmpresaData((eP) => ({ ...eP, [e.target.name]: e.target.value }));
  const handleDomicilioChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDomicilio((d) => ({
      ...d,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'provincia_id' && { municipio_id: '', calle_id: '' }),
      ...(name === 'municipio_id' && { calle_id: '' }),
    }));
  };
  const handleServiceCheckboxChange = (e) => {
    const id = Number(e.target.value);
    setServiciosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const handleAddNewCalle = async () => {
    setKeyboardEnabled(false);
    try {
      const { value: nombre } = await Swal.fire({
        title: 'Agregar nueva calle',
        input: 'text',
        inputLabel: 'Nombre de la calle',
        inputPlaceholder: 'Ingresa el nombre de la calle',
        showCancelButton: true,
        inputValidator: (v) => (!v?.trim() && 'Ingresa un nombre válido.'),
      });
      if (!nombre) return;
      const trimmed = nombre.trim();
      if (
        localCalles.some((c) => c.nombre.toLowerCase() === trimmed.toLowerCase())
      ) {
        await Swal.fire('Calle existente', 'Ya existe esa calle.', 'warning');
        return;
      }
      const nueva = await customFetch('/calles', 'POST', { nombre: trimmed });
      setLocalCalles((c) => [...c, nueva]);
      setDomicilio((d) => ({ ...d, calle_id: String(nueva.id) }));
      await Swal.fire('Éxito', 'Calle agregada correctamente.', 'success');
    } catch {
      await Swal.fire('Error', 'No se pudo agregar la calle.', 'error');
    } finally {
      setKeyboardEnabled(true);
    }
  };

  // Validaciones
  const validateStep1 = () => {
    if (!clientType) {
      Swal.fire('Atención', 'Selecciona Persona o Empresa.', 'warning');
      return false;
    }
    if (clientType === 'Persona') {
      const { nombre, apellido, dni, email, telefono, f_nacimiento } = personaData;
      if (!nombre || !apellido || !dni || !email || !telefono || !f_nacimiento) {
        Swal.fire('Campos incompletos', 'Completa todos los datos.', 'warning');
        return false;
      }
      if (!/^\d+$/.test(dni)) {
        Swal.fire('Error', 'DNI solo números.', 'error');
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        Swal.fire('Error', 'Email inválido.', 'error');
        return false;
      }
      if (!/^\d+$/.test(telefono)) {
        Swal.fire('Error', 'Teléfono solo números.', 'error');
        return false;
      }
    } else {
      const { nombre, cuit } = empresaData;
      if (!nombre || !cuit) {
        Swal.fire('Campos incompletos', 'Completa nombre y CUIT.', 'warning');
        return false;
      }
      if (!/^\d+$/.test(cuit)) {
        Swal.fire('Error', 'CUIT solo números.', 'error');
        return false;
      }
    }
    return true;
  };
  const validateStep2 = () => {
    const { provincia_id, municipio_id, calle_id, altura, codigo_postal } = domicilio;
    if (!provincia_id || !municipio_id || !calle_id) {
      Swal.fire('Campos incompletos', 'Completa la dirección.', 'warning');
      return false;
    }
    if (altura !== '' && Number(altura) <= 0) {
      Swal.fire('Error', 'Si indicás altura debe ser un valor positivo.', 'error');
      return false;
    }
    if (codigo_postal !== '' && !/^\d+$/.test(codigo_postal)) {
      Swal.fire('Error', 'Código postal solo números.', 'error');
      return false;
    }
    return true;
  };

  // Navegación
  const goNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };
  const goBack = () => step > 1 && setStep((s) => s - 1);
  const resetForm = () => {
    setStep(1);
    setClientType('');
    setPersonaData({ nombre:'', apellido:'', dni:'', email:'', telefono:'', f_nacimiento:'' });
    setEmpresaData({ nombre:'', cuit:'' });
    setDomicilio({
      provincia_id:'', municipio_id:'', calle_id:'',
      altura:'', codigo_postal:'', n_casa:'', n_piso:'', n_departamento:'',
      es_esquina:false, calle_esquina_id:'', referencia:'',
    });
    setServiciosSeleccionados([]);
  };
  const handleModalClose = () => {
    resetForm();
    handleClose();
  };

  // Envío final con resumen visual
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2()) return;
    if (serviciosSeleccionados.length === 0) {
      Swal.fire('Servicios requeridos', 'Debes asignar al menos un servicio al cliente.', 'warning');
      return;
    }

    // Armar payload
    let payload = {
      provincia_id: Number(domicilio.provincia_id),
      municipio_id: Number(domicilio.municipio_id),
      calle_id: Number(domicilio.calle_id),
      ...(domicilio.altura !== '' && { altura: Number(domicilio.altura) }),
      ...(domicilio.codigo_postal !== '' && { codigo_postal: Number(domicilio.codigo_postal) }),
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

    // Resumen visual con bloques y campos opcionales
    const resumenHtml = `
      <div style="text-align:left;max-width:480px;margin:0 auto;font-size:15px">
        <h6 style="margin-bottom:4px">🧑 Datos del cliente</h6>
        <div style="margin-left:8px">
          <div><strong>Tipo:</strong> ${clientType}</div>
          ${
            clientType === 'Persona'
              ? `
            <div><strong>Nombre:</strong> ${payload.nombre}</div>
            <div><strong>Apellido:</strong> ${payload.apellido}</div>
            <div><strong>DNI:</strong> ${payload.dni}</div>
            <div><strong>Email:</strong> ${payload.email}</div>
            <div><strong>Teléfono:</strong> ${payload.telefono}</div>
            <div><strong>F. Nac.:</strong> ${payload.f_nacimiento}</div>
          `
              : `
            <div><strong>Razón Social:</strong> ${payload.nombre}</div>
            <div><strong>CUIT:</strong> ${payload.cuit}</div>
          `
          }
        </div>
        <hr/>
        <h6 style="margin-bottom:4px">🏠 Dirección</h6>
        <div style="margin-left:8px">
          <div><strong>Provincia:</strong> ${provincias.find(p => p.id === payload.provincia_id)?.nombre || '<span style="color:#888">–</span>'}</div>
          <div><strong>Municipio:</strong> ${municipiosOrdenados.find(m => m.id === payload.municipio_id)?.nombre || '<span style="color:#888">–</span>'}</div>
          <div><strong>Calle:</strong> ${localCalles.find(c => c.id === payload.calle_id)?.nombre || '<span style="color:#888">–</span>'}</div>
          <div><strong>Altura:</strong> ${payload.altura != null ? payload.altura : '<span style="color:#888">–</span>'}</div>
          <div><strong>C.P.:</strong> ${payload.codigo_postal != null ? payload.codigo_postal : '<span style="color:#888">–</span>'}</div>
          <div><strong>N° Casa:</strong> ${payload.n_casa || '<span style="color:#888">–</span>'}</div>
          <div><strong>Piso:</strong> ${payload.n_piso || '<span style="color:#888">–</span>'}</div>
          <div><strong>Depto:</strong> ${payload.n_departamento || '<span style="color:#888">–</span>'}</div>
          <div><strong>Esquina:</strong> ${payload.es_esquina ? 'Sí' : 'No'}</div>
          ${
            payload.es_esquina
              ? `<div><strong>Calle Esquina:</strong> ${localCalles.find(c => c.id === Number(payload.calle_esquina_id))?.nombre || '<span style="color:#888">–</span>'}</div>`
              : ''
          }
          <div><strong>Referencia:</strong> ${payload.referencia || '<span style="color:#888">–</span>'}</div>
        </div>
        <hr/>
        <h6 style="margin-bottom:4px">🔗 Servicios asignados</h6>
        <div style="margin-left:8px">
          ${
            serviciosSeleccionados.length > 0
              ? serviciosSeleccionados
                  .map(
                    (id) =>
                      serviciosDisponibles.find((s) => s.id === id)?.nombre
                  )
                  .filter(Boolean)
                  .join(', ')
              : '<span style="color:#888">– Ninguno –</span>'
          }
        </div>
      </div>
    `;

    const confirm = await Swal.fire({
      title: 'Revisá los datos antes de crear',
      html: resumenHtml,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, crear',
      cancelButtonText: 'Cancelar',
      width: 600,
    });
    if (!confirm.isConfirmed) return;

    let newClient = null;
    try {
      // 1. Crear cliente
      newClient = await handleSubmit(payload);

      // 2. Asignar servicios
      await customFetch(
        `/clientes/${newClient.id}/sincronizar-servicios`,
        'POST',
        { servicios: serviciosSeleccionados.map((id) => String(id)) }
      );

      await Swal.fire('Éxito', 'Cliente creado correctamente.', 'success');
      handleModalClose();
      onClientCreated?.();

    } catch (err) {
      if (newClient && newClient.id) {
        // (borrado automático)
      } else {
        Swal.fire('Error', err.message || 'No se pudo crear el cliente.', 'error');
      }
    }
  };

  return (
    <Modal
      show={localShow}
      onHide={handleModalClose}
      centered
      keyboard={keyboardEnabled}
      enforceFocus={false}
      restoreFocus={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>Nuevo Cliente</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Leyenda campos requeridos y paso */}
        <div className="mb-2 d-flex justify-content-between align-items-center">
          <small className="text-muted">
            <span className="text-danger">*</span> Campos obligatorios
          </small>
          <span className="badge bg-light text-dark">{`Paso ${step} de 3`}</span>
        </div>
        <Form onSubmit={onSubmit}>
          {/* STEP 1 */}
          {step === 1 && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>
                  ¿Es Persona o Empresa? <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select value={clientType} onChange={handleClientTypeChange} autoFocus>
                  <option value="">-- Seleccione --</option>
                  <option value="Persona">Persona</option>
                  <option value="Empresa">Empresa</option>
                </Form.Select>
              </Form.Group>
              {clientType === 'Persona' ? (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombre <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      name="nombre"
                      value={personaData.nombre}
                      onChange={handlePersonaChange}
                      placeholder="Ej: Juan"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Apellido <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      name="apellido"
                      value={personaData.apellido}
                      onChange={handlePersonaChange}
                      placeholder="Ej: Pérez"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>DNI <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      name="dni"
                      value={personaData.dni}
                      onChange={handlePersonaChange}
                      placeholder="Sólo números"
                    />
                    <Form.Text muted>Sin puntos ni espacios.</Form.Text>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={personaData.email}
                      onChange={handlePersonaChange}
                      placeholder="Ej: ejemplo@email.com"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Teléfono <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      name="telefono"
                      value={personaData.telefono}
                      onChange={handlePersonaChange}
                      placeholder="Ej: 2994001234"
                    />
                    <Form.Text muted>Ingresar sólo números.</Form.Text>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha de Nacimiento <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="date"
                      name="f_nacimiento"
                      value={personaData.f_nacimiento}
                      onChange={handlePersonaChange}
                    />
                  </Form.Group>
                </>
              ) : clientType === 'Empresa' ? (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Razón Social <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      name="nombre"
                      value={empresaData.nombre}
                      onChange={handleEmpresaChange}
                      placeholder="Ej: Ferretería El Tornillo"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>CUIT <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      name="cuit"
                      value={empresaData.cuit}
                      onChange={handleEmpresaChange}
                      placeholder="Sólo números"
                    />
                    <Form.Text muted>Sin guiones ni espacios.</Form.Text>
                  </Form.Group>
                </>
              ) : null}
              <div className="d-flex justify-content-end">
                <Button variant="primary" onClick={goNext} disabled={!clientType}>
                  Siguiente
                </Button>
              </div>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <h5 className="mb-3">Dirección</h5>
              <Form.Group className="mb-3">
                <Form.Label>
                  Provincia <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="provincia_id"
                  value={domicilio.provincia_id}
                  onChange={handleDomicilioChange}
                >
                  <option value="">-- Seleccione provincia --</option>
                  {provincias.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>
                  Municipio <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="municipio_id"
                  value={domicilio.municipio_id}
                  onChange={handleDomicilioChange}
                  disabled={!domicilio.provincia_id}
                >
                  <option value="">-- Seleccione municipio --</option>
                  {filteredMunicipios.map((m) => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>
                  Calle <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="calle_id"
                  value={domicilio.calle_id}
                  onChange={handleDomicilioChange}
                  disabled={!domicilio.municipio_id}
                >
                  <option value="">-- Seleccione calle --</option>
                  {localCalles.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </Form.Select>
                <Button variant="link" onClick={handleAddNewCalle}>
                  Agregar nueva calle
                </Button>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>
                  Altura <span className="text-muted">(opcional)</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  name="altura"
                  value={domicilio.altura}
                  onChange={handleDomicilioChange}
                  placeholder="Ej: 123"
                  min={0}
                />
                <Form.Text muted>Dejar vacío si la dirección no tiene numeración.</Form.Text>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>
                  Código Postal <span className="text-muted">(opcional)</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  name="codigo_postal"
                  value={domicilio.codigo_postal}
                  onChange={handleDomicilioChange}
                  placeholder="Ej: 8340"
                  min={0}
                />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>N° Casa <span className="text-muted">(opcional)</span></Form.Label>
                    <Form.Control
                      type="number"
                      name="n_casa"
                      value={domicilio.n_casa}
                      onChange={handleDomicilioChange}
                      min={0}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Piso <span className="text-muted">(opcional)</span></Form.Label>
                    <Form.Control
                      type="number"
                      name="n_piso"
                      value={domicilio.n_piso}
                      onChange={handleDomicilioChange}
                      min={0}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Depto <span className="text-muted">(opcional)</span></Form.Label>
                    <Form.Control
                      type="number"
                      name="n_departamento"
                      value={domicilio.n_departamento}
                      onChange={handleDomicilioChange}
                      min={0}
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
                    {localCalles.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}
              <Form.Group className="mb-3">
                <Form.Label>Referencia <span className="text-muted">(opcional)</span></Form.Label>
                <Form.Control
                  name="referencia"
                  value={domicilio.referencia}
                  onChange={handleDomicilioChange}
                  placeholder="Indicaciones adicionales"
                />
              </Form.Group>
              <div className="d-flex justify-content-between">
                <Button variant="secondary" onClick={goBack}>Volver</Button>
                <Button variant="primary" onClick={goNext}>Siguiente</Button>
              </div>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <h5 className="mb-3">Servicios a Asignar</h5>
              {Object.keys(groupedServices).length === 0 ? (
                <p>No hay servicios disponibles</p>
              ) : (
                Object.entries(groupedServices).map(([_, g]) => (
                  <div key={g.tributo.id} className="mb-3">
                    <h6>{g.tributo.nombre}</h6>
                    <Row>
                      {g.services.map((svc) => (
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
                <Button variant="secondary" onClick={goBack}>Volver</Button>
                <Button variant="primary" type="submit">Crear Cliente</Button>
              </div>
            </>
          )}
        </Form>
      </Modal.Body>
    </Modal>
  );
}
