import React, { useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import '../../../../styles/ReciboImprimible.css';

const ReciboImprimible = ({ recibo, handlePrint }) => {
  const reciboRef = useRef();

  useEffect(() => {
    handlePrint.current = async () => {
      const canvas = await html2canvas(reciboRef.current, { scale: 1 });
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Recibo Imprimible</title>
            <style>
              @media print {
                @page {
                  size: 210mm 148mm; /* A5 en orientación horizontal (landscape) */
                  margin: 0;
                }
                body, html {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  width: 210mm;
                  height: 148mm;
                  margin: 0;
                  padding: 0;
                  overflow: hidden;
                }
              }
              body {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
              }
            </style>
          </head>
          <body>
            <!-- Imagen en tamaño A5 horizontal sin rotación -->
            <img src="${canvas.toDataURL('image/png')}" style="width: 210mm; height: 148mm; display: block;" />
          </body>
        </html>
      `);
      printWindow.document.close();

      printWindow.onload = () => {
        printWindow.print();

        // Cerrar la ventana después de completar la impresión
        printWindow.addEventListener('afterprint', () => {
          printWindow.close();
        });
      };
    };
  }, [handlePrint]);

  return (
    <div ref={reciboRef} className="recibo">
      <div className="recibo-columnas">
        <div className="columna izquierda">
          <div className="header">
            <p><strong>{recibo.n_recibo || ''}</strong></p>
            <p><strong></strong> {recibo.created_at ? new Date(recibo.created_at).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div className="section">
            <p>{recibo.cliente_nombre} {recibo.cliente_apellido}</p>
            <p><strong>Domicilio:</strong> {recibo.cliente_calle || ''}</p>
          </div>
          <div className="section tributo-info">
            <p><strong>Detalle del Tributo:</strong> {recibo.tributo || ''}</p>
          </div>
          <div className="section periodos-info">
            <h4>Períodos</h4>
            <ul>
              {recibo.periodos.map((periodo, i) => (
                <li key={i} className="periodo-item">
                  {periodo.mes}/{periodo.año} - AR$ {periodo.i_debito.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
          <div className="section observaciones">
            <strong>Observaciones:</strong>
          </div>
          <div className="footer">
            <p><strong>Total:</strong> AR$ {recibo.totalAmount.toFixed(2)}</p>
            <p><strong>Agente Emisor:</strong> {recibo.agente_emisor || ''}</p>
            <p><strong>Fecha:</strong> {new Date(recibo.fecha || new Date()).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="columna derecha">
          <div className="header">
            <p><strong>Recibo Nº: {recibo.n_recibo || ''}</strong></p>
            <p><strong>Fecha de Creación:</strong> {recibo.created_at ? new Date(recibo.created_at).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div className="section">
            <p><strong>Contribuyente:</strong> {recibo.cliente_nombre} {recibo.cliente_apellido}</p>
            <p><strong>Domicilio:</strong> {recibo.cliente_domicilio || ''}</p>
          </div>
          <div className="section tributo-info">
            <p><strong>Detalle del Tributo:</strong> {recibo.tributo || ''}</p>
          </div>
          <div className="section periodos-info">
            <h4>Períodos</h4>
            <ul>
              {recibo.periodos.map((periodo, i) => (
                <li key={i} className="periodo-item">
                  {periodo.mes}/{periodo.año} - AR$ {periodo.i_debito.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
          <div className="section observaciones">
            <strong>Observaciones:</strong>
          </div>
          <div className="footer">
            <p><strong>Total:</strong> AR$ {recibo.totalAmount.toFixed(2)}</p>
            <p><strong>Agente Emisor:</strong> {recibo.agente_emisor || ''}</p>
            <p><strong>Fecha:</strong> {new Date(recibo.fecha || new Date()).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReciboImprimible;
