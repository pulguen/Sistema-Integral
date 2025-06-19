import React, { useRef } from "react";
import { Modal, Button, Spinner, Table, Alert } from "react-bootstrap";
import { formatDateToDMY } from "../../../utils/dateUtils";

const DetalleCierreModal = ({ show, onHide, loading, detalle, error }) => {
  const printRef = useRef();

  // Normaliza la respuesta: primer elemento es el cierre, el segundo el status
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
            /* Para la vista normal, usa Bootstrap */
            @media screen {
              .print-table { font-size: 1rem; }
            }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
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
              <div className="mb-2">
                <h2 className="text-center text-primary">Municipalidad de Zapala</h2>
                <h5 className="text-center">Cierre de Caja N° {cierre.id}</h5>
                <p className="text-center print-muted" style={{marginBottom: 0}}>
                  Fecha: {formatDateToDMY(cierre.f_cierre)}
                </p>
              </div>

              <h5 className="mb-2 mt-2 text-primary">Resumen</h5>
              <Table className="print-resumen-table" size="sm">
                <tbody>
                  <tr>
                    <td className="label">Total Recibos</td>
                    <td>{cierre.t_recibos}</td>
                    <td className="label">Débito</td>
                    <td>$ {parseFloat(cierre.i_debito).toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td className="label">Crédito</td>
                    <td>$ {parseFloat(cierre.i_credito).toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
                    <td className="label">Recargo</td>
                    <td>$ {parseFloat(cierre.i_recargo).toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td className="label">Descuento</td>
                    <td>$ {parseFloat(cierre.i_descuento).toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
                    <td className="label">Total</td>
                    <td className="text-success">
                      $ {parseFloat(cierre.i_total).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
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
                <table className="print-table" style={{width:'100%'}}>
                  <thead>
                    <tr>
                      <th>N° Recibo</th>
                      <th>Cuenta</th>
                      <th>Importe</th>
                      <th>Cliente</th>
                      <th>Servicio</th>
                      <th>Cajero</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalles.map((d) => (
                      <tr key={d.id}>
                        <td>{d.n_recibo}</td>
                        <td>{d.n_cuenta}</td>
                        <td>$ {parseFloat(d.importe).toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
                        <td>
                          {d.recibo?.cliente?.clientable?.nombre || ""}{" "}
                          {d.recibo?.cliente?.clientable?.apellido || ""}
                        </td>
                        <td>
                          {d.recibo?.detalles?.[0]?.cuenta?.servicio?.nombre || "-"}
                        </td>
                        <td>
                          {d.recibo?.cajero?.name || "-"}
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
