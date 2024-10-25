import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Table, Form, Breadcrumb } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import NewClientModal from '../../../../components/common/modals/NewClientModal.jsx';
import EditClientModal from '../../../../components/common/modals/EditClientModal.jsx';
import CustomButton from '../../../../components/common/botons/CustomButton.jsx';
import Loading from '../../../../components/common/loading/Loading.jsx';
import customFetch from '../../../../context/CustomFetch.js';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'asc',
  });

  const navigate = useNavigate(); // Hook para la navegación

  const fetchClientes = async () => {
    try {
      const data = await customFetch('http://10.0.0.17/municipalidad/public/api/clientes', 'GET');
      if (Array.isArray(data)) {
        setClientes(data);
      } else {
        console.error('Error: La respuesta no es un arreglo:', data);
        setClientes([]);
      }
    } catch (error) {
      Swal.fire('Error', 'Error al obtener clientes.', 'error');
      console.error('Error al obtener clientes:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const filteredClientes = clientes.filter((cliente) => {
    const nombreCompleto = `${cliente.persona?.nombre} ${cliente.persona?.apellido}`.toLowerCase();
    const dni = cliente.persona?.dni?.toString() || '';
    return nombreCompleto.includes(searchTerm.toLowerCase()) || dni.includes(searchTerm);
  });

  const sortedClientes = React.useMemo(() => {
    let sortableClientes = [...filteredClientes];
    if (sortConfig !== null) {
      sortableClientes.sort((a, b) => {
        const aKey = a.persona?.[sortConfig.key] || a[sortConfig.key];
        const bKey = b.persona?.[sortConfig.key] || b[sortConfig.key];

        if (aKey < bKey) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aKey > bKey) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableClientes;
  }, [filteredClientes, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleAddClient = async (newClient) => {
    try {
      await customFetch('http://10.0.0.17/municipalidad/public/api/clientes', 'POST', JSON.stringify(newClient));
      await fetchClientes();
      setShowAddModal(false);
      Swal.fire('Éxito', 'Cliente agregado exitosamente.', 'success');
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al agregar el cliente.', 'error');
      console.error('Error al agregar cliente:', error);
    }
  };

  const handleEditClient = async (updatedClient) => {
    try {
      await customFetch(`http://10.0.0.17/municipalidad/public/api/clientes/${updatedClient.id}`, 'PUT', JSON.stringify(updatedClient));
      await fetchClientes();
      setShowEditModal(false);
      Swal.fire('Éxito', 'Cliente modificado exitosamente.', 'success');
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al modificar el cliente.', 'error');
      console.error('Error al modificar cliente:', error);
    }
  };

  const onDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción no se puede deshacer. ¿Deseas eliminar este cliente?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      });

      if (result.isConfirmed) {
        await customFetch(`http://10.0.0.17/municipalidad/public/api/clientes/${id}`, 'DELETE');
        await fetchClientes();
        Swal.fire('Eliminado!', 'El cliente ha sido eliminado.', 'success');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al eliminar el cliente.', 'error');
      console.error('Error al eliminar cliente:', error);
    }
  };

  const handleRowClick = (clienteId) => {
    navigate(`/facturacion/clientes/${clienteId}`);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
    }
    return <FaSort />;
  };

  return (
    <div className="table-responsive mt-2 clientes-section">
      <Breadcrumb>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item href="/facturacion">Facturación</Breadcrumb.Item>
        <Breadcrumb.Item active>Gestión de Clientes</Breadcrumb.Item>
      </Breadcrumb>

      <h3 className="section-title">Gestión de Clientes</h3>

      <Form.Control
        type="text"
        placeholder="Buscar por nombre o DNI/CIUT"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-3 search-input"
      />

      <CustomButton onClick={() => setShowAddModal(true)} className="mb-3">
        <FaPlus className="me-2" />
        Agregar Cliente
      </CustomButton>

      {cargando ? (
        <Loading />
      ) : (
        <Table striped bordered hover className="custom-table">
          <thead>
            <tr>
              <th onClick={() => requestSort('id')}>ID {getSortIcon('id')}</th>
              <th onClick={() => requestSort('nombre')}>Nombre {getSortIcon('nombre')}</th>
              <th onClick={() => requestSort('apellido')}>Apellido {getSortIcon('apellido')}</th>
              <th onClick={() => requestSort('dni')}>DNI/CIUT {getSortIcon('dni')}</th>
              <th onClick={() => requestSort('email')}>Email {getSortIcon('email')}</th>
              <th onClick={() => requestSort('telefono')}>Teléfono {getSortIcon('telefono')}</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedClientes.map((cliente) => (
              <tr key={cliente.id} onClick={() => handleRowClick(cliente.id)} style={{ cursor: 'pointer' }}>
                <td>{cliente.id}</td>
                <td>{cliente.persona?.nombre}</td>
                <td>{cliente.persona?.apellido}</td>
                <td>{cliente.persona?.dni}</td>
                <td>{cliente.persona?.email}</td>
                <td>{cliente.persona?.telefono}</td>
                <td>
                  <CustomButton
                    variant="warning"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedClient(cliente);
                      setShowEditModal(true);
                    }}
                  >
                    <FaEdit />
                  </CustomButton>
                  <CustomButton
                    variant="danger"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(cliente.id);
                    }}
                  >
                    <FaTrash />
                  </CustomButton>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <NewClientModal
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
        handleSubmit={handleAddClient}
      />

      {selectedClient && (
        <EditClientModal
          show={showEditModal}
          handleClose={() => setShowEditModal(false)}
          clientData={selectedClient}
          handleSubmit={handleEditClient}
        />
      )}
    </div>
  );
}
