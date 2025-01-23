import React, { useState, useEffect, useCallback, useContext } from 'react';
import Swal from 'sweetalert2';
import { Breadcrumb, Form, Button, Table } from 'react-bootstrap';
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSort,
  FaSortUp,
  FaSortDown,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import NewClientModal from '../../../../components/common/modals/NewClientModal.jsx';
import EditClientModal from '../../../../components/common/modals/EditClientModal.jsx';
import CustomButton from '../../../../components/common/botons/CustomButton.jsx';
import Loading from '../../../../components/common/loading/Loading.jsx';
import customFetch from '../../../../context/CustomFetch.js';

// Importa los hooks de React Table
import {
  useTable,
  useSortBy,
  usePagination,
  useGlobalFilter,
} from 'react-table';

// 1. Importa AuthContext para poder verificar los permisos:
import { AuthContext } from '../../../../context/AuthContext';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  // 2. Extrae user con user.services, y la función hasPermission
  const { user } = useContext(AuthContext);
  const hasPermission = useCallback(
    (permission) => user?.permissions?.includes(permission),
    [user?.permissions]
  );

  /**
   * Función para obtener clientes desde la API.
   */
  const fetchClientes = useCallback(async () => {
    try {
      setCargando(true);
      const data = await customFetch('/clientes', 'GET');
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
  }, []);

  // Obtener clientes al montar el componente
  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  /**
   * Eliminar cliente
   */
  const onDelete = useCallback(
    async (id) => {
      try {
        const result = await Swal.fire({
          title: '¿Estás seguro?',
          text: 'Esta acción no se puede deshacer. ¿Deseas eliminar este cliente?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar',
        });

        if (result.isConfirmed) {
          await customFetch(`/clientes/${id}`, 'DELETE');
          await fetchClientes();
          Swal.fire('Eliminado!', 'El cliente ha sido eliminado.', 'success');
        }
      } catch (error) {
        Swal.fire('Error', 'Hubo un problema al eliminar el cliente.', 'error');
        console.error('Error al eliminar cliente:', error);
      }
    },
    [fetchClientes]
  );

  /**
   * Filtrar clientes según los servicios del usuario y el searchTerm
   */
  const filteredClientes = React.useMemo(() => {
    // Primero, filtrar según servicios en común.
    // user.services es un array de IDs de servicios asignados al usuario
    let filteredByServices = clientes;
    if (Array.isArray(user?.services) && user.services.length > 0) {
      filteredByServices = clientes.filter((cli) => {
        // cli.servicios es un array con {id, nombre, ...}
        return (
          Array.isArray(cli.servicios) &&
          cli.servicios.some((serv) => user.services.includes(serv.id))
        );
      });
    } else {
      // Si el usuario no tiene servicios o no se han cargado, no muestra ningún cliente
      filteredByServices = [];
    }

    // Segundo, filtrar por searchTerm
    if (!searchTerm) return filteredByServices;
    return filteredByServices.filter((cliente) => {
      const nombreCompleto = `${cliente.persona?.nombre} ${cliente.persona?.apellido}`.toLowerCase();
      const dni = cliente.persona?.dni?.toString() || '';
      return (
        nombreCompleto.includes(searchTerm.toLowerCase()) ||
        dni.includes(searchTerm)
      );
    });
  }, [clientes, user?.services, searchTerm]);

  /**
   * Definir las columnas para React Table.
   */
  const columns = React.useMemo(
    () => [
      {
        Header: 'Nombre',
        accessor: 'persona.nombre',
      },
      {
        Header: 'Apellido',
        accessor: 'persona.apellido',
      },
      {
        Header: 'DNI/CIUT',
        accessor: 'persona.dni',
      },
      {
        Header: 'Email',
        accessor: 'persona.email',
      },
      {
        Header: 'Teléfono',
        accessor: 'persona.telefono',
      },
      {
        Header: 'Acciones',
        accessor: 'acciones',
        disableSortBy: true,
        Cell: ({ row }) => (
          <>
            {/* Botón Editar */}
            <CustomButton
              variant="warning"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedClient(row.original);
                setShowEditModal(true);
              }}
              aria-label={`Editar Cliente ${row.original.id}`}
              className="me-2"
              disabled={!hasPermission('clientes.update')}
            >
              <FaEdit />
            </CustomButton>

            {/* Botón Eliminar */}
            <CustomButton
              variant="danger"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(row.original.id);
              }}
              aria-label={`Eliminar Cliente ${row.original.id}`}
              disabled={!hasPermission('clientes.destroy')}
            >
              <FaTrash />
            </CustomButton>
          </>
        ),
      },
    ],
    [onDelete, hasPermission]
  );

  /**
   * Configurar React Table con ordenamiento y paginación.
   */
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data: filteredClientes,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useGlobalFilter, 
    useSortBy,
    usePagination
  );

  // Manejar el cambio en el término de búsqueda para React Table
  useEffect(() => {
    setGlobalFilter(searchTerm || undefined);
  }, [searchTerm, setGlobalFilter]);

  /**
   * Agregar nuevo cliente
   */
  const handleAddClient = async (newClient) => {
    try {
      await customFetch('/clientes', 'POST', newClient);
      await fetchClientes();
      setShowAddModal(false);
      Swal.fire('Éxito', 'Cliente agregado exitosamente.', 'success');
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al agregar el cliente.', 'error');
      console.error('Error al agregar cliente:', error);
    }
  };

  /**
   * Editar cliente existente
   */
  const handleEditClient = async (updatedClient) => {
    try {
      await customFetch(`/clientes/${updatedClient.id}`, 'PUT', updatedClient);
      await fetchClientes();
      setShowEditModal(false);
      Swal.fire('Éxito', 'Cliente modificado exitosamente.', 'success');
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al modificar el cliente.', 'error');
      console.error('Error al modificar cliente:', error);
    }
  };

  /**
   * Manejar clic en la fila => detalle del cliente
   */
  const handleRowClick = (clienteId) => {
    if (!hasPermission('clientes.show')) {
      navigate('/unauthorized');
      return;
    }
    navigate(`/facturacion/clientes/${clienteId}`);
  };

  /**
   * Obtener ícono de ordenamiento
   */
  const getSortIcon = (column) => {
    if (!column.canSort) return null;
    if (column.isSorted) {
      return column.isSortedDesc ? <FaSortDown /> : <FaSortUp />;
    }
    return <FaSort />;
  };

  return (
    <div className="table-responsive mt-2 clientes-section">
      {/* Migas de Pan */}
      <Breadcrumb>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item href="/facturacion">Facturación</Breadcrumb.Item>
        <Breadcrumb.Item active>Gestión de Clientes</Breadcrumb.Item>
      </Breadcrumb>

      {/* Título */}
      <h3 className="section-title">Gestión de Clientes</h3>

      {/* Campo de Búsqueda */}
      <Form.Control
        type="text"
        placeholder="Buscar por nombre o DNI/CIUT"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-3 search-input"
        aria-label="Buscar Cliente"
      />

      {/* Botón Agregar */}
      <CustomButton
        onClick={() => setShowAddModal(true)}
        className="mb-3"
        aria-label="Agregar Cliente"
        disabled={!hasPermission('clientes.store')}
      >
        <FaPlus className="me-2" />
        Agregar Cliente
      </CustomButton>

      {cargando ? (
        <Loading />
      ) : (
        <>
          <Table {...getTableProps()} striped bordered hover className="custom-table">
            <thead>
              {headerGroups.map((headerGroup) => {
                const { key: headerGroupKey, ...headerGroupProps } =
                  headerGroup.getHeaderGroupProps();
                return (
                  <tr key={headerGroupKey} {...headerGroupProps}>
                    {headerGroup.headers.map((column) => {
                      const { key: columnKey, ...columnProps } =
                        column.getHeaderProps(column.getSortByToggleProps());
                      return (
                        <th
                          key={columnKey}
                          {...columnProps}
                          style={{ cursor: column.canSort ? 'pointer' : 'default' }}
                        >
                          {column.render('Header')}
                          {getSortIcon(column)}
                        </th>
                      );
                    })}
                  </tr>
                );
              })}
            </thead>
            <tbody {...getTableBodyProps()}>
              {page.length > 0 ? (
                page.map((row) => {
                  prepareRow(row);
                  const { key: rowKey, ...rowProps } = row.getRowProps();
                  return (
                    <tr
                      key={rowKey}
                      {...rowProps}
                      onClick={() => handleRowClick(row.original.id)}
                      style={{ cursor: 'pointer' }}
                      aria-label={`Detalles del Cliente ${row.original.id}`}
                    >
                      {row.cells.map((cell) => {
                        const { key: cellKey, ...cellProps } = cell.getCellProps();
                        return (
                          <td key={cellKey} {...cellProps}>
                            {cell.render('Cell')}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No se encontraron clientes.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Paginación */}
          <div className="pagination d-flex justify-content-between align-items-center">
            <div>
              <Button
                onClick={() => gotoPage(0)}
                disabled={!canPreviousPage}
                className="me-2"
              >
                {'<<'}
              </Button>
              <Button
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
                className="me-2"
              >
                {'<'}
              </Button>
              <Button
                onClick={() => nextPage()}
                disabled={!canNextPage}
                className="me-2"
              >
                {'>'}
              </Button>
              <Button
                onClick={() => gotoPage(pageCount - 1)}
                disabled={!canNextPage}
              >
                {'>>'}
              </Button>
            </div>
            <span>
              Página <strong>{pageIndex + 1} de {pageOptions.length}</strong>
            </span>
            <span>
              | Ir a la página:{' '}
              <input
                type="number"
                defaultValue={pageIndex + 1}
                onChange={(e) => {
                  const pageNumber = e.target.value
                    ? Number(e.target.value) - 1
                    : 0;
                  gotoPage(pageNumber);
                }}
                style={{ width: '100px' }}
              />
            </span>
            <Form.Select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              style={{ width: '150px' }}
            >
              {[10, 20, 30, 40, 50].map((size) => (
                <option key={size} value={size}>
                  Mostrar {size}
                </option>
              ))}
            </Form.Select>
          </div>
        </>
      )}

      {/* Modal Agregar Cliente */}
      <NewClientModal
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
        handleSubmit={handleAddClient}
      />

      {/* Modal Editar Cliente */}
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
