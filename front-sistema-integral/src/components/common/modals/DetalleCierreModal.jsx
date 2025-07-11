import React, { useRef } from "react";
import { Modal, Button, Spinner, Table, Alert } from "react-bootstrap";
import { formatDateOnlyDMY } from "../../../utils/dateUtils";
import formatNumber from "../../../utils/formatNumber";
import "../../../styles/DetalleCierreModal.css";

// Helpers (originales)
function renderTributo(detalle) {
  if (!detalle?.cuenta) return "-";
  if (detalle.cuenta.tributo && detalle.cuenta.tributo.nombre)
    return detalle.cuenta.tributo.nombre;
  if (detalle.cuenta.tributo_id) return detalle.cuenta.tributo_id;
  return "-";
}

function getNombreCliente(clientable) {
  if (!clientable) return "-";
  if (clientable.razon_social) return clientable.razon_social;
  return `${clientable.nombre || ""} ${clientable.apellido || ""}`.trim() || "-";
}

function getUniqueTributos(detalles) {
  return Array.from(
    new Set(
      (detalles || []).map((detalle) => renderTributo(detalle)).filter(Boolean)
    )
  ).join(', ');
}

// --- Cierre por cajero helpers ---
function groupByCajero(arr) {
  const grouped = {};
  arr.forEach((d) => {
    const id = d.cajero?.id || "sin_cajero";
    if (!grouped[id]) grouped[id] = [];
    grouped[id].push(d);
  });
  return grouped;
}

function getCajeroNombre(arr) {
  const d = arr.find(x => x.cajero?.name) || arr[0];
  return d?.cajero?.name || "Sin cajero";
}

function totalesRecibos(arr) {
  const inicial = { t_recibos: 0, i_debito: 0, i_credito: 0, i_recargo: 0, i_descuento: 0, i_total: 0 };
  return arr.reduce((ac, d) => ({
    t_recibos: ac.t_recibos + 1,
    i_debito: ac.i_debito + (d.i_debito ?? 0),
    i_credito: ac.i_credito + (d.i_credito ?? 0),
    i_recargo: ac.i_recargo + (d.i_recargo ?? 0),
    i_descuento: ac.i_descuento + (d.i_descuento ?? 0),
    i_total: ac.i_total + (d.i_total ?? 0)
  }), inicial);
}

// ----
const DetalleCierreModal = ({
  show,
  onHide,
  loading,
  detalle,
  error
}) => {
  const printRef = useRef();

  const pagados = detalle?.recibosPagados || [];
  const anulados = detalle?.recibosAnulados || [];
  const cierre = detalle || null;

  // Agrupar recibos pagados/anulados por cajero
  const pagadosByCajero = groupByCajero(pagados);
  const anuladosByCajero = groupByCajero(anulados);
  // Solo cajeros con cobros
  const cajeroIds = Object.keys(pagadosByCajero).filter(id => pagadosByCajero[id].length > 0);

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContents = printRef.current.innerHTML;
    const printWindow = window.open('', '', 'width=1200,height=800');
    printWindow.document.write(`
      <html>
        <head>
          <title>Impresión de Cierre de Caja</title>
          <style>
            :root {
              --primary-color: #C1D101;
              --secundary-color: #1E2F58;
              --alternative-color: #DADADA;
              --dark-color: #1F191A;
              --ligth-color: #FCFCFC;
              --danger-color:#e63552; 
              --tamaño-fuente: 12pt;
            }
            .print-resumen-table {
              width: 100%;
              margin-bottom: 18px;
              border: none;
              border-collapse: collapse;
              font-size: 9pt;
            }
            .print-resumen-table td {
              border: none !important;
              padding: 6px 16px 6px 6px !important;
              font-size: 9pt;
              vertical-align: middle;
            }
            .print-resumen-table tr:not(:last-child) td {
              border-bottom: 1px solid #e9ecef !important;
            }
            .print-resumen-table .label {
              color: #1E2F58 !important;
              font-weight: 500;
              min-width: 120px;
              white-space: nowrap;
            }
            .print-resumen-table .text-primary {
              color: #1976d2 !important;
              font-weight: 500;
            }
            .print-resumen-table .text-success {
              color: #2ca44a !important;
              font-weight: bold;
            }
            .print-resumen-table td:last-child, 
            .print-resumen-table td:nth-child(2n) {
              text-align: right !important;
            }
            @media print {
              @page { size: A4 landscape; margin: 10mm; }
              body { font-family: Arial, sans-serif; font-size: 9pt; background: white; }
              h2, h5 { margin: 0 0 6px; font-size: 12pt; }
              .print-resumen-table td { border: none !important; padding: 2px 4px; }
              .print-table {
                border: none !important;
                width: 100%;
                font-size: 8pt;
                border-collapse: collapse !important;
                border-spacing: 0;
                table-layout: auto;
                min-width: 950px;
              }
              .titulo-muni {
                font-weight: 700;
                font-size: 20px;
                color: #222;
                margin-bottom: 3px;
              }
              .subtitulo-muni {
                font-weight: 600;
                font-size: 15px;
                color: #222;
              }
              .fecha-muni {
                font-size: 13px;
                margin-bottom: 5px;
              }
              .print-table th,
              .print-table td {
                border: none !important;
                border-bottom: 1px solid #d9d9d9 !important;
                padding: 2px 4px;
                vertical-align: top;
                text-align: left !important;
                white-space: nowrap;
              }
              .print-table th {
                background: #f2f2f2;
                font-size: 9pt;
                font-weight: bold;
                text-align: left !important;
              }
              .print-table th:first-child, .print-table td:first-child {
                min-width: 32px;
                text-align: center !important;
              }
              .print-table tbody tr:nth-child(even) {
                background-color: rgba(193, 209, 1, 0.05) !important;
                background-color: color-mix(in srgb, var(--primary-color) 15%, transparent) !important;
              }
              .table-responsive-print {
                width: 100% !important;
                overflow-x: visible !important;
                display: block !important;
                max-width: none !important;
              }
              .mini-cierre-cajero { 
                page-break-before: always; 
                border: none !important; 
                background: none !important;
              }
              img.print-logo,
              .encabezado-cierre-table img.print-logo,
              td img.print-logo {
                width: 2cm !important;
                max-width: 2cm !important;
                min-width: 2cm !important;
                height: auto !important;
                object-fit: contain !important;
                display: block !important;
                margin-right: 12px !important;
                margin-bottom: 0 !important;
                padding: 0 !important;
                box-sizing: border-box !important;
              }
              .encabezado-cierre-table {
                margin-bottom: 10px !important;
                width: auto !important;
              }
              .encabezado-cierre-table td {
                vertical-align: top !important;
                padding-bottom: 0 !important;
                padding-top: 0 !important;
                padding-right: 10px !important;
              }
              .titulo-muni, .subtitulo-muni, .fecha-muni {
                color: #000 !important;
                margin-bottom: 2px !important;
              }
              .print-muted {
                color: #888 !important;
              }
              .text-success { color: #2ca44a; font-weight: bold; }
              .text-primary { color: #004085; }
            }
            @media screen {
              .print-table { font-size: 1rem; }
              .print-table tbody tr:nth-child(even) {
                background-color: rgba(193, 209, 1, 0.05) !important;
                background-color: color-mix(in srgb, var(--primary-color) 15%, transparent) !important;
              }
              .mini-cierre-cajero { border: none !important; background: none !important;}
            }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);
    printWindow.document.close();

    const img = printWindow.document.querySelector('img.print-logo');
    if (img) {
      img.onload = () => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      };
      if (img.complete) {
        img.onload();
      }
    } else {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  function renderRecibosTable(list) {
    return (
      <div className="table-responsive-print">
        <table className="print-table">
          <thead>
            <tr>
              <th>#</th>
              <th>N° Recibo</th>
              <th>Imp. Original</th>
              <th>Descuento</th>
              <th>Recargo</th>
              <th>Cred</th>
              <th>Total</th>
              <th>Cliente</th>
              <th>Tributo</th>
              <th>Cajero</th>
              <th>Emisor</th>
            </tr>
          </thead>
          <tbody>
            {list.length > 0 ? (
              list.map((d, idx) => (
                <tr key={d.id}>
                  <td style={{ textAlign: "center" }}>{idx + 1}</td>
                  <td>{d.n_recibo}</td>
                  <td>$ {formatNumber(d.i_debito)}</td>
                  <td>$ {formatNumber(d.i_descuento)}</td>
                  <td>$ {formatNumber(d.i_recargo)}</td>
                  <td>$ {formatNumber(d.i_credito)}</td>
                  <td>$ {formatNumber(d.i_total)}</td>
                  <td>{getNombreCliente(d.cliente?.clientable)}</td>
                  <td>{getUniqueTributos(d.detalles)}</td>
                  <td>{d.cajero?.name || "-"}</td>
                  <td>{d.emisor?.name || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={12} className="text-center">No hay datos.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  function renderCuentasTable(detalles) {
    if (!detalles || !Array.isArray(detalles) || detalles.length === 0) return null;
    return (
      <>
        <h5 className="mb-2 mt-4 text-primary">Detalle en Cuentas</h5>
        <div className="table-responsive-print">
          <table className="print-table">
            <thead>
              <tr>
                <th style={{ minWidth: 100 }}>N° de Cuenta</th>
                <th style={{ minWidth: 130 }}>Importe</th>
              </tr>
            </thead>
            <tbody>
              {detalles.map((cuenta, idx) => (
                <tr key={cuenta.n_cuenta || idx}>
                  <td>{cuenta.n_cuenta}</td>
                  <td>$ {formatNumber(cuenta.importe)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  // Render cierre cajero (sin detalle de cuentas)
  function renderCierreCajero(pagadosCajero, anuladosCajero, cajeroName, idx) {
    const totales = totalesRecibos(pagadosCajero);
    return (
      <div className="mini-cierre-cajero" key={cajeroName + idx}>
        <hr />
        {/* Saltos de página: @media print .mini-cierre-cajero page-break-before: always */}
        <table className="encabezado-cierre-table">
          <tbody>
            <tr>
              <td style={{ verticalAlign: 'top', paddingRight: 12 }}>
                <img src="/EscudoZapala.png" alt="Escudo Municipalidad de Zapala" className="print-logo" />
              </td>
              <td style={{ verticalAlign: 'top', paddingLeft: 0 }}>
                <div className="titulo-muni">Municipalidad de Zapala</div>
                <div className="subtitulo-muni">
                  Cierre por Cajero: <b>{cajeroName}</b>
                </div>
                <div className="fecha-muni">Fecha: {formatDateOnlyDMY(cierre.f_cierre)}</div>
              </td>
            </tr>
          </tbody>
        </table>
        <h5 className="mb-2 mt-2 text-primary">Resumen</h5>
        <Table className="print-resumen-table" size="sm">
          <tbody>
            <tr>
              <td className="label">Total Recibos</td>
              <td>{totales.t_recibos}</td>
              <td className="label">Importe</td>
              <td>$ {formatNumber(totales.i_debito)}</td>
            </tr>
            <tr>
              <td className="label">Crédito</td>
              <td>$ {formatNumber(totales.i_credito)}</td>
              <td className="label">Recargo</td>
              <td>$ {formatNumber(totales.i_recargo)}</td>
            </tr>
            <tr>
              <td className="label">Descuento</td>
              <td>$ {formatNumber(totales.i_descuento)}</td>
              <td className="label">Total</td>
              <td className="text-success">
                <strong>$ {formatNumber(totales.i_total)}</strong>
              </td>
            </tr>
          </tbody>
        </Table>
        <h5 className="mb-2 mt-4 text-success">Recibos Pagados</h5>
        {renderRecibosTable(pagadosCajero)}
        <h5 className="mb-2 mt-4 text-danger">Recibos Anulados</h5>
        {renderRecibosTable(anuladosCajero)}
      </div>
    );
  }

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Detalle del Cierre</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div ref={printRef}>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : cierre ? (
            <>
              {/* === CIERRE GENERAL (tal cual lo tenés ahora) === */}
              <table className="encabezado-cierre-table">
                <tbody>
                  <tr>
                    <td style={{ verticalAlign: 'top', paddingRight: 12 }}>
                      <img
                        src="/EscudoZapala.png"
                        alt="Escudo Municipalidad de Zapala"
                        className="print-logo"
                      />
                    </td>
                    <td style={{ verticalAlign: 'top', paddingLeft: 0 }}>
                      <div className="titulo-muni">Municipalidad de Zapala</div>
                      <div className="subtitulo-muni">Cierre de Caja N° {cierre.id}</div>
                      <div className="fecha-muni">Fecha: {formatDateOnlyDMY(cierre.f_cierre)}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <h5 className="mb-2 mt-2 text-primary">Resumen</h5>
              <Table className="print-resumen-table" size="sm">
                <tbody>
                  <tr>
                    <td className="label">Total Recibos</td>
                    <td>{cierre.t_recibos}</td>
                    <td className="label">Importe</td>
                    <td>$ {formatNumber(cierre.i_debito)}</td>
                  </tr>
                  <tr>
                    <td className="label">Crédito</td>
                    <td>$ {formatNumber(cierre.i_credito)}</td>
                    <td className="label">Recargo</td>
                    <td>$ {formatNumber(cierre.i_recargo)}</td>
                  </tr>
                  <tr>
                    <td className="label">Descuento</td>
                    <td>$ {formatNumber(cierre.i_descuento)}</td>
                    <td className="label">Total</td>
                    <td className="text-success">
                      <strong>$ {formatNumber(cierre.i_total)}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td className="label">Creado</td>
                    <td>{formatDateOnlyDMY(cierre.created_at)}</td>
                    <td className="label">Última Actualización</td>
                    <td>{formatDateOnlyDMY(cierre.updated_at)}</td>
                  </tr>
                </tbody>
              </Table>
              <h5 className="mb-2 mt-4 text-success">Recibos Pagados</h5>
              {renderRecibosTable(pagados)}
              <h5 className="mb-2 mt-4 text-danger">Recibos Anulados</h5>
              {renderRecibosTable(anulados)}
              {renderCuentasTable(cierre.detalles)}

              {/* === CIERRES POR CAJERO (sin detalle de cuentas) === */}
              {cajeroIds.map((id, idx) => {
                const pagadosCajero = pagadosByCajero[id];
                const anuladosCajero = anuladosByCajero[id] || [];
                return renderCierreCajero(pagadosCajero, anuladosCajero, getCajeroNombre(pagadosCajero), idx);
              })}
            </>
          ) : (
            <div className="text-center print-muted py-3">
              No se encontró información del cierre.
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
        <Button variant="primary" onClick={handlePrint}>
          Imprimir
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DetalleCierreModal;
