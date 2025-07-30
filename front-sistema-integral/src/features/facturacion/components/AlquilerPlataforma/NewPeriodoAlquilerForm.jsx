import React, { useMemo } from "react";
import { Form, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2";
import CustomButton from "../../../../components/common/botons/CustomButton.jsx";
import TotalAPagarInfo from "../../../../components/common/TotalAPagarInfo/TotalAPagarInfo.jsx";

export default function NewPeriodoAlquilerForm({
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
  modulosServicio,
  totalEnPesos,
  searchTerm,
  getServiceNameById,
  onSubmit,
  onReset,
  formatLocalDate,
  extraInfo
}) {
  const yearOptions = useMemo(() => {
    const curr = new Date().getFullYear();
    return Array.from({ length: curr - 2019 }, (_, i) => curr - i);
  }, []);
  const monthOptions = useMemo(
    () => [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
    ], []
  );

  const missingFields = [];
  if (!service) missingFields.push("Espacio/Servicio");
  if (!month) missingFields.push("Mes");
  if (!year) missingFields.push("Año");
  if (!cuota || cuota < 1) missingFields.push("Cuota");
  if (!vencimiento) missingFields.push("Vencimiento");
  const isComplete = missingFields.length === 0;

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
      <h4 className="mb-3 text-secondary">Nuevo Período de Alquiler</h4>
      <Row className="gy-4">
        <Col xs={12} md={6}>
          <Form.Group controlId="service" className="mb-3">
            <Form.Label className="fw-bold">
              Espacio/Servicio <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              value={service}
              onChange={e => onServiceChange(e.target.value)}
              required
            >
              <option value="">Seleccione un espacio</option>
              {filteredServices.map(s => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group controlId="modulosServicio" className="mb-3">
            <Form.Label className="fw-bold">
              Cantidad de Módulos <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="number"
              value={modulosServicio || ""}
              readOnly
              disabled
              plaintext
              style={{ background: "#e9ecef" }}
            />
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

        <Col xs={12} md={6} className="d-flex flex-column justify-content-center align-items-center">
          <TotalAPagarInfo
            total={totalEnPesos}
            modulos={modulosServicio}
            formula="[Módulos] x [Valor Módulo]"
            complete={isComplete}
            missingFields={missingFields}
            cliente={searchTerm}
            servicio={getServiceNameById(service)}
            volumen={null}
            mes={month}
            year={year}
            cuota={cuota}
            vencimiento={vencimiento}
            formatLocalDate={formatLocalDate}
            extraInfo={extraInfo}
            labelModulos="Módulos"
          />
        </Col>
      </Row>
      <div className="d-flex justify-content-center mt-4">
        <CustomButton onClick={handleLocalSubmit} className="me-3 px-5 py-2 fw-bold">
          Generar Período
        </CustomButton>
        <CustomButton
          variant="outline-secondary"
          onClick={e => { e.preventDefault(); onReset(); }}
          className="px-5 py-2 fw-bold"
        >
          Limpiar
        </CustomButton>
      </div>
    </section>
  );
}
