// src/components/common/charts/KpiCards.jsx
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';

const KpiCards = React.memo(({ totalPeriodos, totalIngresos, promedioMensual }) => {
  const kpis = [
    {
      title: 'Total de Periodos',
      value: totalPeriodos,
      bg: 'primary',
      icon: '📈',
    },
    {
      title: 'Total Importes Generados (AR$)',
      value: parseFloat(totalIngresos).toFixed(2),
      bg: 'success',
      icon: '💰',
    },
    {
      title: 'Promedio Mensual',
      value: parseFloat(promedioMensual).toFixed(2),
      bg: 'warning',
      icon: '📊',
    },
  ];

  return (
    <Row className="mb-4">
      {kpis.map((kpi, index) => (
        <Col md={4} key={index}>
          <Card bg={kpi.bg} text="white" className="mb-2">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <Card.Title>{kpi.title}</Card.Title>
                <Card.Text style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {kpi.value}
                </Card.Text>
              </div>
              <div style={{ fontSize: '2rem' }}>{kpi.icon}</div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
});

export default KpiCards;
