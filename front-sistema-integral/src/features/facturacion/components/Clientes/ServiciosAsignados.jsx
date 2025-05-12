// ServiciosAsignados.jsx
import React from 'react';
import { Table } from 'react-bootstrap';

const ServiciosAsignados = ({ cliente, tributos }) => {
  return cliente.servicios && cliente.servicios.length > 0 ? (
    <Table striped bordered hover className="mt-3">
      <thead>
        <tr>
          <th>#</th>
          <th>Tributo</th>
          <th>Servicio</th>
        </tr>
      </thead>
      <tbody>
        {cliente.servicios.map((serv, index) => (
          <tr key={serv.id}>
            <td>{index + 1}</td>
            <td>
              {tributos[serv.tributo_id]
                ? tributos[serv.tributo_id].nombre
                : `Tributo ${serv.tributo_id}`}
            </td>
            <td>{serv.nombre}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  ) : (
    <p>No hay servicios asignados.</p>
  );
};

export default ServiciosAsignados;
