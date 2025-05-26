import React, { useContext, useState } from 'react';
import { Breadcrumb, InputGroup, Form, Button } from 'react-bootstrap';
import { FaSearch, FaTimes, FaPlus, FaRedo, FaEdit, FaTrash } from 'react-icons/fa';
import CustomButton from '../../../../components/common/botons/CustomButton.jsx';
import CommonTable from '../../../../components/common/table/table.jsx';
import NewClientModal from '../../../../components/common/modals/NewClientModal.jsx';
import EditClientModal from '../../../../components/common/modals/EditClientModal.jsx';
import { ClientContext } from '../../../../context/ClientContext';
import { useNavigate } from 'react-router-dom';

export default function Clientes() {
  const {
    clients,
    loading,
    pageCount,
    fetchClients,
    searchClients,
    addClient,
    updateClient,
    removeClient
  } = useContext(ClientContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const navigate = useNavigate();

  const handleSearch = () => searchClients(searchTerm);
  const handleReset = () => {
    setSearchTerm('');
    fetchClients({ page: 1, per_page: 15 });
  };
  const handleRowClick = row => navigate(`/facturacion/clientes/${row.id}`);

  const columns = [
    {
      Header: 'Nombre Completo',
      accessor: r => `${r.persona.nombre} ${r.persona.apellido}`.trim(),
    },
    { Header: 'DNI/CUIT', accessor: 'persona.dni' },
    {
      Header: 'Tipo',
      accessor: r => r.clientable_type?.split('\\').pop() || '—'
    },
    { Header: 'Email', accessor: 'persona.email' },
    { Header: 'Teléfono', accessor: 'persona.telefono' },
    {
      Header: 'Acciones',
      disableSortBy: true,
      Cell: ({ row }) => (
        <>
          <CustomButton
            variant="warning"
            size="sm"
            onClick={e => {
              e.stopPropagation();
              setSelectedClient(row.original);
              setShowEdit(true);
            }}
          >
            <FaEdit />
          </CustomButton>{' '}
          <CustomButton
            variant="danger"
            size="sm"
            onClick={e => {
              e.stopPropagation();
              removeClient(row.original.id);
            }}
          >
            <FaTrash />
          </CustomButton>
        </>
      ),
    },
  ];

  return (
    <div className="mt-2 clientes-section">
      <Breadcrumb>
        <Breadcrumb.Item linkAs="a" href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item active>Gestión de Clientes</Breadcrumb.Item>
      </Breadcrumb>

      <div className="d-flex mb-3">
        <InputGroup>
          <Form.Control
            placeholder="Buscar clientes por DNI/CIUT, Apellido o Nombre..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          {searchTerm && (
            <Button variant="outline-secondary" onClick={handleReset}>
              <FaTimes />
            </Button>
          )}
          <Button variant="primary" onClick={handleSearch}>
            <FaSearch />
          </Button>
        </InputGroup>
        <CustomButton
          variant="outline-primary"
          className="ms-2"
          onClick={handleReset}
        >
          <FaRedo />
        </CustomButton>
      </div>

      <CustomButton className="mb-3" onClick={() => setShowAdd(true)}>
        <FaPlus /> Agregar Cliente
      </CustomButton>

      <CommonTable
        columns={columns}
        data={clients}
        loading={loading}
        fetchData={fetchClients}
        controlledPageCount={pageCount}
        initialPageSize={15}
        pageSizeOptions={[15, 30, 45]}
        onRowClick={handleRowClick}
      />

      <NewClientModal
        show={showAdd}
        handleClose={() => setShowAdd(false)}
        handleSubmit={async data => {
          const created = await addClient(data);
          setShowAdd(false);
          return created;
        }}
      />

      {selectedClient && (
        <EditClientModal
          show={showEdit}
          handleClose={() => setShowEdit(false)}
          clientData={selectedClient}
          handleSubmit={async data => {
            const updated = await updateClient(data);
            setShowEdit(false);
            return updated;
          }}
        />
      )}
    </div>
  );
}
