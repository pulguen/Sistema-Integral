// src/features/caja/components/CajaHome.jsx

import React, { useState } from "react";
import { Card, Table, Button, Breadcrumb, Form } from "react-bootstrap";
import { Link } from "react-router-dom";

const CajaHome = () => {
  // Estado inicial de movimientos de caja (ejemplo estático)
  const [movimientos] = useState([
    {
      id: 1,
      fecha: "2024-01-01",
      descripcion: "Ingreso por ventas",
      tipo: "Ingreso",
      monto: 10000,
      medioPago: "Efectivo",
      numero_recibo: 20241500001,
    },
    {
      id: 2,
      fecha: "2024-01-02",
      descripcion: "Pago a proveedor",
      tipo: "Ingreso",
      monto: 3500,
      medioPago: "Transferencia",
      numero_recibo: 20241500002,
    }
  ]);

  return (
    <Card className="shadow-sm p-4 mt-4">
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
          Inicio
        </Breadcrumb.Item>
        <Breadcrumb.Item active>
          Caja
        </Breadcrumb.Item>
      </Breadcrumb>

      <h2 className="text-center mb-4 text-primary">Sistema de Caja</h2>
      <p className="mb-4">
        Desde aquí puedes consultar y administrar los movimientos de caja, registrando ingresos y egresos con diversos medios de pago.
      </p>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Form.Group controlId="filtro" className="mb-3">
            <Form.Label>Filtrar por descripción o medio de pago</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ejemplo: efectivo, transferencia, ingreso..."
              aria-label="Filtro de movimientos"
            />
          </Form.Group>
          <Button variant="primary" className="me-2">Aplicar Filtro</Button>
          <Button variant="secondary">Limpiar Filtro</Button>
        </Card.Body>
      </Card>

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Número Recibo</th>
              <th>Fecha</th>
              <th>Descripción</th>
              <th>Tipo</th>
              <th>Monto</th>
              <th>Medio de Pago</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((mov) => (
              <tr key={mov.id}>
                <td>{mov.numero_recibo}</td>
                <td>{new Date(mov.fecha).toLocaleDateString()}</td>
                <td>{mov.descripcion}</td>
                <td>{mov.tipo}</td>
                <td>$ {mov.monto.toFixed(2)}</td>
                <td>{mov.medioPago}</td>

              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <div className="text-center mt-4">
        <Button variant="success" className="me-2">Registrar Ingreso</Button>
        <Button variant="danger">Registrar Anulación</Button>
      </div>
    </Card>
  );
};

export default CajaHome;
