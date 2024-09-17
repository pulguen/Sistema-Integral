import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Table, Button } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import NewClientModal from '../../../components/common/modals/NewClientModal.jsx';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No hay token disponible');
          return;
        }

        const response = await axios.get('http://10.0.0.17/municipalidad/public/api/clientes', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setClientes(response.data);
      } catch (error) {
        console.error('Error fetching clientes:', error);
      } finally {
        setCargando(false);
      }
    };

    fetchClientes();
  }, []);

  // Función para agregar un cliente
  const handleAddClient = async (newClient) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No hay token disponible');
        return;
      }

      const response = await axios.post(
        'http://10.0.0.17/municipalidad/public/api/clientes',
        newClient,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Agregar el cliente a la lista con los datos recibidos del backend
      setClientes((prevClientes) => [...prevClientes, response.data]);

      return Promise.resolve(); // Promesa resuelta en caso de éxito
    } catch (error) {
      console.error('Error al agregar cliente:', error);
      return Promise.reject(); // Promesa rechazada en caso de error
    }
  };

  // Función para eliminar un cliente
  const onDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No hay token disponible');
        return;
      }

      await axios.delete(`http://10.0.0.17/municipalidad/public/api/clientes/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setClientes((prevClientes) => prevClientes.filter((cliente) => cliente.id !== id));
      Swal.fire('Eliminado!', 'El cliente ha sido eliminado.', 'success');
    } catch (error) {
      console.error('Error deleting cliente:', error);
      Swal.fire('Error', 'Error al eliminar el cliente.', 'error');
    }
  };

  return (
    <div className="table-responsive mt-2">
      <h3>Gestión de Clientes</h3>
      {cargando ? (
        <p>Cargando clientes...</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>DNI</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Calle</th>
              <th>Altura</th>
              <th>Fecha de Nacimiento</th>
              <th>Tipo Cliente</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.id}</td>
                <td>{cliente.persona?.nombre}</td>
                <td>{cliente.persona?.apellido}</td>
                <td>{cliente.persona?.dni}</td>
                <td>{cliente.persona?.email}</td>
                <td>{cliente.persona?.telefono}</td>
                <td>{cliente.persona?.calle}</td>
                <td>{cliente.persona?.altura}</td>
                <td>{cliente.persona?.f_nacimiento}</td>
                <td>{cliente.tipo_cliente}</td>
                <td>
                  <Button variant="warning" size="sm" className="me-2">
                    <FaEdit />
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => onDelete(cliente.id)}>
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Button variant="primary" className="mt-3" onClick={() => setShowModal(true)}>
        <FaPlus className="me-2" />
        Agregar Cliente
      </Button>

      <NewClientModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        handleSubmit={handleAddClient}
      />
    </div>
  );
}
