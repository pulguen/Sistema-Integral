import React, { useState, useContext, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Breadcrumb } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import NewUserModal from '../../../components/common/modals/NewUserModal.jsx';
import EditUserModal from '../../../components/common/modals/EditUserModal.jsx';
import CustomButton from '../../../components/common/botons/CustomButton.jsx';
import Loading from '../../../components/common/loading/Loading.jsx';
import { UsersContext } from '../../../context/UsersContext.jsx';
import { AuthContext } from '../../../context/AuthContext.jsx';
import CommonTable from '../../../components/common/table/table.jsx';

export default function Usuarios() {
  const navigate = useNavigate();
  const { usuarios, cargandoUsuarios, deleteUsuario, addUsuario, editUsuario, fetchUsuarios } = useContext(UsersContext);
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

  // Filtrar usuarios según searchTerm
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

  // Función para eliminar usuario
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

  // Función para navegar al detalle del usuario
  const handleRowClick = (usuarioId) => {
    navigate(`/usuarios/${usuarioId}`);
  };

  // Abrir modal de edición
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  // Editar usuario
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

  // Agregar usuario
  const handleAddUser = async (newUser) => {
    try {
      await addUsuario(newUser);
      setShowAddModal(false);
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al agregar el usuario.', 'error');
    }
  };

  // Definir columnas para la tabla
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
                e.stopPropagation();
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
                e.stopPropagation();
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
        <CommonTable
          columns={columnsUsuarios}
          data={filteredUsuarios}
          onRowClick={(user) => handleRowClick(user.id)}
        />
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
          handleSubmit={handleEditUser}
          userData={selectedUser}
        />
      )}
    </div>
  );
}
