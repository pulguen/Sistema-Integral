import React from "react";
import PropTypes from "prop-types";
import { FaExclamationCircle } from "react-icons/fa";
import { Alert } from "react-bootstrap";
import "../../../styles/TotalAPagarInfo.css";

export default function TotalAPagarInfo({
  total,
  modulos,
  formula,
  complete,
  missingFields = [],
  cliente,
  servicio,
  volumen,
  mes,
  year,
  cuota,
  vencimiento,
  periodos = [],
  formatLocalDate = (d) => d,
  extraInfo,
  labelModulos = "Módulos",
}) {
  const label =
    Array.isArray(periodos) && periodos.length > 0
      ? "Períodos"
      : labelModulos;

  return (
    <div className="text-center py-2 w-100">
      <h4 className="mb-2 text-secondary fw-bold">Total a Pagar</h4>
        <h2 className={`display-6 mb-1 total-a-pagar-amount${complete ? "" : " incomplete"}`}>
            AR$ {
            complete
                ? (Number(total) || 0).toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })
                : "—"
            }
      </h2>
      <div
        className="fs-5 mb-2"
        style={{ color: complete ? "var(--secundary-color)" : "#adb5bd" }}
      >
        {complete && modulos !== undefined && modulos !== null
          ? `${modulos} ${label}`
          : "—"}
      </div>
      {/* Fórmula de cálculo */}
      {formula && (
        <div className="mt-2 mb-1" style={{ fontSize: 13, color: 'var(--secundary-color)', fontWeight: 500 }}>
          <span style={{ background: "#F5F8F2", borderRadius: 6, padding: "0.15em 0.75em", display: "inline-block" }}>
            <b>Fórmula:</b> <span style={{ color: "var(--dark-color)" }}>{formula}</span>
          </span>
        </div>
      )}
            {/* nombre del cliente */}
      {cliente && (
        <div className="mb-2 text-muted" style={{ fontWeight: 600 }}>
          <strong>Cliente:</strong> {cliente}
        </div>
      )}
      {/* Bloque de períodos seleccionados */}
      {Array.isArray(periodos) && periodos.length > 0 && (
        <div className="mt-2 text-muted small text-center px-2 w-100" style={{ maxWidth: 380, margin: '0 auto' }}>
          <b>Períodos seleccionados:</b>
          <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
            {periodos.map((p, idx) => (
              <li key={p.id || idx} style={{ marginBottom: 2 }}>
                {p.mes}/{p.año} {p.cantidad ? `(${p.cantidad} m³)` : ""}
                {p.cuota ? ` (Cuota ${p.cuota})` : ""} — Vence: {typeof formatLocalDate === "function" ? formatLocalDate(p.f_vencimiento ? p.f_vencimiento.split("T")[0] : "") : p.f_vencimiento}
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Advertencia UX */}
      {!complete && !!missingFields.length && (
        <Alert variant="warning" className="py-2 px-3 d-flex align-items-center justify-content-start mb-2" style={{ fontSize: "1rem", borderRadius: "0.5rem" }}>
          <FaExclamationCircle className="me-2" style={{ color: "#f8bb86" }} />
          <span>
            Faltan completar: <b>{missingFields.join(", ")}</b>
          </span>
        </Alert>
      )}
      {/* Datos adicionales (solo si es formulario de período, no recibo) */}
      <div className="text-muted small mb-3 fs-6">
        {servicio && <><strong>Servicio:</strong> {servicio}<br /></>}
        {volumen !== undefined && volumen !== null && <><strong>Volumen:</strong> {volumen} m³<br /></>}
        {mes && year && <><strong>Mes/Año:</strong> {mes} / {year}<br /></>}
        {cuota !== undefined && cuota !== null && <><strong>Cuota:</strong> {cuota}<br /></>}
        <strong>Vencimiento:</strong> {vencimiento ? formatLocalDate(vencimiento?.split?.("T")?.[0] ?? vencimiento) : "Sin fecha"}
      </div>
      {/* Extra (tarjeta de módulo u otro dato) */}
      {extraInfo && <div className="w-100 d-flex justify-content-center">{extraInfo}</div>}
    </div>
  );
}

TotalAPagarInfo.propTypes = {
  total: PropTypes.number,
  modulos: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  formula: PropTypes.string,
  complete: PropTypes.bool,
  missingFields: PropTypes.arrayOf(PropTypes.string),
  cliente: PropTypes.string,
  servicio: PropTypes.string,
  volumen: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  mes: PropTypes.string,
  year: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  cuota: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  vencimiento: PropTypes.string,
  periodos: PropTypes.array,
  formatLocalDate: PropTypes.func,
  extraInfo: PropTypes.node,
  labelModulos: PropTypes.string,
};
