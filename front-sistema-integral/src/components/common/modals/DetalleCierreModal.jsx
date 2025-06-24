import React, { useRef } from "react";
import { Modal, Button, Spinner, Table, Alert } from "react-bootstrap";
import { formatDateToDMY } from "../../../utils/dateUtils";
import formatNumber from "../../../utils/formatNumber";

const DetalleCierreModal = ({
  show,
  onHide,
  loading,
  detalle,
  error,
  loadingDetalle, // RECIBE EL ESTADO DE LOADING DEL PADRE
}) => {
  const printRef = useRef();

  // Normaliza la respuesta
  const cierre =
    Array.isArray(detalle) && detalle.length > 0 && typeof detalle[0] === "object"
      ? detalle[0]
      : null;
  const detalles = cierre?.detalles || [];

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContents = printRef.current.innerHTML;
    const printWindow = window.open('', '', 'width=1200,height=800');
    printWindow.document.write(`
      <html>
        <head>
          <title>Impresión de Cierre de Caja</title>
          <style>
            @media print {
              @page { size: A4 landscape; margin: 10mm; }
              body { font-family: Arial, sans-serif; font-size: 9pt; }
              h2, h5 { margin: 0 0 6px; font-size: 12pt; }
              .print-logo {
                display: block;
                margin: 0 0 8px 0;
                width: 90px;
                float: left;
              }
              .print-resumen-table td { border: none !important; padding: 2px 4px; }
              .print-table {
                border: none !important;
                width: 100%;
                font-size: 8pt;
              }
              .print-table th,
              .print-table td {
                border: none !important;
                border-bottom: 1px solid #d9d9d9 !important;
                padding: 2px 4px;
                vertical-align: top;
              }
              .print-table th {
                background: #f2f2f2;
                font-size: 9pt;
                font-weight: bold;
              }
              .print-muted {
                color: #888 !important;
              }
              .text-success { color: #2ca44a; font-weight: bold; }
              .text-primary { color: #004085; }
            }
            @media screen {
              .print-table { font-size: 1rem; }
              .print-logo { width: 90px; }
            }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);

    printWindow.document.close();

    const img = printWindow.document.querySelector('img');
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
              <div className="mb-2 d-flex align-items-center">
                <img
                  src="/EscudoZapala.png"
                  alt="Escudo Municipalidad de Zapala"
                  className="print-logo"
                  style={{ width: 90, marginBottom: 10 }}
                />
                <div className="flex-grow-1 text-center">
                  <h2 className="text-primary">Municipalidad de Zapala</h2>
                  <h5>Cierre de Caja N° {cierre.id}</h5>
                  <p className="print-muted" style={{ marginBottom: 0 }}>
                    Fecha: {formatDateToDMY(cierre.f_cierre)}
                  </p>
                </div>
              </div>

              <h5 className="mb-2 mt-2 text-primary">Resumen</h5>
              <Table className="print-resumen-table" size="sm">
                <tbody>
                  <tr>
                    <td className="label">Total Recibos</td>
                    <td>{cierre.t_recibos}</td>
                    <td className="label">Débito</td>
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
                      $ {formatNumber(cierre.i_total)}
                    </td>
                  </tr>
                  <tr>
                    <td className="label">Creado</td>
                    <td>{formatDateToDMY(cierre.created_at)}</td>
                    <td className="label">Última Actualización</td>
                    <td>{formatDateToDMY(cierre.updated_at)}</td>
                  </tr>
                </tbody>
              </Table>

              <h5 className="mb-2 mt-4 text-primary">Recibos Procesados</h5>
              {detalles.length > 0 ? (
                <table className="print-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>N° Recibo</th>
                      <th>Cuenta</th>
                      <th>Imp. Original</th>
                      <th>Descuento</th>
                      <th>Recargo</th>
                      <th>Cred</th>
                      <th>Total</th>
                      <th>Cliente</th>
                      <th>Servicio</th>
                      <th>Cajero</th>
                      <th>Emisor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalles.map((d) => (
                      <tr key={d.id}>
                        <td>{d.n_recibo}</td>
                        <td>{d.n_cuenta}</td>
                        <td>$ {formatNumber(d.recibo.i_debito)}</td>
                        <td>$ {formatNumber(d.recibo.i_descuento)}</td>
                        <td>$ {formatNumber(d.recibo.i_recargo)}</td>
                        <td>$ {formatNumber(d.recibo.i_credito)}</td>
                        <td>$ {formatNumber(d.importe)}</td>
                        <td>
                          {d.recibo?.cliente?.clientable?.nombre || ""}{" "}
                          {d.recibo?.cliente?.clientable?.apellido || ""}
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
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="print-muted">No hay recibos asociados a este cierre.</div>
              )}
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
