// src/features/facturacion/components/Clientes/Clientes.jsx
import React, { useState, useEffect, useCallback } from 'react';
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

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  /**
   * Función para obtener clientes desde la API.
   */
  const fetchClientes = useCallback(async () => {
    try {
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
   * Función para eliminar un cliente.
   * @param {number} id - ID del cliente a eliminar.
   */
  const onDelete = useCallback(
    async (id) => {
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
   * Filtrar clientes según el término de búsqueda.
   */
  const filteredClientes = React.useMemo(() => {
    if (!searchTerm) return clientes;
    return clientes.filter((cliente) => {
      const nombreCompleto = `${cliente.persona?.nombre} ${cliente.persona?.apellido}`.toLowerCase();
      const dni = cliente.persona?.dni?.toString() || '';
      return (
        nombreCompleto.includes(searchTerm.toLowerCase()) ||
        dni.includes(searchTerm)
      );
    });
  }, [clientes, searchTerm]);

  /**
   * Definir las columnas para React Table.
   * Se elimina la columna ID para que no se muestre en la tabla.
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
            <CustomButton
              variant="warning"
              size="sm"
              onClick={(e) => {
                e.stopPropagation(); // Evita que el clic en el botón active el evento de la fila
                setSelectedClient(row.original);
                setShowEditModal(true);
              }}
              aria-label={`Editar Cliente ${row.original.id}`}
              className="me-2"
            >
              <FaEdit />
            </CustomButton>
            <CustomButton
              variant="danger"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(row.original.id);
              }}
              aria-label={`Eliminar Cliente ${row.original.id}`}
            >
              <FaTrash />
            </CustomButton>
          </>
        ),
      },
    ],
    [onDelete]
  );

  /**
   * Configurar React Table con ordenamiento y paginación.
   */
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page, // En lugar de rows, usamos page para paginación
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
    useGlobalFilter, // Para el filtrado global
    useSortBy,
    usePagination
  );

  /**
   * Manejar el cambio en el término de búsqueda para React Table.
   */
  useEffect(() => {
    setGlobalFilter(searchTerm || undefined);
  }, [searchTerm, setGlobalFilter]);

  /**
   * Función para agregar un nuevo cliente.
   * @param {Object} newClient - Datos del nuevo cliente.
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
   * Función para editar un cliente existente.
   * @param {Object} updatedClient - Datos del cliente actualizado.
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
   * Función para manejar el clic en una fila y navegar a los detalles del cliente.
   * @param {number} clienteId - ID del cliente seleccionado.
   */
  const handleRowClick = (clienteId) => {
    navigate(`/facturacion/clientes/${clienteId}`);
  };

  /**
   * Función para obtener el ícono de ordenamiento correspondiente.
   * @param {Object} column - Columna actual.
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

      {/* Título de la Sección */}
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

      {/* Botón para Agregar Cliente */}
      <CustomButton
        onClick={() => setShowAddModal(true)}
        className="mb-3"
        aria-label="Agregar Cliente"
      >
        <FaPlus className="me-2" />
        Agregar Cliente
      </CustomButton>

      {/* Tabla de Clientes */}
      {cargando ? (
        <Loading />
      ) : (
        <>
          <Table {...getTableProps()} striped bordered hover className="custom-table">
            <thead>
              {headerGroups.map((headerGroup) => {
                // Extraer la propiedad 'key' y esparcir el resto de las props
                const { key: headerGroupKey, ...headerGroupProps } = headerGroup.getHeaderGroupProps();
                return (
                  <tr key={headerGroupKey} {...headerGroupProps}>
                    {headerGroup.headers.map((column) => {
                      // Extraer la propiedad 'key' y esparcir el resto de las props
                      const { key: columnKey, ...columnProps } = column.getHeaderProps(column.getSortByToggleProps());
                      return (
                        <th
                          key={columnKey}
                          {...columnProps}
                          style={{ cursor: column.canSort ? 'pointer' : 'default' }}
                          aria-label={`Ordenar por ${column.render('Header')}`}
                        >
                          {column.render('Header')}
                          {/* Añadir ícono de ordenamiento */}
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
                  // Extraer la propiedad 'key' y esparcir el resto de las props
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
                        // Extraer la propiedad 'key' y esparcir el resto de las props
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
                  {/* Ajustar colSpan a 6 porque ahora tenemos 6 columnas */}
                  <td colSpan="6" className="text-center">
                    No se encontraron clientes.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Controles de Paginación */}
          <div className="pagination d-flex justify-content-between align-items-center">
            <div>
              <Button
                onClick={() => gotoPage(0)}
                disabled={!canPreviousPage}
                className="me-2"
                aria-label="Ir a la primera página"
              >
                {'<<'}
              </Button>
              <Button
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
                className="me-2"
                aria-label="Ir a la página anterior"
              >
                {'<'}
              </Button>
              <Button
                onClick={() => nextPage()}
                disabled={!canNextPage}
                className="me-2"
                aria-label="Ir a la página siguiente"
              >
                {'>'}
              </Button>
              <Button
                onClick={() => gotoPage(pageCount - 1)}
                disabled={!canNextPage}
                aria-label="Ir a la última página"
              >
                {'>>'}
              </Button>
            </div>
            <span>
              Página{' '}
              <strong>
                {pageIndex + 1} de {pageOptions.length}
              </strong>{' '}
            </span>
            <span>
              | Ir a la página:{' '}
              <input
                type="number"
                defaultValue={pageIndex + 1}
                onChange={(e) => {
                  const pageNumber = e.target.value ? Number(e.target.value) - 1 : 0;
                  gotoPage(pageNumber);
                }}
                style={{ width: '100px' }}
                aria-label="Ir a la página"
              />
            </span>
            <Form.Select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
              }}
              aria-label="Seleccione el número de filas por página"
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

      {/* Modal para Agregar Nuevo Cliente */}
      <NewClientModal
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
        handleSubmit={handleAddClient}
      />

      {/* Modal para Editar Cliente Seleccionado */}
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
