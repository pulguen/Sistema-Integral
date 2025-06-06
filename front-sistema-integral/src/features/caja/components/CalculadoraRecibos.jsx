import React, { useState } from 'react';
import {
  Card,
  Button,
  Form,
  FormCheck,
  ListGroup,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import { FaTrashRestore, FaTrashAlt } from 'react-icons/fa';

const mediosDisponibles = [
  { id: 'efectivo', label: 'Efectivo', icon: '💵' },
  { id: 'debito', label: 'Débito', icon: '💳' },
  { id: 'transferencia', label: 'Transferencia', icon: '🏦' },
  { id: 'credito', label: 'Crédito', icon: '💳' },
  { id: 'qr', label: 'QR / MercadoPago', icon: '📱' },
  { id: 'web', label: 'Pago Online', icon: '💻' },
  { id: 'cta_cte', label: 'Cuenta Corriente', icon: '💸' },
  { id: 'canje', label: 'Canje / Compensación', icon: '🔁' },
  { id: 'cheque', label: 'Cheque', icon: '📝' },
];

const mediosIniciales = mediosDisponibles.reduce((acc, medio) => {
  acc[medio.id] = 0;
  return acc;
}, {});

const CalculadoraRecibosConPagos = ({ recibos = [], onReset, onRemoveRecibo }) => {
  const [mediosPago, setMediosPago] = useState(mediosIniciales);
  const [mediosSeleccionados, setMediosSeleccionados] = useState([]);

  const total = recibos.reduce((sum, r) => sum + (parseFloat(r.i_total) || 0), 0);
  const abonado = Object.entries(mediosPago)
    .filter(([medio]) => mediosSeleccionados.includes(medio))
    .reduce((sum, [, val]) => sum + parseFloat(val || 0), 0);
  const diferencia = abonado - total;

  const toggleMedio = (medio) => {
    setMediosSeleccionados((prev) =>
      prev.includes(medio) ? prev.filter((m) => m !== medio) : [...prev, medio]
    );
  };

  const handleChange = (medio, value) => {
    setMediosPago((prev) => ({
      ...prev,
      [medio]: parseFloat(value) || 0,
    }));
  };

  const renderTooltip = (msg) => (props) => (
    <Tooltip id="tooltip" {...props}>{msg}</Tooltip>
  );

  const renderInputMedio = (medio, label, icon) => (
    <div key={medio} className="mb-2">
      <Form.Label className="mb-1">{icon} {label}</Form.Label>
      <Form.Control
        type="number"
        min="0"
        step="0.01"
        value={mediosPago[medio]}
        onChange={(e) => handleChange(medio, e.target.value)}
        placeholder="0.00"
      />
    </div>
  );

  const handleReset = () => {
    setMediosPago(mediosIniciales);
    setMediosSeleccionados([]);
    onReset();
  };

  const formatMoney = (n) =>
    parseFloat(n).toLocaleString('es-AR', { minimumFractionDigits: 2 });

  return (
    <Card className="shadow h-100 border-0 mx-auto" style={{ maxWidth: 480, width: '100%' }}>
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="text-secondary mb-0">💰 Calculadora de pago</h5>
          <OverlayTrigger placement="left" overlay={renderTooltip('Reiniciar recibos y pagos')}>
            <Button variant="outline-danger" size="sm" onClick={handleReset}>
              <FaTrashRestore className="me-1" />
              Limpiar
            </Button>
          </OverlayTrigger>
        </div>

        {/* Lista de recibos */}
        <div style={{ maxHeight: 140, overflowY: 'auto' }}>
          <ListGroup variant="flush">
            {recibos.length === 0 ? (
              <ListGroup.Item className="text-muted text-center">
                No hay recibos cargados.
              </ListGroup.Item>
            ) : (
              recibos.map((r, i) => (
                <ListGroup.Item
                  key={r.id ?? r.n_recibo ?? i}
                  className="d-flex justify-content-between align-items-center small px-2"
                >
                  <div
                    className="d-flex align-items-center text-muted"
                    style={{
                      cursor: 'pointer',
                      transition: 'color 0.2s',
                      fontSize: '0.9rem',
                    }}
                    onClick={() => onRemoveRecibo(r.id)}
                    title="Quitar recibo del cálculo"
                    onMouseOver={(e) => (e.currentTarget.style.color = '#dc3545')}
                    onMouseOut={(e) => (e.currentTarget.style.color = '')}
                  >
                    <FaTrashAlt className="me-2 text-danger" />
                    #{r.n_recibo}
                  </div>
                  <div className="fw-semibold text-end">
                    ${formatMoney(r.i_total)}
                  </div>
                </ListGroup.Item>
              ))
            )}
          </ListGroup>
        </div>

        <hr className="my-3" />
        <div className="mb-2">
          <strong>Total a pagar:</strong> ${formatMoney(total)}
        </div>

        {/* Selección de medios */}
        <div className="mb-3">
          <Form.Label className="fw-semibold mb-2">
            Seleccionar medios de pago:
          </Form.Label>
          <div className="d-flex flex-wrap gap-3 mb-3">
            {mediosDisponibles.map(({ id, label, icon }) => (
              <FormCheck
                key={id}
                type="checkbox"
                id={`check-${id}`}
                label={`${icon} ${label}`}
                checked={mediosSeleccionados.includes(id)}
                onChange={() => toggleMedio(id)}
              />
            ))}
          </div>

          {/* Inputs según selección */}
          {mediosSeleccionados.map((medio) => {
            const { label, icon } = mediosDisponibles.find((m) => m.id === medio);
            return renderInputMedio(medio, label, icon);
          })}
        </div>

        <div className="mb-2">
          <strong>Total abonado:</strong> ${formatMoney(abonado)}
        </div>

        <div
          className={`fs-5 fw-bold mt-auto text-end ${
            diferencia < 0 ? 'text-danger' : 'text-success'
          }`}
        >
          {diferencia < 0
            ? `Falta $${formatMoney(Math.abs(diferencia))}`
            : `Vuelto: $${formatMoney(diferencia)}`}
        </div>
      </Card.Body>
    </Card>
  );
};

export default CalculadoraRecibosConPagos;
