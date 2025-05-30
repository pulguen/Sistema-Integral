import React, { useMemo } from "react";
import { Form, Row, Col, InputGroup } from "react-bootstrap";
import Swal from "sweetalert2";
import CustomButton from "../../../../components/common/botons/CustomButton.jsx";
import TotalAPagarInfo from "../../../../components/common/TotalAPagarInfo/TotalAPagarInfo.jsx";

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
  formatLocalDate,
  extraInfo // ← la tarjeta de módulo
}) {
  const yearOptions = useMemo(() => {
    const curr = new Date().getFullYear();
    return Array.from({ length: curr - 2019 }, (_, i) => curr - i);
  }, []);

  const monthOptions = useMemo(
    () => [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ],
    []
  );

  // ---- Validación UX/UI ----
  const missingFields = [];
  if (!service) missingFields.push("Tipo de Servicio");
  if (!volume || parseFloat(volume) <= 0) missingFields.push("Volumen");
  if (!month) missingFields.push("Mes");
  if (!year) missingFields.push("Año");
  if (!cuota || cuota < 1) missingFields.push("Cuota");
  if (!vencimiento) missingFields.push("Vencimiento");
  const isComplete = missingFields.length === 0;

  // Validaciones antes de submit
  const handleLocalSubmit = (e) => {
    e.preventDefault();
    if (!isComplete) {
      Swal.fire("Faltan datos", `Complete: ${missingFields.join(", ")}`, "warning");
      return;
    }
    onSubmit(e);
  };

  return (
    <section className="form-section mb-4 mt-4">
      <h4 className="mb-3 text-secondary">Nuevo Período</h4>
      <Row className="gy-4">
        {/* ---- DATOS DEL PERIODO ---- */}
        <Col xs={12} md={6}>
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
          <Form.Group controlId="volume" className="mb-3">
            <Form.Label className="fw-bold">
              Volumen de Agua Bombeada (m³) <span className="text-danger">*</span>
            </Form.Label>
            <InputGroup>
              <Form.Control
                type="number"
                value={volume}
                min={0}
                onChange={e => onVolumeChange(Math.max(0, e.target.value))}
                placeholder="Ingrese volumen"
                required
              />
              <InputGroup.Text><strong>m³</strong></InputGroup.Text>
            </InputGroup>
          </Form.Group>
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

        {/* ---- TOTAL A PAGAR Y MODULO INFO ---- */}
        <Col xs={12} md={6} className="d-flex flex-column justify-content-center align-items-center">
          <TotalAPagarInfo
            total={totalInPesos}
            modulos={totalModules}
            formula="[Volumen] x [Valor Módulo] x [Módulos por Unidad]"
            complete={isComplete}
            missingFields={missingFields}
            cliente={searchTerm}
            servicio={getServiceNameById(service)}
            volumen={volume}
            mes={month}
            year={year}
            cuota={cuota}
            vencimiento={vencimiento}
            formatLocalDate={formatLocalDate}
            extraInfo={extraInfo}
          />
        </Col>
      </Row>
      <div className="d-flex justify-content-center mt-4">
        <CustomButton onClick={handleLocalSubmit} className="me-3 px-5 py-2 fw-bold">
          Generar Período
        </CustomButton>
        <CustomButton
          variant="outline-secondary"
          onClick={(e) => { e.preventDefault(); onReset(); }}
          className="px-5 py-2 fw-bold"
        >
          Limpiar
        </CustomButton>
      </div>
    </section>
  );
}
