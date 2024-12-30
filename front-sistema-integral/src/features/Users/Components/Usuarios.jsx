// src/features/Users/Components/Usuarios.jsx

import React, { useState, useContext, useMemo, useCallback, useEffect } from 'react';
import { Form, Breadcrumb, Button, Table } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { FaEdit, FaTrash, FaPlus, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import NewUserModal from '../../../components/common/modals/NewUserModal.jsx';
import EditUserModal from '../../../components/common/modals/EditUserModal.jsx';
import CustomButton from '../../../components/common/botons/CustomButton.jsx';
import Loading from '../../../components/common/loading/Loading.jsx';
import { UsersContext } from '../../../context/UsersContext.jsx';
import { useTable, useSortBy, usePagination, useGlobalFilter } from 'react-table';

export default function Usuarios() {
  const {
    usuarios,
    cargandoUsuarios,
    deleteUsuario,
    addUsuario,
  } = useContext(UsersContext);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsuarios = useMemo(() => {
    if (!searchTerm) return usuarios;
    return usuarios.filter((usuario) => {
      const nombreCompleto = `${usuario.name}`.toLowerCase();
      const email = usuario.email?.toLowerCase() || '';
      return (
        nombreCompleto.includes(searchTerm.toLowerCase()) ||
        email.includes(searchTerm.toLowerCase())
      );
    });
  }, [usuarios, searchTerm]);

  const handleDeleteUser = useCallback(async (id) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción no se puede deshacer. ¿Deseas eliminar este usuario?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      });

      if (result.isConfirmed) {
        await deleteUsuario(id);
        Swal.fire('Eliminado!', 'El usuario ha sido eliminado.', 'success');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al eliminar el usuario.', 'error');
      console.error('Error al eliminar usuario:', error);
    }
  }, [deleteUsuario]);

  const handleSelectUser = useCallback((user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  }, []);

  const columnsUsuarios = useMemo(
    () => [
      {
        Header: 'Nombre',
        accessor: 'name',
      },
      {
        Header: 'Email',
        accessor: 'email',
      },
      {
        Header: 'Roles',
        accessor: 'roles',
        Cell: ({ value }) =>
          Array.isArray(value) && value.length > 0
            ? value.map((role) => role.name).join(', ')
            : 'Sin roles',
      },
      {
        Header: 'Permisos',
        accessor: 'permissions',
        Cell: ({ value }) =>
          Array.isArray(value) && value.length > 0
            ? value.join(', ')
            : 'Sin permisos',
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
              onClick={() => handleSelectUser(row.original)}
              aria-label={`Editar Usuario ${row.original.id}`}
              className="me-2"
            >
              <FaEdit />
            </CustomButton>
            <CustomButton
              variant="danger"
              size="sm"
              onClick={() => handleDeleteUser(row.original.id)}
              aria-label={`Eliminar Usuario ${row.original.id}`}
            >
              <FaTrash />
            </CustomButton>
          </>
        ),
      },
    ],
    [handleDeleteUser, handleSelectUser]
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

  const handleAddUser = useCallback(async (newUser) => {
    try {
      await addUsuario(newUser);
      Swal.fire('Éxito', 'Usuario agregado exitosamente.', 'success');
      setShowAddModal(false);
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al agregar el usuario.', 'error');
      console.error('Error al agregar usuario:', error);
    }
  }, [addUsuario]);

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
        aria-label="Buscar Usuario"
        autoComplete="off"
      />

      <CustomButton
        onClick={() => setShowAddModal(true)}
        className="mb-3"
        aria-label="Agregar Usuario"
      >
        <FaPlus className="me-2" />
        Agregar Usuario
      </CustomButton>

      {cargandoUsuarios ? (
        <Loading />
      ) : (
        <Table {...getTableProps()} striped bordered hover className="custom-table">
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    key={column.id}
                    style={{ cursor: column.canSort ? 'pointer' : 'default' }}
                    aria-label={`Ordenar por ${column.render('Header')}`}
                  >
                    {column.render('Header')}
                    {column.canSort ? (
                      column.isSorted ? (
                        column.isSortedDesc ? (
                          <FaSortDown className="ms-2" />
                        ) : (
                          <FaSortUp className="ms-2" />
                        )
                      ) : (
                        <FaSort className="ms-2" />
                      )
                    ) : null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.length > 0 ? (
              page.map((row) => {
                prepareRow(row);
                return (
                  <tr
                    {...row.getRowProps()}
                    key={row.id}
                    aria-label={`Detalles del Usuario ${row.original.id}`}
                  >
                    {row.cells.map((cell) => (
                      <td {...cell.getCellProps()} key={cell.column.id}>
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No se encontraron usuarios.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      {!cargandoUsuarios && usuarios.length > 0 && (
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
      )}

      <NewUserModal
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
        handleSubmit={handleAddUser}
      />

      {selectedUser && (
        <EditUserModal
          show={showEditModal}
          handleClose={() => setShowEditModal(false)}
          userData={selectedUser}
        />
      )}
    </div>
  );
}
