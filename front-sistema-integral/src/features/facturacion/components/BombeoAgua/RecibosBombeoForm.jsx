import React, { useState, useEffect, useRef } from 'react';
import { Form, Row, Col, Card, Table, ListGroup, Spinner } from 'react-bootstrap'; 
import Swal from 'sweetalert2';
import CustomButton from '../../../../components/common/botons/CustomButton.jsx';
import '../../../../styles/RecibosBombeoForm.css';
import customFetch from '../../../../context/CustomFetch.js';

const RecibosBombeoForm = ({ onAddRecibo }) => {
  const [client, setClient] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [selectedPeriodos, setSelectedPeriodos] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [vencimiento, setVencimiento] = useState('');
  const [showClientList, setShowClientList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState({});

  const clientDropdownRef = useRef(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const data = await customFetch('http://10.0.0.17/municipalidad/public/api/tributos/1');
      const servicios = data.servicios;
      const clientesFromServices = servicios.flatMap(servicio => servicio.clientes);

      const uniqueClients = Array.from(new Set(clientesFromServices.map(c => c.id)))
        .map(id => clientesFromServices.find(c => c.id === id));

      setAllClients(uniqueClients);
      setFilteredClients(uniqueClients);
    } catch (error) {
      console.error('Error al obtener los clientes:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al obtener los clientes.',
      });
    }
  };

  useEffect(() => {
    const filtered = allClients.filter(client => {
      const fullName = `${client.persona?.nombre || ''} ${client.persona?.apellido || ''}`.toLowerCase();
      const dni = client.persona?.dni ? client.persona.dni.toString() : '';
      return (
        fullName.includes(searchTerm.toLowerCase()) || dni.includes(searchTerm)
      );
    });
    setFilteredClients(filtered);
  }, [searchTerm, allClients]);

  const fetchPeriodos = async (cliente_id) => {
    setLoading(true); 
    try {
      const data = await customFetch(`http://10.0.0.17/municipalidad/public/api/cuentas?cliente_id=${cliente_id}`);
      if (data && data[0]) {
        const periodosData = data[0];

        const periodosNoFacturados = periodosData.filter(
          (periodo) => periodo.condicion_pago === null && periodo.cliente_id === parseInt(cliente_id)
        );

        setPeriodos(periodosNoFacturados);

        if (periodosNoFacturados.length === 0) {
          Swal.fire('Sin periodos', 'No hay periodos no facturados para este cliente.', 'info');
        }
      } else {
        Swal.fire('Error', 'No se encontraron datos para este cliente.', 'error');
      }
    } catch (error) {
      console.error('Error al obtener los periodos del cliente:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al obtener los periodos del cliente.',
      });
    } finally {
      setLoading(false); 
    }
  };

  const handleClientSelect = (clientId) => {
    const selectedClient = allClients.find(c => c.id === parseInt(clientId));
    setClient(clientId);
    setSearchTerm(`${selectedClient.persona?.nombre} ${selectedClient.persona?.apellido}`);
    setSelectedClient(selectedClient.persona || {});
    setShowClientList(false);
    fetchPeriodos(clientId); 
  };

  const handlePeriodSelection = (periodo) => {
    const updatedSelectedPeriodos = selectedPeriodos.includes(periodo)
      ? selectedPeriodos.filter(p => p !== periodo)
      : [...selectedPeriodos, periodo];

    setSelectedPeriodos(updatedSelectedPeriodos);

    const total = updatedSelectedPeriodos.reduce((sum, p) => sum + parseFloat(p.i_debito), 0);
    setTotalAmount(total);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedPeriodos.length === 0) {
      Swal.fire('Error', 'Debe seleccionar al menos un periodo.', 'error');
      return;
    }

    const currentDate = new Date();
    const selectedDate = new Date(vencimiento);

    // Ensure the selected date is today or later
    if (selectedDate < currentDate.setHours(0, 0, 0, 0)) {
      Swal.fire('Error', 'La fecha de vencimiento no puede ser anterior a la fecha actual.', 'error');
      return;
    }

    const confirmResult = await Swal.fire({
      title: '¿Generar Recibo?',
      text: "¿Estás seguro de generar este recibo?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, generar recibo',
    });

    if (confirmResult.isConfirmed) {
      const reciboData = {
        cliente_id: client,
        cliente_nombre: selectedClient.nombre,
        cliente_apellido: selectedClient.apellido,
        cliente_dni: selectedClient.dni,
        totalAmount,
        periodos: selectedPeriodos,
        vencimiento,
      };

      onAddRecibo(reciboData);

      Swal.fire('Confirmado', 'El recibo ha sido generado.', 'success');
      handleReset();
    }
  };

  const handleReset = () => {
    setClient('');
    setSearchTerm('');
    setFilteredClients(allClients);
    setSelectedPeriodos([]);
    setTotalAmount(0);
    setVencimiento('');
    setPeriodos([]);
    setSelectedClient({});
  };

  const handleClickOutside = (event) => {
    if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target)) {
      setShowClientList(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Generate today's date in the format "YYYY-MM-DD" for setting as minDate
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <Card className="shadow-sm p-5 mt-4 recibos-bombeo-form">
      <h2 className="text-center mb-5 text-primary font-weight-bold">Generar Recibo de Bombeo de Agua</h2>
      <Form onSubmit={handleSubmit} className="px-4">
        {/* Información del Cliente */}
        <section className="form-section mb-4">
          <h4 className="mb-4 text-secondary font-weight-bold">Información del Cliente</h4>
          <Row>
            <Col md={6}>
              <Form.Group controlId="client" ref={clientDropdownRef} className="client-container">
                <Form.Label className="font-weight-bold">Cliente <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={searchTerm}
                  placeholder="Buscar cliente por nombre o DNI/CUIT"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={() => setShowClientList(true)}
                  required
                  className="rounded"
                />
                {showClientList && (
                  <ListGroup 
                    className="position-absolute client-dropdown" 
                    style={{ maxHeight: '200px', overflowY: 'auto', width: '100%' }}
                  >
                    {filteredClients.map((client) => (
                      <ListGroup.Item
                        key={client.id}
                        action
                        onClick={() => handleClientSelect(client.id)}
                      >
                        {client.persona?.nombre} {client.persona?.apellido} - {client.persona?.dni}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Form.Group>
            </Col>
          </Row>
        </section>

        {/* Periodos Disponibles */}
        <section className="form-section mb-4">
          <h4 className="mb-4 text-secondary font-weight-bold">Periodos Impagos</h4>
          <Table striped bordered hover className="mt-2">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>DNI/CUIT</th>
                <th>Mes</th>
                <th>Año</th>
                <th>Cuota</th>
                <th>Total a Pagar</th>
                <th>Vencimiento</th>
                <th>Seleccionar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center">
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </Spinner>
                  </td>
                </tr>
              ) : !client ? (
                <tr>
                  <td colSpan="9" className="text-center text-muted">
                    No hay cliente seleccionado.
                  </td>
                </tr>
              ) : periodos.length > 0 ? (
                periodos.map((periodo, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{periodo.cliente?.persona?.nombre} {periodo.cliente?.persona?.apellido}</td>
                    <td>{periodo.cliente?.persona?.dni}</td>
                    <td>{periodo.mes}</td>
                    <td>{periodo.año}</td>
                    <td>{periodo.cuota}</td>
                    <td>{`AR$ ${periodo.i_debito}`}</td>
                    <td>{new Date(periodo.f_vencimiento).toLocaleDateString()}</td>
                    <td>
                      <Form.Check
                        type="checkbox"
                        onChange={() => handlePeriodSelection(periodo)}
                        checked={selectedPeriodos.includes(periodo)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center text-muted">
                    No hay periodos disponibles para este cliente.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </section>

        {/* Detalles del Recibo */}
        <section className="form-section mb-4">
          <Row>
            <Col md={6}>
              <Form.Group controlId="vencimiento" className="mt-3">
                <Form.Label className="font-weight-bold">Fecha de Vencimiento de recibo <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="date"
                  value={vencimiento}
                  min={getTodayDate()}
                  onChange={(e) => setVencimiento(e.target.value)}
                  required
                  className="rounded"
                />
              </Form.Group>
            </Col>
            <Col md={6} className="d-flex justify-content-center align-items-center">
              <div className="text-center">
                <h4 className="mb-4 text-secondary font-weight-bold">Total a Pagar</h4>
                <h1 className="display-4 font-weight-bold text-primary mb-0">AR$ {totalAmount.toFixed(2)}</h1>
                <p className="text-muted">
                  Cliente: {selectedClient?.nombre} {selectedClient?.apellido} <br />
                  DNI: {selectedClient?.dni} <br />                  
                  Periodos Seleccionados: {selectedPeriodos.map(p => `${p.mes}/${p.año}`).join(', ')} <br />
                  Fecha de Vencimiento: {vencimiento ? new Date(vencimiento).toLocaleDateString() : 'No asignada'} <br />
                </p>
              </div>
            </Col>
          </Row>
        </section>

        {/* Botones de acción */}
        <div className="d-flex justify-content-center mt-4">
          <CustomButton type="submit" variant="secondary" className="me-3 px-5 py-2 font-weight-bold">
            Generar Recibo
          </CustomButton>
          <CustomButton type="reset" variant="outline-secondary" onClick={handleReset} className="px-5 py-2 font-weight-bold">
            Limpiar
          </CustomButton>
        </div>
      </Form>
    </Card>
  );
};

export default RecibosBombeoForm;
