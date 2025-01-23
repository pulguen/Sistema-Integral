import React, { useState, useContext, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Hook para navegación
import { Form, Breadcrumb, Button, Table } from 'react-bootstrap';
import Swal from 'sweetalert2';
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSort,
  FaSortUp,
  FaSortDown,
} from 'react-icons/fa';
import {
  useTable,
  useSortBy,
  usePagination,
  useGlobalFilter,
} from 'react-table';

import NewUserModal from '../../../components/common/modals/NewUserModal.jsx';
import EditUserModal from '../../../components/common/modals/EditUserModal.jsx';
import CustomButton from '../../../components/common/botons/CustomButton.jsx';
import Loading from '../../../components/common/loading/Loading.jsx';

import { UsersContext } from '../../../context/UsersContext.jsx';
import { AuthContext } from '../../../context/AuthContext.jsx';

export default function Usuarios() {
  const navigate = useNavigate(); // Hook para navegación
  const {
    usuarios,
    cargandoUsuarios,
    deleteUsuario,
    addUsuario,
    editUsuario,
    fetchUsuarios,
  } = useContext(UsersContext);

  const { user } = useContext(AuthContext);

  const hasPermission = useCallback(
    (permission) => user?.permissions?.includes(permission),
    [user?.permissions]
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [localUsuarios, setLocalUsuarios] = useState([]);

  useEffect(() => {
    setLocalUsuarios(usuarios);
  }, [usuarios]);

  const filteredUsuarios = useMemo(() => {
    if (!searchTerm) return localUsuarios;
    return localUsuarios.filter((usuario) => {
      const nombreCompleto = `${usuario.name}`.toLowerCase();
      const email = usuario.email?.toLowerCase() || '';
      return (
        nombreCompleto.includes(searchTerm.toLowerCase()) ||
        email.includes(searchTerm.toLowerCase())
      );
    });
  }, [localUsuarios, searchTerm]);

  const handleDeleteUser = useCallback(
    async (id) => {
      try {
        const result = await Swal.fire({
          title: '¿Estás seguro?',
          text: 'Esta acción no se puede deshacer. ¿Deseas eliminar este usuario?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar',
        });

        if (result.isConfirmed) {
          await deleteUsuario(id);
          await fetchUsuarios();
          Swal.fire('Eliminado', 'El usuario ha sido eliminado.', 'success');
        }
      } catch (error) {
        Swal.fire('Error', 'Hubo un problema al eliminar el usuario.', 'error');
      }
    },
    [deleteUsuario, fetchUsuarios]
  );

  const handleRowClick = (usuarioId) => {
    navigate(`/usuarios/${usuarioId}`); // Redirige al detalle del usuario
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleEditUser = async (updatedUser) => {
    try {
      await editUsuario(updatedUser);
      await fetchUsuarios();
      Swal.fire('Éxito', 'Los cambios se han guardado exitosamente.', 'success');
      setShowEditModal(false);
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al editar el usuario.', 'error');
    }
  };

  const handleAddUser = async (newUser) => {
    try {
      await addUsuario(newUser);
      setShowAddModal(false);
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al agregar el usuario.', 'error');
    }
  };

  const columnsUsuarios = useMemo(
    () => [
      { Header: 'Nombre', accessor: 'name' },
      { Header: 'Email', accessor: 'email' },
      {
        Header: 'Roles',
        accessor: 'roles',
        Cell: ({ value }) =>
          Array.isArray(value) && value.length > 0
            ? value.map((role) => role.name).join(', ')
            : 'Sin roles',
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
                e.stopPropagation(); // Detiene la propagación del clic a la fila
                handleSelectUser(row.original);
              }}
              aria-label={`Editar Usuario ${row.original.id}`}
              className="me-2"
              disabled={!hasPermission('users.update')}
            >
              <FaEdit />
            </CustomButton>
            <CustomButton
              variant="danger"
              size="sm"
              onClick={(e) => {
                e.stopPropagation(); // Detiene la propagación del clic a la fila
                handleDeleteUser(row.original.id);
              }}
              aria-label={`Eliminar Usuario ${row.original.id}`}
              disabled={!hasPermission('users.destroy')}
            >
              <FaTrash />
            </CustomButton>
          </>
        ),
      },
    ],
    [handleDeleteUser, hasPermission]
  );

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
      columns: columnsUsuarios,
      data: filteredUsuarios,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  useEffect(() => {
    setGlobalFilter(searchTerm || undefined);
  }, [searchTerm, setGlobalFilter]);

  return (
    <div className="table-responsive mt-2 usuarios-section">
      <Breadcrumb>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item active>Gestión de Usuarios</Breadcrumb.Item>
      </Breadcrumb>

      <h3 className="section-title">Gestión de Usuarios</h3>

      <Form.Control
        type="text"
        placeholder="Buscar por nombre o email"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-3 search-input"
        autoComplete="off"
      />

      <CustomButton
        onClick={() => setShowAddModal(true)}
        className="mb-3"
        disabled={!hasPermission('users.store')}
      >
        <FaPlus className="me-2" />
        Agregar Usuario
      </CustomButton>

      {cargandoUsuarios ? (
        <Loading />
      ) : (
        <Table {...getTableProps()} striped bordered hover>
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    key={column.id}
                    style={{ cursor: column.canSort ? 'pointer' : 'default' }}
                  >
                    {column.render('Header')}
                    {column.canSort && (
                      column.isSorted ? (
                        column.isSortedDesc ? (
                          <FaSortDown className="ms-2" />
                        ) : (
                          <FaSortUp className="ms-2" />
                        )
                      ) : (
                        <FaSort className="ms-2" />
                      )
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row) => {
              prepareRow(row);
              return (
                <tr
                  {...row.getRowProps()}
                  key={row.original.id || `row-${row.index}`} // Usa un `id` único o un índice de respaldo
                  onClick={() => handleRowClick(row.original.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {row.cells.map((cell) => (
                    <td
                      {...cell.getCellProps()}
                      key={`cell-${row.index}-${cell.column.id}`} // Clave única para cada celda
                    >
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>

        </Table>
      )}

      {/* Controles de paginación */}
      <div className="pagination d-flex justify-content-between align-items-center mt-3">
        <div>
          <Button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
            {'<<'}
          </Button>
          <Button onClick={() => previousPage()} disabled={!canPreviousPage} className="ms-2">
            {'<'}
          </Button>
          <Button onClick={() => nextPage()} disabled={!canNextPage} className="ms-2">
            {'>'}
          </Button>
          <Button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage} className="ms-2">
            {'>>'}
          </Button>
        </div>
        <span>
          Página{' '}
          <strong>
            {pageIndex + 1} de {pageOptions.length}
          </strong>
        </span>
        <Form.Select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="ms-2"
          style={{ width: '150px' }}
        >
          {[10, 20, 30, 40, 50].map((size) => (
            <option key={size} value={size}>
              Mostrar {size}
            </option>
          ))}
        </Form.Select>
      </div>

      {/* Modal para agregar usuario */}
      <NewUserModal
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
        handleSubmit={handleAddUser}
      />

      {/* Modal para editar usuario */}
      {selectedUser && (
        <EditUserModal
          show={showEditModal}
          handleClose={() => setShowEditModal(false)}
          handleSubmit={handleEditUser}
          userData={selectedUser}
        />
      )}
    </div>
  );
}
