import React, { useRef, useEffect, useState } from "react";
import { Modal, Button, Spinner, Table, Alert } from "react-bootstrap";
import { formatDateOnlyDMY } from "../../../utils/dateUtils";
import formatNumber from "../../../utils/formatNumber";
import customFetch from "../../../context/CustomFetch";
import "../../../styles/DetalleCierreModal.css";

const DetalleCierreModal = ({
  show,
  onHide,
  loading,
  detalle,
  error,
}) => {
  const printRef = useRef();
  const [pagados, setPagados] = useState([]);
  const [anulados, setAnulados] = useState([]);
  const [loadingRecibos, setLoadingRecibos] = useState(false);

  useEffect(() => {
    const fetchRecibos = async () => {
      if (!show || !detalle?.f_cierre) return;
      setLoadingRecibos(true);
      try {
        const fecha = detalle.f_cierre.slice(0, 10);
        const [pagadosRes, anuladosRes] = await Promise.all([
          customFetch(`/recibos?fecha_pago_minima=${fecha}&fecha_pago_maxima=${fecha}&condicion_pago_id=1`),
          customFetch(`/recibos?fecha_pago_minima=${fecha}&fecha_pago_maxima=${fecha}&condicion_pago_id=2`)
        ]);
        setPagados(Array.isArray(pagadosRes?.data) ? pagadosRes.data : []);
        setAnulados(Array.isArray(anuladosRes?.data) ? anuladosRes.data : []);
      } catch (err) {
        setPagados([]);
        setAnulados([]);
      } finally {
        setLoadingRecibos(false);
      }
    };

    fetchRecibos();
  }, [show, detalle]);

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

  const cierre = detalle || null;

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Detalle del Cierre</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div ref={printRef}>
          {loading || loadingRecibos ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : cierre ? (
            <>
              {/* Cabecera tipo tabla para impresión y pantalla */}
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
              <div className="table-responsive-print">
                <table className="print-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>N° Recibo</th>
                      <th>Cuenta</th>
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
                    {pagados.length > 0 ? (
                      pagados.map((d, idx) => (
                        <tr key={d.id}>
                          <td style={{ textAlign: "center" }}>{idx + 1}</td>
                          <td>{d.n_recibo}</td>
                          <td>{d.n_cuenta}</td>
                          <td>$ {formatNumber(d.recibo?.i_debito ?? d.i_debito)}</td>
                          <td>$ {formatNumber(d.recibo?.i_descuento ?? d.i_descuento)}</td>
                          <td>$ {formatNumber(d.recibo?.i_recargo ?? d.i_recargo)}</td>
                          <td>$ {formatNumber(d.recibo?.i_credito ?? d.i_credito)}</td>
                          <td>$ {formatNumber(d.importe ?? d.i_total)}</td>
                          <td>
                            {d.recibo?.cliente?.clientable
                              ? `${d.recibo.cliente.clientable.nombre || ""} ${d.recibo.cliente.clientable.apellido || ""}`
                              : ""}
                          </td>
                          <td>
                            {d.recibo?.detalles?.[0]?.cuenta?.tributo?.nombre || "-"}
                          </td>
                          <td>
                            {d.recibo?.cajero?.name || "-"}
                          </td>
                          <td>
                            {d.recibo?.emisor?.name || "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={12} className="text-center">No hay recibos pagados.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <h5 className="mb-2 mt-4 text-danger">Recibos Anulados</h5>
              <div className="table-responsive-print">
                <table className="print-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>N° Recibo</th>
                      <th>Cuenta</th>
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
                    {anulados.length > 0 ? (
                      anulados.map((d, idx) => (
                        <tr key={d.id}>
                          <td style={{ textAlign: "center" }}>{idx + 1}</td>
                          <td>{d.n_recibo}</td>
                          <td>{d.n_cuenta}</td>
                          <td>$ {formatNumber(d.recibo?.i_debito ?? d.i_debito)}</td>
                          <td>$ {formatNumber(d.recibo?.i_descuento ?? d.i_descuento)}</td>
                          <td>$ {formatNumber(d.recibo?.i_recargo ?? d.i_recargo)}</td>
                          <td>$ {formatNumber(d.recibo?.i_credito ?? d.i_credito)}</td>
                          <td>$ {formatNumber(d.importe ?? d.i_total)}</td>
                          <td>
                            {d.recibo?.cliente?.clientable
                              ? `${d.recibo.cliente.clientable.nombre || ""} ${d.recibo.cliente.clientable.apellido || ""}`
                              : ""}
                          </td>
                          <td>
                            {d.recibo?.detalles?.[0]?.cuenta?.tributo?.nombre || "-"}
                          </td>
                          <td>
                            {d.recibo?.cajero?.name || "-"}
                          </td>
                          <td>
                            {d.recibo?.emisor?.name || "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={12} className="text-center">No hay recibos anulados.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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
