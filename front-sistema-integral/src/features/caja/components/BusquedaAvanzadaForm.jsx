import React, { useContext, useEffect, useState } from 'react';
import { CajaContext } from '../../../context/CajaContext';
import { ClientContext } from '../../../context/ClientContext';
import { Form, Row, Col, Button } from 'react-bootstrap';

const BusquedaAvanzadaForm = ({ resetSignal }) => {
  const {
    filtrosAvanzados, setFiltrosAvanzados, buscarRecibosAvanzados, limpiarFiltrosAvanzados, cajeros,
  } = useContext(CajaContext);

  const [clienteQuery, setClienteQuery] = useState('');
  const [clienteOptions, setClienteOptions] = useState([]);
  const { searchClients } = useContext(ClientContext);

  // Reset fields al cambiar de tab
  useEffect(() => {
    setClienteQuery('');
    setClienteOptions([]);
    limpiarFiltrosAvanzados();
  }, [resetSignal, limpiarFiltrosAvanzados]);

  useEffect(() => {
    if (clienteQuery.length < 2) {
      setClienteOptions([]);
      return;
    }
    let cancelado = false;
    searchClients(clienteQuery).then(results => {
      if (!cancelado) setClienteOptions(results);
    });
    return () => { cancelado = true; };
  }, [clienteQuery, searchClients]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFiltrosAvanzados(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Form
      className="mb-4"
      onSubmit={e => {
        e.preventDefault();
        buscarRecibosAvanzados();
      }}
    >
      <Row className="g-2 align-items-end">
        <Col md={2}>
          <Form.Group controlId="filtroFechaDesde">
            <Form.Label>Fecha Desde</Form.Label>
            <Form.Control
              type="date"
              name="fechaDesde"
              value={filtrosAvanzados.fechaDesde}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group controlId="filtroFechaHasta">
            <Form.Label>Fecha Hasta</Form.Label>
            <Form.Control
              type="date"
              name="fechaHasta"
              value={filtrosAvanzados.fechaHasta}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={1}>
          <Form.Group controlId="filtroImporteMin">
            <Form.Label>Min</Form.Label>
            <Form.Control
              type="number"
              name="importeMin"
              value={filtrosAvanzados.importeMin}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={1}>
          <Form.Group controlId="filtroImporteMax">
            <Form.Label>Max</Form.Label>
            <Form.Control
              type="number"
              name="importeMax"
              value={filtrosAvanzados.importeMax}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>

        {/* Autocomplete Cliente */}
        <Col md={2} className="position-relative">
          <Form.Group controlId="filtroCliente">
            <Form.Label>Cliente</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nombre, Apellido o DNI"
              value={
                filtrosAvanzados.cliente
                  ? `${filtrosAvanzados.cliente.persona.nombre} ${filtrosAvanzados.cliente.persona.apellido} (${filtrosAvanzados.cliente.persona.dni})`
                  : clienteQuery
              }
              onChange={e => {
                setClienteQuery(e.target.value);
                setFiltrosAvanzados(prev => ({ ...prev, cliente: null }));
              }}
              autoComplete="off"
              disabled={!!filtrosAvanzados.cliente}
              name="cliente"
            />
            {(clienteOptions.length > 0 && !filtrosAvanzados.cliente) && (
              <div className="autocomplete-suggestions bg-white border rounded shadow-sm position-absolute w-100" style={{ zIndex: 5 }}>
                {clienteOptions.map(opt => (
                  <div
                    key={opt.id}
                    className="p-2 cursor-pointer hover-bg-primary"
                    onClick={() => {
                      setFiltrosAvanzados(prev => ({ ...prev, cliente: opt }));
                      setClienteQuery('');
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {opt.persona.nombre} {opt.persona.apellido} ({opt.persona.dni})
                  </div>
                ))}
              </div>
            )}
            {filtrosAvanzados.cliente && (
              <Button
                variant="outline-secondary"
                size="sm"
                className="mt-1"
                onClick={() => setFiltrosAvanzados(prev => ({ ...prev, cliente: null }))}
              >
                Quitar
              </Button>
            )}
          </Form.Group>
        </Col>

        {/* Cajero */}
        <Col md={2}>
          <Form.Group controlId="filtroCajero">
            <Form.Label>Cajero</Form.Label>
            <Form.Select
              name="cajero"
              value={filtrosAvanzados.cajero}
              onChange={handleChange}
            >
              <option value="">Todos</option>
              {cajeros.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={1}>
          <Button variant="primary" type="submit" className="w-100">
            Buscar
          </Button>
        </Col>
        <Col md={1}>
          <Button
            variant="outline-secondary"
            className="w-100"
            onClick={() => {
              limpiarFiltrosAvanzados();
              setClienteQuery('');
              setClienteOptions([]);
            }}
          >
            Limpiar
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default BusquedaAvanzadaForm;
