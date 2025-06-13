import React, { useMemo } from "react";
import { Row, Col, Card } from "react-bootstrap";
import { FaMoneyBillWave, FaReceipt, FaBan } from "react-icons/fa";

const ResumenTotalesRecibosHoy = ({ recibosHoy }) => {
  // Memoize para performance en arrays grandes
  const { cobrados, totalCobrados, anulados, totalAnulados } = useMemo(() => {
    const cobrados = recibosHoy.filter(
      r => r.condicion_pago?.nombre?.toLowerCase() === "pagado"
    );
    const totalCobrados = cobrados.reduce(
      (acc, r) => acc + parseFloat(r.i_total || 0),
      0
    );
    const anulados = recibosHoy.filter(
      r => r.condicion_pago?.nombre?.toLowerCase() === "anulado"
    );
    const totalAnulados = anulados.reduce(
      (acc, r) => acc + parseFloat(r.i_total || 0),
      0
    );
    return { cobrados, totalCobrados, anulados, totalAnulados };
  }, [recibosHoy]);

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body>
        <Row className="text-center">
          <Col xs={12} md={4} className="mb-2">
            <FaReceipt className="me-2 text-success" />
            <span className="fw-bold text-success">{cobrados.length}</span>
            <span className="ms-2">recibos cobrados</span>
          </Col>
          <Col xs={12} md={4} className="mb-2">
            <FaMoneyBillWave className="me-2 text-primary" />
            <span className="fw-bold text-primary">
              $ {totalCobrados.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </span>
            <span className="ms-2">total cobrado</span>
          </Col>
          <Col xs={12} md={4} className="mb-2">
            <FaBan className="me-2 text-danger" />
            <span className="fw-bold text-danger">{anulados.length}</span>
            <span className="ms-2">anulados (${totalAnulados.toLocaleString("es-AR", { minimumFractionDigits: 2 })})</span>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ResumenTotalesRecibosHoy;
