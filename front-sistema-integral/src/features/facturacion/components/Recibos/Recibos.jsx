import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Table, Card, InputGroup } from 'react-bootstrap';
import Swal from 'sweetalert2';
import axios from 'axios';
import CustomButton from '../../../../components/common/botons/CustomButton';
import '../../../../styles/RecibosForm.css'; // Estilo similar al de BombeoAgua

const Recibos = () => {
  const [clients, setClients] = useState([]);
  const [client, setClient] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState({});
  const [periodos, setPeriodos] = useState([]);
  const [selectedPeriodos, setSelectedPeriodos] = useState([]);
  const [total, setTotal] = useState(0);

  // Función para obtener los clientes
  const fetchClientes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://10.0.0.17/municipalidad/public/api/clientes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(response.data);
      setFilteredClients(response.data);
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al obtener los clientes.', 'error');
    }
  };

  // Función para obtener los periodos de un cliente desde la ruta 'api/cuentas'
  const fetchPeriodos = async (clienteId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://10.0.0.17/municipalidad/public/api/cuentas?cliente_id=${clienteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPeriodos(response.data);
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al obtener los periodos del cliente.', 'error');
    }
  };

  // Efecto para cargar los clientes al montar el componente
  useEffect(() => {
    fetchClientes();
  }, []);

  // Manejar la selección del cliente
  const handleClientChange = (clientId) => {
    const selectedClient = clients.find((c) => c.id === parseInt(clientId));
    setSelectedClient(selectedClient?.persona || {});
    setClient(clientId);
    fetchPeriodos(clientId); // Obtener periodos del cliente seleccionado
  };

  // Manejar la selección de los periodos
  const handlePeriodoSelect = (periodo) => {
    const alreadySelected = selectedPeriodos.find((p) => p.id === periodo.id);
    if (alreadySelected) {
      setSelectedPeriodos(selectedPeriodos.filter((p) => p.id !== periodo.id));
      setTotal(total - periodo.total); // Restar del total
    } else {
      setSelectedPeriodos([...selectedPeriodos, periodo]);
      setTotal(total + periodo.total); // Sumar al total
    }
  };

  // Manejar el campo de búsqueda de clientes
  useEffect(() => {
    setFilteredClients(
      clients.filter((client) =>
        `${client.persona?.nombre} ${client.persona?.apellido}`.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, clients]);

  // Función para generar el recibo
  const generarRecibo = async () => {
    if (!client || selectedPeriodos.length === 0) {
      Swal.fire('Error', 'Debes seleccionar un cliente y al menos un periodo para generar el recibo.', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://10.0.0.17/municipalidad/public/api/recibos', {
        cliente_id: client,
        periodos: selectedPeriodos.map((p) => p.id),
        total,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire('Recibo generado', 'El recibo ha sido generado exitosamente.', 'success');
      // Resetear el formulario
      setClient('');
      setPeriodos([]);
      setSelectedPeriodos([]);
      setTotal(0);
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al generar el recibo.', 'error');
    }
  };

  return (
    <Card className="shadow-sm p-4 mt-4">
      <h2 className="text-center mb-5 text-primary font-weight-bold">Generar Recibo</h2>
      <Form>
        <section className="form-section mb-4">
          <h4 className="mb-4 text-secondary font-weight-bold">Información del Cliente</h4>
          <Row>
            <Col md={8}>
              <Form.Group controlId="client">
                <Form.Label>Cliente</Form.Label>
                <Form.Control as="select" value={client} onChange={(e) => handleClientChange(e.target.value)} required>
                  <option value="">Selecciona un cliente</option>
                  {filteredClients.map((client, index) => (
                    <option key={client.id} value={client.id}>
                      {client.persona?.nombre} {client.persona?.apellido}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="searchClient">
                <Form.Label>Buscar Cliente</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Buscar por nombre"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
        </section>

        {periodos.length > 0 && (
          <>
            <h4 className="mt-4">Periodos de Facturación</h4>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Mes</th>
                  <th>Año</th>
                  <th>Cuota</th>
                  <th>Total</th>
                  <th>Seleccionar</th>
                </tr>
              </thead>
              <tbody>
                {periodos.map((periodo) => (
                  <tr key={periodo.id}>
                    <td>{periodo.id}</td>
                    <td>{periodo.mes}</td>
                    <td>{periodo.año}</td>
                    <td>{periodo.cuota}</td>
                    <td>AR$ {periodo.total}</td>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={selectedPeriodos.includes(periodo)}
                        onChange={() => handlePeriodoSelect(periodo)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <div className="text-center">
              <h4>Total a Pagar: AR$ {total.toFixed(2)}</h4>
            </div>

            <div className="d-flex justify-content-center mt-4">
              <CustomButton
                type="button"
                variant="primary"
                onClick={generarRecibo}
                disabled={selectedPeriodos.length === 0}
              >
                Generar Recibo
              </CustomButton>
            </div>
          </>
        )}
      </Form>
    </Card>
  );
};

export default Recibos;
