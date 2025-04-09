import React, { useRef, useEffect } from 'react';
// eslint-disable-next-line
import html2pdf from 'html2pdf.js';
import JsBarcode from 'jsbarcode';
import '../../../../styles/ReciboImprimible.css';

const ReciboImprimible = ({ recibo, handlePrint }) => {
  const reciboRef = useRef();
  const barcodeRef = useRef();

  useEffect(() => {
    if (recibo.barcode) {
      JsBarcode(barcodeRef.current, recibo.barcode, {
        format: 'CODE128',
        width: 2,
        height: 40,
        displayValue: false,
      });
    }

    handlePrint.current = () => {
      const element = reciboRef.current;
      const columnaIzquierda = element.querySelector('.columna-izquierda');
      columnaIzquierda.style.borderRight = 'none';

      html2pdf()
        .set({
          margin: 0,
          filename: 'recibo.pdf',
          image: { type: 'jpeg', quality: 1 },
          html2canvas: { scale: 4 },
          jsPDF: { unit: 'mm', format: [210, 148], orientation: 'landscape' },
        })
        .from(element)
        .outputPdf('blob')
        .then((pdfBlob) => {
          const pdfUrl = URL.createObjectURL(pdfBlob);
          window.open(pdfUrl, '_blank');
        });
    };
  }, [recibo, handlePrint]);

  // Función para formatear la fecha sin conversión a Date.
  // Se toma la parte del string antes de la "T" (o el espacio) y se formatea a dd/mm/yyyy.
  const formatFecha = (fechaString) => {
    if (!fechaString) return 'N/A';
    let datePart = fechaString;
    if (fechaString.includes(' ')) {
      datePart = fechaString.split(' ')[0];
    } else if (fechaString.includes('T')) {
      datePart = fechaString.split('T')[0];
    }
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatFechaCorta = (fechaString) => {
    return formatFecha(fechaString);
  };

  return (
    <div ref={reciboRef} className="recibo">
      <div className="recibo-columnas">
        {/* Columna izquierda */}
        <div className="columna-izquierda">
          <div className="header-izquierda sector1">
            <div className="barcode-container">
              <canvas ref={barcodeRef} />
            </div>
            <p className="num-recibo-izq"><strong>{recibo.n_recibo || ''}</strong></p>
            <p>{recibo.created_at ? formatFecha(recibo.created_at) : 'N/A'}</p>
          </div>

          <div className="sector2-izq">
            <p>
              {recibo.cliente_nombre} {recibo.cliente_apellido} 
              Dir: {recibo.cliente_calle || 'calle'} {recibo.cliente_altura || 'n°'}
            </p>
          </div>

          <div className="sector3-izq">
            <p><strong>Bombeo Agua a {recibo.servicio_nombre || 'BOMBEO DE AGUA'}</strong></p>
          </div>

          <div className="sector4-izq">
            <div className="periodos-list">
              {recibo.periodos.map((periodo, i) => (
                <span key={i} className="periodo-item">
                  {periodo.mes}/{periodo.año} - {periodo.cantidad} m<sup>3</sup> - ${periodo.i_debito.toFixed(2)}
                  {i < recibo.periodos.length - 1 && ', '}
                </span>
              ))}
            </div>
          </div>

          <div className="sector5-izq">
            <div className="observaciones-column-izq">
              <p>{recibo.observaciones || 'sin observaciones'}</p>
              <p className="emisor-izq">{recibo.agente_emisor || 'Nombre Emisor'}</p>
            </div>
            <div className="totales-column-izq">
              <div className="totales-flex-izq">
                <p className="importe-izq">Importe: ${recibo.importe.toFixed(2)}</p>
                {recibo.descuento > 0 && (
                  <p className="descuento-izq">
                    Descuento: ${recibo.descuento.toFixed(2)}
                  </p>
                )}
                {recibo.recargo > 0 && (
                  <p className="recargo-izq">
                    Recargo: ${recibo.recargo.toFixed(2)}
                  </p>
                )}
                <p className="total-final-izq">
                  <strong>${recibo.total.toFixed(2)}</strong>
                </p>
              </div>
              <div className="totales-footer-izq">
                <p className="vencimiento-izq">
                  Vencimiento: {recibo.vencimiento ? formatFechaCorta(recibo.vencimiento) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="columna-derecha">
          <div className="sector1-der">
            <p>{recibo.created_at ? formatFecha(recibo.created_at) : 'N/A'}</p>
          </div>

          <div className="sector2-der">
            <p><strong>Bombeo Agua a {recibo.servicio_nombre || 'BOMBEO DE AGUA'}</strong></p>
          </div>

          <div className="sector3-der">
            <p>
              {recibo.cliente_nombre} {recibo.cliente_apellido} 
              Dir: {recibo.cliente_calle || 'calle'} {recibo.cliente_altura || 'n°'}
            </p>
          </div>

          <div className="sector4-der">
            <div className="periodos-list">
              {recibo.periodos.map((periodo, i) => (
                <span key={i} className="periodo-item">
                  {periodo.mes}/{periodo.año} - {periodo.cantidad} m<sup>3</sup> - ${periodo.i_debito.toFixed(2)}
                  {i < recibo.periodos.length - 1 && ', '}
                </span>
              ))}
            </div>
          </div>

          <div className="sector5-der">
            <div
              className="totales-flex-der"
              style={{ alignItems: 'center', textAlign: 'center' }}
            >
              <p className="importe-der">
                Importe: ${recibo.importe.toFixed(2)}
              </p>
              {recibo.descuento > 0 && (
                <p className="descuento-der">
                  Descuento: ${recibo.descuento.toFixed(2)}
                </p>
              )}
              {recibo.recargo > 0 && (
                <p className="recargo-der">
                  Recargo: ${recibo.recargo.toFixed(2)}
                </p>
              )}
            </div>
            <div
              className="totales-footer-der"
              style={{ alignItems: 'center', textAlign: 'center' }}
            >
              <p className="total-final-der">
                <strong>${recibo.total.toFixed(2)}</strong>
              </p>
              <p>
                <strong>{recibo.n_recibo || ''}</strong>
              </p>
              <p>{recibo.agente_emisor || 'Nombre Emisor'}</p>
              <p className="vencimiento-der">
                Vencimiento: {recibo.vencimiento ? formatFechaCorta(recibo.vencimiento) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReciboImprimible;
