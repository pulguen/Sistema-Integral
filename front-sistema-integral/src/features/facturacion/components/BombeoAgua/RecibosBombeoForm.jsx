// src/features/facturacion/components/BombeoAgua/RecibosBombeoForm.jsx

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from 'react';
import {
  Form,
  Row,
  Col,
  Card,
  Table,
  ListGroup,
  Spinner,
} from 'react-bootstrap';
import Swal from 'sweetalert2';
import CustomButton from '../../../../components/common/botons/CustomButton.jsx';
import '../../../../styles/RecibosBombeoForm.css';
import customFetch from '../../../../context/CustomFetch.js';
import { AuthContext } from '../../../../context/AuthContext';
import { BombeoAguaContext } from '../../../../context/BombeoAguaContext.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileInvoiceDollar } from '@fortawesome/free-solid-svg-icons';

const RecibosBombeoForm = () => {
  const { servicios, handleCreateRecibo } = useContext(BombeoAguaContext);
  const { user } = useContext(AuthContext);

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
  const [observaciones, setObservaciones] = useState('');

  const clientDropdownRef = useRef(null);

  // Función para obtener el nombre del servicio según el cliente
  const getServiceNameByClientId = useCallback(
    (clientId) => {
      const servicio = servicios.find((servicio) =>
        servicio.clientes.some((cliente) => cliente.id === parseInt(clientId))
      );
      return servicio ? servicio.nombre : 'Servicio desconocido';
    },
    [servicios]
  );

  // Función para parsear fechas a un Date con año, mes, día (usado para validaciones)
  const parseLocalDate = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Función para formatear f_vencimiento tipo 2024-12-31T03:00:00.000000Z a dd/mm/yyyy
  const formatVencimiento = (isoDateString) => {
    if (!isoDateString) return 'Sin fecha';

    const [fullDate] = isoDateString.split('T'); // => "YYYY-MM-DD"
    const [year, month, day] = fullDate.split('-'); // => ["YYYY", "MM", "DD"]
    return `${day}/${month}/${year}`;
  };

  // Obtener clientes de los servicios
  const fetchClients = useCallback(async () => {
    try {
      const data = await customFetch('/tributos/1');
      const serviciosData = data.servicios;
      const clientesFromServices = serviciosData.flatMap(
        (servicio) => servicio.clientes
      );

      // Eliminar clientes duplicados usando su ID
      const uniqueClients = Array.from(
        new Map(clientesFromServices.map((c) => [c.id, c])).values()
      );

      // Ordenar los clientes alfabéticamente
      uniqueClients.sort((a, b) => {
        const nameA = `${a.persona?.nombre || ''} ${a.persona?.apellido || ''}`.toLowerCase();
        const nameB = `${b.persona?.nombre || ''} ${b.persona?.apellido || ''}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });

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
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Filtra la lista de clientes a medida que el usuario escribe
  useEffect(() => {
    const filtered = allClients.filter((client) => {
      const fullName = `${client.persona?.nombre || ''} ${
        client.persona?.apellido || ''
      }`.toLowerCase();
      const dni = client.persona?.dni ? client.persona.dni.toString() : '';
      return (
        fullName.includes(searchTerm.toLowerCase()) || dni.includes(searchTerm)
      );
    });
    setFilteredClients(filtered);
    setShowClientList(searchTerm.length > 0 && filtered.length > 0);
  }, [searchTerm, allClients]);

  // Obtener períodos del cliente seleccionado
  const fetchPeriodos = useCallback(async (cliente_id) => {
    setLoading(true);
    setPeriodos([]);
    try {
      const data = await customFetch(`/cuentas/cliente/${cliente_id}`);
      console.log('Datos recibidos:', data);

      // data es un array con [responseData, statusCode], etc.
      const [responseData] = data;

      if (responseData && responseData.length > 0) {
        setPeriodos(responseData);
      } else {
        Swal.fire(
          'Sin periodos',
          'No hay periodos no facturados para este cliente.',
          'info'
        );
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
  }, []);

  // Acción al seleccionar cliente de la lista
  const handleClientSelect = useCallback(
    (clientId) => {
      const selectedClientData = allClients.find(
        (c) => c.id === parseInt(clientId)
      );
      setClient(clientId);

      const nombre = selectedClientData.persona?.nombre || '';
      const apellido = selectedClientData.persona?.apellido || '';
      setSearchTerm(`${nombre} ${apellido}`.trim());

      setSelectedClient({
        ...selectedClientData.persona,
        calle: selectedClientData?.persona?.calle || '',
        altura: selectedClientData?.persona?.altura || '',
      });

      setShowClientList(false);
      fetchPeriodos(clientId);
    },
    [allClients, fetchPeriodos]
  );

  // Seleccionar/deseleccionar un período en el checkbox
  const handlePeriodSelection = (periodo) => {
    const updatedSelectedPeriodos = selectedPeriodos.includes(periodo)
      ? selectedPeriodos.filter((p) => p !== periodo)
      : [...selectedPeriodos, periodo];

    setSelectedPeriodos(updatedSelectedPeriodos);

    const total = updatedSelectedPeriodos.reduce(
      (sum, p) =>
        sum +
        (parseFloat(p.i_debito) +
          parseFloat(p.i_recargo_actualizado) -
          parseFloat(p.i_descuento)),
      0
    );
    setTotalAmount(total);
  };

  // Submit para generar el Recibo
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar si se seleccionaron períodos
    if (selectedPeriodos.length === 0) {
      Swal.fire('Error', 'Debe seleccionar al menos un periodo.', 'error');
      return;
    }

    // Validar fecha de vencimiento no anterior a hoy
    const currentDate = new Date();
    const selectedDate = parseLocalDate(vencimiento);
    const today = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );
    if (selectedDate < today) {
      Swal.fire(
        'Error',
        'La fecha de vencimiento no puede ser anterior a la fecha actual.',
        'error'
      );
      return;
    }

    // Confirmación
    const confirmResult = await Swal.fire({
      title: '¿Generar Recibo?',
      text: '¿Estás seguro de generar este recibo?',
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
        cliente_calle: selectedClient.calle,
        cliente_altura: selectedClient.altura,
        totalAmount,
        periodos: selectedPeriodos,
        vencimiento,
        servicio_nombre: getServiceNameByClientId(client),
        cajero_nombre: user.name,
        observaciones,
      };

      handleCreateRecibo(reciboData);

      Swal.fire('Confirmado', 'El recibo ha sido generado.', 'success');
      handleReset();
    }
  };

  // Limpiar el formulario
  const handleReset = () => {
    setClient('');
    setSearchTerm('');
    setFilteredClients(allClients);
    setSelectedPeriodos([]);
    setTotalAmount(0);
    setVencimiento('');
    setPeriodos([]);
    setSelectedClient({});
    setObservaciones('');
  };

  // Manejar el click afuera del dropdown de clientes
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

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  // Función para obtener la fecha de hoy en formato YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <Card className="shadow-sm p-5 mt-4 recibos-bombeo-form">
      <h2 className="text-center mb-5 text-primary font-weight-bold">
        <FontAwesomeIcon
          icon={faFileInvoiceDollar}
          size="1x"
          className="me-2"
        />
        Generar Recibo de Bombeo de Agua
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
                className="client-container position-relative"
              >
                <Form.Control
                  type="text"
                  value={searchTerm}
                  placeholder="Buscar cliente por nombre o DNI/CUIT"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  required
                  className="rounded"
                  aria-label="Buscar cliente por nombre o DNI/CUIT"
                  autoComplete="off"
                />
                {showClientList && (
                  <ListGroup
                    className="position-absolute client-dropdown w-100"
                    style={{
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 1000,
                    }}
                    role="listbox"
                  >
                    {filteredClients.length > 0 ? (
                      filteredClients.map((clientItem) => {
                        const nombreClient =
                          clientItem.persona?.nombre || '';
                        const apellidoClient =
                          clientItem.persona?.apellido || '';
                        const dniClient =
                          clientItem.persona?.dni || 'Sin DNI';

                        return (
                          <ListGroup.Item
                            key={clientItem.id}
                            action
                            onClick={() => handleClientSelect(clientItem.id)}
                            role="option"
                            aria-selected={clientItem.id === client}
                          >
                            {nombreClient} {apellidoClient} - {dniClient}
                          </ListGroup.Item>
                        );
                      })
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

        {/* Mostrar el resto si hay un cliente seleccionado */}
        {client && (
          <>
            {/* Periodos Disponibles */}
            <section className="form-section mb-4">
              <h4 className="mb-4 text-secondary font-weight-bold">
                Periodos Impagos
              </h4>
              <div className="table-responsive">
                <Table striped bordered hover className="mt-2">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nombre</th>
                      <th>DNI/CUIT</th>
                      <th>Mes</th>
                      <th>Año</th>
                      <th>Cuota</th>
                      <th>Importe</th>
                      <th>Descuento</th>
                      <th>Recargo</th>
                      <th>Total a Pagar</th>
                      <th>Vencimiento</th>
                      <th>Seleccionar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="12" className="text-center">
                          <Spinner animation="border" role="status">
                            <span className="visually-hidden">
                              Cargando...
                            </span>
                          </Spinner>
                        </td>
                      </tr>
                    ) : periodos.length > 0 ? (
                      periodos.map((periodo, index) => {
                        const nombrePer =
                          periodo.cliente?.persona?.nombre || '';
                        const apellidoPer =
                          periodo.cliente?.persona?.apellido || '';
                        const dniPer =
                          periodo.cliente?.persona?.dni || 'Sin DNI';

                        const importDebito = parseFloat(periodo.i_debito).toFixed(2);
                        const importDescuento = parseFloat(periodo.i_descuento).toFixed(2);
                        const importRecargo = parseFloat(periodo.i_recargo_actualizado).toFixed(2);
                        const total = (
                          parseFloat(periodo.i_debito) -
                          parseFloat(periodo.i_descuento) +
                          parseFloat(periodo.i_recargo_actualizado)
                        ).toFixed(2);

                        return (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{`${nombrePer} ${apellidoPer}`.trim()}</td>
                            <td>{dniPer}</td>
                            <td>{periodo.mes}</td>
                            <td>{periodo.año}</td>
                            <td>{periodo.cuota}</td>
                            <td>{importDebito}</td>
                            <td>{importDescuento}</td>
                            <td>{importRecargo}</td>
                            <td>{`AR$ ${total}`}</td>
                            <td>
                              {periodo.f_vencimiento
                                ? formatVencimiento(periodo.f_vencimiento)
                                : 'Sin fecha'}
                            </td>
                            <td>
                              <Form.Check
                                type="checkbox"
                                onChange={() => handlePeriodSelection(periodo)}
                                checked={selectedPeriodos.includes(periodo)}
                                aria-label={`Seleccionar periodo ${periodo.mes}/${periodo.año}`}
                              />
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="12" className="text-center text-muted">
                          No hay periodos disponibles para este cliente.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </section>

            {/* Detalles del Recibo */}
            <section className="form-section mb-4">
              <Row>
                <Col md={6}>
                  <Form.Group controlId="vencimiento" className="mt-3">
                    <Form.Label className="font-weight-bold">
                      Fecha de Vencimiento del Recibo{' '}
                      <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={vencimiento}
                      min={getTodayDate()}
                      onChange={(e) => setVencimiento(e.target.value)}
                      required
                      className="rounded"
                      aria-label="Fecha de vencimiento del recibo"
                    />
                  </Form.Group>
                  <Form.Group controlId="observaciones" className="mt-3">
                    <Form.Label className="font-weight-bold">
                      Observaciones
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      rows={3}
                      className="rounded"
                      aria-label="Observaciones del recibo"
                      placeholder="Escribí observaciones del recibo"
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
                      AR$ {totalAmount.toFixed(2)}
                    </h1>
                    <p className="text-muted">
                      {/* Fallback: si no hay nombre/apellido/dni que no muestre "null" */}
                      Cliente: {selectedClient?.nombre || ''}{' '}
                      {selectedClient?.apellido || ''}
                      <br />
                      DNI/CUIT: {selectedClient?.dni || 'Sin DNI'}
                      <br />
                      Periodos Seleccionados:{' '}
                      {selectedPeriodos
                        .map((p) => `${p.mes}/${p.año}`)
                        .join(', ')}{' '}
                      <br />
                      Fecha de Vencimiento:{' '}
                      {vencimiento
                        ? parseLocalDate(vencimiento).toLocaleDateString()
                        : 'No asignada'}{' '}
                      <br />
                    </p>
                  </div>
                </Col>
              </Row>
            </section>

            {/* Botones de acción */}
            <div className="d-flex justify-content-center mt-4">
              <CustomButton
                type="submit"
                variant="secondary"
                className="me-3 px-5 py-2 font-weight-bold"
                aria-label="Generar Recibo"
              >
                Generar Recibo
              </CustomButton>
              <CustomButton
                type="button"
                variant="outline-secondary"
                onClick={handleReset}
                className="px-5 py-2 font-weight-bold"
                aria-label="Limpiar Formulario"
              >
                Limpiar
              </CustomButton>
            </div>
          </>
        )}
      </Form>
    </Card>
  );
};

export default RecibosBombeoForm;
