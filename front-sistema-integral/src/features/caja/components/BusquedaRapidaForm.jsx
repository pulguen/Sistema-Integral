import React, { useState, useContext, useEffect } from 'react';
import { CajaContext } from '../../../context/CajaContext';
import { Form, Row, Col, Button, InputGroup } from 'react-bootstrap';

const BusquedaRapidaForm = ({ resetSignal }) => {
  const { buscarReciboRapido, loading, setRecibos } = useContext(CajaContext);

  const [numeroRecibo, setNumeroRecibo] = useState('');

  useEffect(() => {
    setNumeroRecibo('');
    if (setRecibos) setRecibos([]);
  }, [resetSignal, setRecibos]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (numeroRecibo.trim()) {
      buscarReciboRapido(numeroRecibo.trim());
    }
  };

  const handleReiniciar = () => {
    setNumeroRecibo('');
    if (setRecibos) setRecibos([]);
  };

  return (
    <Form onSubmit={handleSubmit} className="mb-4">
      <Row className="g-2 align-items-end">
        <Col md={4}>
          <Form.Group controlId="inputBusquedaRapida">
            <Form.Label>Búsqueda rápida por N° Recibo</Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Ingresá el N° de recibo exacto"
                value={numeroRecibo}
                onChange={e => setNumeroRecibo(e.target.value)}
                autoComplete="off"
              />
              <Button
                variant="primary"
                type="submit"
                disabled={loading || !numeroRecibo.trim()}
              >
                Buscar
              </Button>
              {numeroRecibo && (
                <Button
                  variant="outline-secondary"
                  type="button"
                  onClick={handleReiniciar}
                  disabled={loading}
                >
                  Reiniciar
                </Button>
              )}
            </InputGroup>
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );
};

export default BusquedaRapidaForm;
