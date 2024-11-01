// src/features/facturacion/components/BombeoAgua/BombeoAguaForm.jsx

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useContext,
  useMemo,
} from 'react';
import {
  Form,
  Row,
  Col,
  Card,
  InputGroup,
  ListGroup,
  Table,
  Spinner,
} from 'react-bootstrap';
import Swal from 'sweetalert2';
import CustomButton from '../../../../components/common/botons/CustomButton.jsx';
import '../../../../styles/PeriodosBombeoForm.css';
import { BombeoAguaContext } from '../../../../context/BombeoAguaContext.jsx';
import customFetch from '../../../../context/CustomFetch.js';

const BombeoAguaForm = () => {
  const { handleCreatePeriodo } = useContext(BombeoAguaContext);

  const [clients, setClients] = useState([]);
  const [client, setClient] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);
  const [showClientList, setShowClientList] = useState(false);
  const [volume, setVolume] = useState('');
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [service, setService] = useState('');
  const [month, setMonth] = useState('');
  const [cuota, setCuota] = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [moduleRate, setModuleRate] = useState(0);
  const [totalModules, setTotalModules] = useState(0);
  const [totalInPesos, setTotalInPesos] = useState(0);
  const [selectedClient, setSelectedClient] = useState({});
  const [moduleValue, setModuleValue] = useState(0);
  const [periodos, setPeriodos] = useState([]);
  const [loadingPeriodos, setLoadingPeriodos] = useState(false);
  const [recordsLimit, setRecordsLimit] = useState(6);

  const clientDropdownRef = useRef(null);

  // Obtener el valor del módulo
  const fetchModuleValue = useCallback(async () => {
    try {
      const data = await customFetch(
        'http://10.0.0.17/municipalidad/public/api/general'
      );
      setModuleValue(data.valor_modulo);
    } catch (error) {
      console.error('Error al obtener el valor del módulo:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al obtener el valor del módulo.',
      });
    }
  }, []);

  // Obtener clientes y servicios
  const fetchTributoData = useCallback(async () => {
    try {
      const data = await customFetch(
        'http://10.0.0.17/municipalidad/public/api/tributos/1'
      );
      const servicios = data.servicios;
      const clientesFromServices = servicios.flatMap(
        (servicio) => servicio.clientes
      );

      // Eliminar clientes duplicados usando su ID
      const uniqueClientsMap = new Map();
      clientesFromServices.forEach((client) => {
        uniqueClientsMap.set(client.id, client);
      });
      const uniqueClients = Array.from(uniqueClientsMap.values());

      // Ordenar los clientes alfabéticamente por nombre y apellido
      uniqueClients.sort((a, b) => {
        const nameA = `${a.persona?.nombre || ''} ${
          a.persona?.apellido || ''
        }`.toLowerCase();
        const nameB = `${b.persona?.nombre || ''} ${
          b.persona?.apellido || ''
        }`.toLowerCase();
        return nameA.localeCompare(nameB);
      });

      setServices(servicios);
      setClients(uniqueClients);
      setFilteredClients(uniqueClients);
    } catch (error) {
      console.error('Error al obtener los datos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al obtener los datos.',
      });
    }
  }, []);

  const fetchPeriodos = useCallback(
    async (cliente_id) => {
      setLoadingPeriodos(true);
      setPeriodos([]);
      try {
        const data = await customFetch(
          `http://10.0.0.17/municipalidad/public/api/cuentas?cliente_id=${cliente_id}`
        );

        const periodosCliente = (data[0] || []).filter(
          (periodo) => periodo.cliente_id === parseInt(cliente_id)
        );

        const periodosUnicos = Array.from(
          new Set(periodosCliente.map(JSON.stringify))
        ).map(JSON.parse);
        setPeriodos(periodosUnicos);
      } catch (error) {
        console.error('Error al obtener los períodos:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al obtener los períodos del cliente.',
        });
      } finally {
        setLoadingPeriodos(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchModuleValue();
    fetchTributoData();
  }, [fetchModuleValue, fetchTributoData]);

  useEffect(() => {
    setFilteredClients(
      clients.filter((client) => {
        const clientName = `${client.persona?.nombre} ${client.persona?.apellido}`.toLowerCase();
        const clientDNI = client.persona?.dni
          ? client.persona.dni.toString()
          : '';

        return (
          clientName.includes(searchTerm.toLowerCase()) ||
          clientDNI.includes(searchTerm)
        );
      })
    );
    setShowClientList(searchTerm.length > 0);
  }, [searchTerm, clients]);

  const filterServicesByClient = useCallback(
    (selectedClientId) => {
      const availableServices = services.filter((servicio) =>
        servicio.clientes.some(
          (cliente) => cliente.id === parseInt(selectedClientId)
        )
      );
      setFilteredServices(availableServices);

      if (availableServices.length === 1) {
        setService(availableServices[0].id);
        setModuleRate(availableServices[0].modulos);
      }
    },
    [services]
  );

  const handleClientSelect = useCallback(
    (clientId) => {
      const clientData = clients.find((c) => c.id === parseInt(clientId));
      setSelectedClient(clientData?.persona || {});
      setClient(clientId);
      setSearchTerm(
        `${clientData.persona?.nombre} ${clientData.persona?.apellido}`
      );
      filterServicesByClient(clientId);
      setShowClientList(false);
      fetchPeriodos(clientId);
    },
    [clients, filterServicesByClient, fetchPeriodos]
  );

  const handleClickOutside = useCallback(
    (event) => {
      if (
        clientDropdownRef.current &&
        !clientDropdownRef.current.contains(event.target)
      ) {
        setShowClientList(false);
      }
    },
    [clientDropdownRef]
  );

  const handleKeyPress = useCallback((event) => {
    if (event.key === 'Escape') {
      setShowClientList(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleClickOutside, handleKeyPress]);

  useEffect(() => {
    const totalModulos = moduleRate * volume;
    setTotalModules(totalModulos);
    setTotalInPesos(totalModulos * moduleValue);
  }, [moduleRate, volume, moduleValue]);

  const getServiceNameById = useCallback(
    (serviceId) => {
      const selectedService = services.find(
        (servicio) => servicio.id === parseInt(serviceId)
      );
      return selectedService ? selectedService.nombre : 'Servicio desconocido';
    },
    [services]
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (volume <= 0) {
      Swal.fire(
        'Error',
        'El volumen de agua debe ser mayor que cero.',
        'error'
      );
      return;
    }

    const periodoData = {
      cliente_id: client,
      clientName: `${selectedClient?.nombre} ${selectedClient?.apellido}`,
      dni: selectedClient?.dni,
      volume,
      servicio_id: service,
      service: getServiceNameById(service),
      totalAmount: `AR$ ${totalInPesos.toFixed(2)}`,
      totalModules,
      cuota,
      month,
      vencimiento,
    };

    handleCreatePeriodo(periodoData);
    Swal.fire(
      'Periodo generado',
      'El periodo ha sido agregado a la lista.',
      'success'
    );
    handleReset();
  };

  const handleReset = () => {
    setClient('');
    setSearchTerm('');
    setFilteredClients(clients);
    setVolume('');
    setService('');
    setMonth('');
    setCuota('');
    setVencimiento('');
    setModuleRate(0);
    setTotalModules(0);
    setTotalInPesos(0);
    setSelectedClient({});
    setShowClientList(false);
    setPeriodos([]);
  };

  const handleVolumeChange = (e) => {
    const value = Math.max(0, e.target.value);
    setVolume(value);
  };

  const handleCuotaChange = (e) => {
    const value = Math.max(1, e.target.value);
    setCuota(value);
  };

  const monthOptions = useMemo(
    () => [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ],
    []
  );

  return (
    <Card className="shadow-sm p-5 mt-4 bombeo-agua-form">
      <h2 className="text-center mb-5 text-primary font-weight-bold">
        Generar Periodo de Bombeo de Agua
      </h2>
      <Form onSubmit={handleSubmit} className="px-4">
        {/* Información del Cliente */}
        <section className="form-section mb-4">
          <h4 className="mb-4 text-secondary font-weight-bold">
            Información del Cliente
          </h4>
          <Row>
            <Col md={6}>
              <Form.Group
                controlId="client"
                ref={clientDropdownRef}
                className="client-container"
              >
                <Form.Label className="font-weight-bold">
                  Cliente <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={searchTerm}
                  placeholder="Buscar cliente por nombre o DNI/CUIT"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={() => setShowClientList(true)}
                  required
                  className="rounded"
                  aria-label="Buscar cliente por nombre o DNI/CUIT"
                />
                {showClientList && (
                  <ListGroup
                    className="position-absolute client-dropdown"
                    style={{
                      maxHeight: '200px',
                      overflowY: 'auto',
                      width: '100%',
                      zIndex: 1000,
                    }}
                    role="listbox"
                  >
                    {filteredClients.length > 0 ? (
                      filteredClients.map((client) => (
                        <ListGroup.Item
                          key={client.id}
                          action
                          onClick={() => handleClientSelect(client.id)}
                          role="option"
                          aria-selected={client.id === client}
                        >
                          {client.persona?.nombre} {client.persona?.apellido} -{' '}
                          {client.persona?.dni}
                        </ListGroup.Item>
                      ))
                    ) : (
                      <ListGroup.Item disabled>
                        No se encontraron clientes.
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                )}
              </Form.Group>
            </Col>
          </Row>
        </section>

        {/* Tabla de Períodos del Cliente */}
        <section className="form-section mb-4">
          <h4 className="mb-4 text-secondary font-weight-bold">
            Historial de Períodos
          </h4>
          <div className="table-responsive"> {/* Contenedor para desplazamiento horizontal */}
            <Table striped bordered hover className="mt-2">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>DNI/CUIT</th>
                  <th>Mes</th>
                  <th>Año</th>
                  <th>Cuota</th>
                  <th>Importe</th>
                  <th>Descuento</th>
                  <th>Recargo</th>
                  <th>Total</th>
                  <th>Vencimiento</th>
                  <th>Recibo Generado</th>
                  <th>Condición</th>
                  <th>Fecha de Pago</th>
                </tr>
              </thead>
              <tbody>
                {loadingPeriodos ? (
                  <tr>
                    <td colSpan="13" className="text-center">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </Spinner>
                    </td>
                  </tr>
                ) : !client ? (
                  <tr>
                    <td colSpan="14" className="text-center text-muted">
                      No hay cliente seleccionado.
                    </td>
                  </tr>
                ) : periodos.length > 0 ? (
                  periodos.slice(0, recordsLimit).map((periodo, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        {periodo.cliente?.persona?.nombre}{' '}
                        {periodo.cliente?.persona?.apellido}
                      </td>
                      <td>{periodo.cliente.persona.dni}</td>
                      <td>{periodo.mes}</td>
                      <td>{periodo.año}</td>
                      <td>{periodo.cuota}</td>
                      <td>{`AR$ ${periodo.i_debito}`}</td>
                      <td>{`AR$ ${periodo.i_descuento}`}</td>
                      <td>{`AR$ ${periodo.i_recargo}`}</td>
                      <td>{`AR$ ${(periodo.i_debito - periodo.i_descuento + periodo.i_recargo).toFixed(2)}`}</td>
                      <td>
                        {new Date(periodo.f_vencimiento).toLocaleDateString()}
                      </td>
                      <td>{periodo.n_recibo_generado}</td>
                      <td>{periodo.condicion_pago}</td>
                      <td>{periodo.f_pago}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="14" className="text-center text-muted">
                      No hay períodos para este cliente.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
          {periodos.length > 6 && (
            <div className="text-center mt-2">
              <CustomButton
                variant="outline-secondary"
                onClick={() =>
                  setRecordsLimit(
                    recordsLimit === 6 ? periodos.length : 6
                  )
                }
              >
                {recordsLimit === 6 ? 'Mostrar más' : 'Mostrar menos'}
              </CustomButton>
            </div>
          )}
        </section>

        {/* Detalles del Servicio */}
        <section className="form-section mb-4">
          <Row>
            <Col md={6}>
              <Form.Group controlId="volume">
                <Form.Label className="font-weight-bold">
                  Volumen de Agua Bombeada (m³){' '}
                  <span className="text-danger">*</span>
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    value={volume}
                    onChange={handleVolumeChange}
                    placeholder="Ingrese volumen"
                    required
                    className="rounded"
                    aria-label="Volumen de agua bombeada en metros cúbicos"
                  />
                  <InputGroup.Text>m³</InputGroup.Text>
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="service">
                <Form.Label className="font-weight-bold">
                  Tipo de Servicio
                </Form.Label>
                <Form.Control
                  as="select"
                  value={service}
                  onChange={(e) => {
                    setService(e.target.value);
                    const selectedService = services.find(
                      (s) => s.id === parseInt(e.target.value)
                    );
                    setModuleRate(selectedService?.modulos || 0);
                  }}
                  className="rounded"
                  aria-label="Seleccione un tipo de servicio"
                >
                  <option value="">Seleccione un tipo de servicio</option>
                  {filteredServices.map((servicio) => (
                    <option key={servicio.id} value={servicio.id}>
                      {servicio.nombre}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>
        </section>

        {/* Información de Factura */}
        <section className="form-section mb-4">
          <Row>
            <Col md={6}>
              <h4 className="mb-4 text-secondary font-weight-bold">
                Información de Factura
              </h4>
              <Form.Group controlId="month">
                <Form.Label className="font-weight-bold">
                  Mes de Facturación{' '}
                  <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  as="select"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  required
                  className="rounded"
                  aria-label="Seleccione el mes de facturación"
                >
                  <option value="">Seleccione un mes</option>
                  {monthOptions.map((monthName, index) => (
                    <option key={index} value={monthName}>
                      {monthName}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="cuota" className="mt-3">
                <Form.Label className="font-weight-bold">
                  Cuota <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  value={cuota}
                  onChange={handleCuotaChange}
                  placeholder="Ingrese la cuota"
                  required
                  className="rounded"
                  aria-label="Ingrese la cuota"
                />
              </Form.Group>

              <Form.Group controlId="vencimiento" className="mt-3">
                <Form.Label className="font-weight-bold">
                  Fecha de Vencimiento{' '}
                  <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  value={vencimiento}
                  onChange={(e) => setVencimiento(e.target.value)}
                  required
                  className="rounded"
                  aria-label="Seleccione la fecha de vencimiento"
                />
              </Form.Group>
            </Col>

            <Col
              md={6}
              className="d-flex justify-content-center align-items-center"
            >
              <div className="text-center">
                <h4 className="mb-4 text-secondary font-weight-bold">
                  Total a Pagar
                </h4>
                <h1 className="display-4 font-weight-bold text-primary mb-0">
                  AR$ {totalInPesos.toFixed(2)}
                </h1>
                <h3 className="text-secondary">
                  {totalModules} Módulos
                </h3>
                <p className="text-muted">
                  Cliente: {selectedClient?.nombre}{' '}
                  {selectedClient?.apellido} <br />
                  DNI/CUIT: {selectedClient?.dni} <br />
                  Servicio: {getServiceNameById(service)} <br />
                  Volumen: {volume} m³ ({volume * 1000} litros) <br />
                  Cuota: {cuota} <br />
                  Mes: {month} <br />
                  Vencimiento: {vencimiento}
                </p>
              </div>
            </Col>
          </Row>
        </section>

        {/* Botones de Acción */}
        <div className="d-flex justify-content-center mt-4">
          <CustomButton
            type="submit"
            variant="secondary"
            className="me-3 px-5 py-2 font-weight-bold"
            aria-label="Generar Periodo"
          >
            Generar Periodo
          </CustomButton>
          <CustomButton
            type="reset"
            variant="outline-secondary"
            onClick={handleReset}
            className="px-5 py-2 font-weight-bold"
            aria-label="Limpiar Formulario"
          >
            Limpiar
          </CustomButton>
        </div>
      </Form>
    </Card>
  );
};

export default BombeoAguaForm;
