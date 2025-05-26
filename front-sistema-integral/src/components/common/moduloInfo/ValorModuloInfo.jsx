// ValorModuloInfo.jsx
import React from "react";
import { Row, Col } from "react-bootstrap";
import { FaCalculator, FaLayerGroup } from "react-icons/fa";
import '../../../styles/modulo.css';

export default function ValorModuloInfo({
  valor = 0,
  ordenanza = "",
  updatedAt = "",
  modulosServicio = null,
  size = "md"
}) {
  return (
    <div className={`valor-modulo-card ${size === "sm" ? "modulo-sm" : "modulo-md"} p-3`}>
      <Row className="gx-2 gy-1 text-center align-items-center">
        <Col xs={12}>
          <div className="mb-1">
            <FaCalculator className="modulo-icon me-1" size={15} />
            <span className="modulo-title fw-bold">Valor del módulo</span>
          </div>
          <div className="modulo-value">
            AR$ {Number(valor).toFixed(2)}
          </div>
        </Col>
        <Col xs={12}>
          <div className="mb-1">
            <FaLayerGroup className="modulo-icon me-1" size={15} />
            <span className="modulo-title fw-bold">Módulos por unidad</span>
          </div>
          <div className="modulo-value">
            {modulosServicio !== null ? modulosServicio : "—"}
          </div>
        </Col>
      </Row>

      <div className="text-center modulo-footer small mt-1">
        {ordenanza && (
          <span className="me-2">
            <b>Ord.:</b> {ordenanza}
          </span>
        )}
        {updatedAt && (
          <span>
            <b>Últ. Act.:</b> {updatedAt}
          </span>
        )}
      </div>
    </div>
  );
}
