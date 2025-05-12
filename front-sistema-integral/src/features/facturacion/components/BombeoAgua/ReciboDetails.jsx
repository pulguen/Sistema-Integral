// src/features/facturacion/components/BombeoAgua/ReciboDetails.jsx
import React from "react";
import { Row, Col, Form } from "react-bootstrap";

export default function ReciboDetails({
  selectedClient,
  selectedPeriodos,
  totalAmount,
  vencimiento,
  observaciones,
  onVencimientoChange,
  onObservacionesChange
}) {
  return (
    <section className="form-section mb-4">
      <Row>
        <Col md={6}>
          <Form.Group controlId="vencimiento">
            <Form.Label className="fw-bold">Fecha de Vencimiento</Form.Label>
            <Form.Control
              type="date"
              value={vencimiento}
              min={new Date().toISOString().slice(0,10)}
              onChange={e => onVencimientoChange(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="observaciones" className="mt-3">
            <Form.Label className="fw-bold">Observaciones</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={observaciones}
              onChange={e => onObservacionesChange(e.target.value)}
            />
          </Form.Group>
        </Col>

        <Col md={6} className="d-flex justify-content-center align-items-center">
          <div className="text-center">
            <h4 className="text-secondary mb-1">Total a Pagar</h4>
            <h1 className="display-4 text-primary mb-2">
              AR$ {totalAmount.toFixed(2)}
            </h1>
            <p className="text-muted">
              Cliente: {selectedClient.nombre} {selectedClient.apellido}<br/>
              DNI/CUIT: {selectedClient.dni}<br/>
              Períodos: {selectedPeriodos.map(p => `${p.mes}/${p.año}`).join(", ")}<br/>
              Vencimiento: {vencimiento}
            </p>
          </div>
        </Col>
      </Row>
    </section>
  );
}
