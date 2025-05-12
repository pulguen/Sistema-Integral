import React, { useMemo } from "react";
import { Form, Row, Col, InputGroup } from "react-bootstrap";
import Swal from "sweetalert2";
import CustomButton from "../../../../components/common/botons/CustomButton.jsx";

export default function NewPeriodoForm({
  volume,
  onVolumeChange,
  filteredServices,
  service,
  onServiceChange,
  month,
  onMonthChange,
  year,
  onYearChange,
  cuota,
  onCuotaChange,
  vencimiento,
  onVencimientoChange,
  totalModules,
  totalInPesos,
  searchTerm,
  getServiceNameById,
  onSubmit,
  onReset,
  formatLocalDate
}) {
  const yearOptions = useMemo(() => {
    const curr = new Date().getFullYear();
    return Array.from({ length: curr - 2019 }, (_, i) => curr - i);
  }, []);

  const monthOptions = useMemo(
    () => [
      "Enero","Febrero","Marzo","Abril","Mayo","Junio",
      "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
    ],
    []
  );

  // Validaciones locales antes de disparar onSubmit
  const handleLocalSubmit = (e) => {
    e.preventDefault();
    if (!(parseFloat(volume) > 0)) {
      return Swal.fire("Error", "Ingrese un volumen válido (> 0).", "error");
    }
    if (!service) {
      return Swal.fire("Error", "Seleccione un tipo de servicio.", "error");
    }
    if (!month) {
      return Swal.fire("Error", "Seleccione el mes de facturación.", "error");
    }
    if (!year) {
      return Swal.fire("Error", "Seleccione el año.", "error");
    }
    if (cuota < 1) {
      return Swal.fire("Error", "La cuota debe ser al menos 1.", "error");
    }
    if (!vencimiento) {
      return Swal.fire("Error", "Seleccione la fecha de vencimiento.", "error");
    }
    // Todos los campos válidos: delegar al padre
    onSubmit(e);
  };

  return (
    <>
      <section className="form-section mb-4">
        <h4 className="mb-3 text-secondary">Nuevo Período</h4>
        <Row>
          <Col md={6}>
            <Form.Group controlId="volume" className="mb-3">
              <Form.Label className="fw-bold">
                Volumen de Agua Bombeada (m³) <span className="text-danger">*</span>
              </Form.Label>
              <InputGroup>
                <Form.Control
                  type="number"
                  value={volume}
                  onChange={e => onVolumeChange(e.target.value)}
                  placeholder="Ingrese volumen"
                  required
                />
                <InputGroup.Text>m³</InputGroup.Text>
              </InputGroup>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="service" className="mb-3">
              <Form.Label className="fw-bold">
                Tipo de Servicio <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={service}
                onChange={e => onServiceChange(e.target.value)}
                required
              >
                <option value="">Seleccione un servicio</option>
                {filteredServices.map(s => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </section>

      <section className="form-section mb-4">
        <h4 className="mb-3 text-secondary">Información de Período a generar</h4>
        <Row>
          <Col md={6}>
            <Form.Group controlId="month" className="mb-3">
              <Form.Label className="fw-bold">
                Mes de Facturación <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={month}
                onChange={e => onMonthChange(e.target.value)}
                required
              >
                <option value="">Seleccione un mes</option>
                {monthOptions.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="year" className="mb-3">
              <Form.Label className="fw-bold">
                Año <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={year}
                onChange={e => onYearChange(Number(e.target.value))}
                required
              >
                {yearOptions.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="cuota" className="mb-3">
              <Form.Label className="fw-bold">
                Cuota <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                value={cuota}
                min={1}
                onChange={e => onCuotaChange(Math.max(1, Number(e.target.value)))}
                required
              />
            </Form.Group>

            <Form.Group controlId="vencimiento" className="mb-3">
              <Form.Label className="fw-bold">
                Fecha de Vencimiento <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="date"
                value={vencimiento}
                onChange={e => onVencimientoChange(e.target.value)}
                required
              />
            </Form.Group>
          </Col>

          <Col md={6} className="d-flex justify-content-center align-items-center">
            <div className="text-center">
              <h4 className="mb-4 text-secondary fw-bold">Total a Pagar</h4>
              <h1 className="display-4 text-primary mb-0">
                AR$ {totalInPesos.toFixed(2)}
              </h1>
              <h3 className="text-secondary">{totalModules} Módulos</h3>
              <p className="text-muted">
                Cliente: {searchTerm}<br/>
                Servicio: {getServiceNameById(service)}<br/>
                Volumen: {volume} m³<br/>
                Cuota: {cuota}<br/>
                Mes/Año: {month} / {year}<br/>
                Vencimiento: {vencimiento ? formatLocalDate(vencimiento) : "Sin fecha"}
              </p>
            </div>
          </Col>
        </Row>
      </section>

      <div className="d-flex justify-content-center mt-4">
        <CustomButton onClick={handleLocalSubmit} className="me-3 px-5 py-2 fw-bold">
          Generar Periodo
        </CustomButton>
        <CustomButton
          variant="outline-secondary"
          onClick={(e) => { e.preventDefault(); onReset(); }}
          className="px-5 py-2 fw-bold"
        >
          Limpiar
        </CustomButton>
      </div>
    </>
  );
}
