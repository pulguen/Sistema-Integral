import React, { useState } from 'react';
import {
  Card,
  Button,
  ListGroup,
  OverlayTrigger,
  Tooltip,
  Form,
} from 'react-bootstrap';
import { FaTrashRestore, FaTrashAlt } from 'react-icons/fa';
import Select from 'react-select';

const mediosDisponibles = [
  { id: 'canje', label: 'Canje / Compensación', icon: '🔁' },
  { id: 'cheque', label: 'Cheque', icon: '📝' },
  { id: 'credito', label: 'Crédito', icon: '💳' },
  { id: 'cta_cte', label: 'Cuenta Corriente', icon: '💸' },
  { id: 'debito', label: 'Débito', icon: '💳' },
  { id: 'efectivo', label: 'Efectivo', icon: '💵' },
  { id: 'transferencia', label: 'Transferencia', icon: '🏦' },
  { id: 'qr', label: 'QR / MercadoPago', icon: '📱' },
  { id: 'web', label: 'Pago Online', icon: '💻' },
];

const mediosOptions = mediosDisponibles.map(m => ({
  value: m.id,
  label: `${m.icon} ${m.label}`,
}));

const mediosIniciales = mediosDisponibles.reduce((acc, medio) => {
  acc[medio.id] = 0;
  return acc;
}, {});

const CalculadoraRecibosConPagos = ({
  recibos = [],
  onReset,
  onRemoveRecibo,
}) => {
  const [mediosPago, setMediosPago] = useState(mediosIniciales);
  const [mediosSeleccionados, setMediosSeleccionados] = useState([]);

  const total = recibos.reduce((sum, r) => sum + (parseFloat(r.i_total) || 0), 0);
  const abonado = Object.entries(mediosPago)
    .filter(([medio]) => mediosSeleccionados.includes(medio))
    .reduce((sum, [, val]) => sum + parseFloat(val || 0), 0);
  const diferencia = abonado - total;

  // FIX: Resetear valor cuando se quita un medio
  const handleSelectChange = (selected) => {
    const nuevosSeleccionados = selected ? selected.map(s => s.value) : [];
    const eliminados = mediosSeleccionados.filter(med => !nuevosSeleccionados.includes(med));
    if (eliminados.length > 0) {
      setMediosPago(prev => {
        const actualizados = { ...prev };
        eliminados.forEach(m => { actualizados[m] = 0; });
        return actualizados;
      });
    }
    setMediosSeleccionados(nuevosSeleccionados);
  };

  const handleChange = (medio, value) => {
    setMediosPago((prev) => ({
      ...prev,
      [medio]: parseFloat(value) || 0,
    }));
  };

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
          <h5 className="text-secondary mb-0">💰 Calculadora de cobro</h5>
          <OverlayTrigger placement="left" overlay={<Tooltip>Reiniciar recibos y pagos</Tooltip>}>
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

        {/* Selección de medios con react-select */}
        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold mb-2">
            Seleccionar medios de pago:
          </Form.Label>
          <Select
            isMulti
            options={mediosOptions}
            value={mediosOptions.filter(o => mediosSeleccionados.includes(o.value))}
            onChange={handleSelectChange}
            classNamePrefix="react-select"
            placeholder="Elegí uno o más medios..."
            closeMenuOnSelect={true}
            noOptionsMessage={() => "Sin opciones"}
          />
        </Form.Group>

        {/* Inputs solo para los seleccionados */}
        <div className="mb-2">
          {mediosSeleccionados.map((medio) => {
            const { label, icon } = mediosDisponibles.find((m) => m.id === medio);
            return (
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
