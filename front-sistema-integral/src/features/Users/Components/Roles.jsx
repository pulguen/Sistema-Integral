// src/features/Users/Components/Roles.jsx

import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { Form, Breadcrumb, Table, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Loading from '../../../components/common/loading/Loading.jsx';
import RolesList from './RolesList.jsx';
import NewRoleModal from '../../../components/common/modals/NewRoleModal.jsx';
import CustomButton from '../../../components/common/botons/CustomButton.jsx';
import { UsersContext } from '../../../context/UsersContext.jsx';
import EditRoleModal from '../../../components/common/modals/EditRoleModal.jsx';
import UsersByRoleList from './UsersByRoleList.jsx';

// 1. Importar AuthContext
import { AuthContext } from '../../../context/AuthContext.jsx';

export default function Roles() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState(null);

  // Para el dropdown "Usuarios por Rol"
  const [selectedRole, setSelectedRole] = useState(null);

  // 2. Extraer del contexto de usuarios
  const {
    usuarios,
    cargandoUsuarios,
    roles,
    cargandoRoles,
    fetchUsuarios,
    deleteRole,
    addRole,
  } = useContext(UsersContext);

  // 3. Extraer user del AuthContext y crear la función hasPermission
  const { user } = useContext(AuthContext);

  const hasPermission = useCallback(
    (permission) => user?.permissions?.includes(permission),
    [user?.permissions]
  );

  // Filtrar usuarios según el término de búsqueda
  const memoizedFilteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return usuarios.filter((usuario) => {
      const nombre = usuario.name?.toLowerCase() || '';
      const email = usuario.email?.toLowerCase() || '';
      return nombre.includes(term) || email.includes(term);
    });
  }, [searchTerm, usuarios]);

  // Actualizar selectedUser con datos más recientes cuando cambie la lista de usuarios
  useEffect(() => {
    if (selectedUser) {
      const updatedUser = usuarios.find((u) => u.id === selectedUser.id);
      if (updatedUser) {
        setSelectedUser(updatedUser);
      } else {
        // Si el usuario no existe (por ejemplo, fue eliminado), deseleccionarlo
        setSelectedUser(null);
      }
    }
  }, [usuarios, selectedUser]);

  const handleSelectUser = useCallback((user) => {
    setSelectedUser(user);
  }, []);

  // Crear rol
  const handleAddRole = useCallback(
    async (newRole) => {
      try {
        await addRole(newRole);
        Swal.fire('Éxito', 'Rol agregado exitosamente.', 'success');
        setShowAddRoleModal(false);
        await fetchUsuarios(); // Refresca la lista de usuarios
      } catch (error) {
        Swal.fire('Error', 'Hubo un problema al agregar el rol.', 'error');
        console.error('Error al agregar rol:', error);
      }
    },
    [addRole, fetchUsuarios]
  );

  // Editar rol (abrir modal con datos)
  const handleEditRoleClick = (role) => {
    setRoleToEdit(role);
    setShowEditRoleModal(true);
  };

  // Eliminar rol
  const handleDeleteRole = async (roleId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await deleteRole(roleId);
        // Si deleteRole llama internamente a fetchUsuarios(),
        // se actualizarán los datos y useEffect sincronizará automáticamente.
      } catch (error) {
        console.error('Error al eliminar rol:', error);
      }
    }
  };

  return (
    <div className="mt-2 usuarios-con-roles-section">
      <Breadcrumb>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item href="/usuarios">Gestión de Usuarios</Breadcrumb.Item>
        <Breadcrumb.Item active>Roles</Breadcrumb.Item>
      </Breadcrumb>

      <h3 className="section-title">Gestión de Usuarios y Roles</h3>

      <Row>
        {/* Columna Izquierda: CRUD de Roles Existentes */}
        <Col xs={12} lg={6}>
          <h5 className="mt-3 mt-lg-0">Roles Existentes</h5>
          {cargandoRoles ? (
            <Loading />
          ) : roles && roles.length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id}>
                    <td>{role.name}</td>
                    <td>{role.description || 'Sin descripción'}</td>
                    <td>
                      <CustomButton
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEditRoleClick(role)}
                        aria-label={`Editar Rol ${role.name}`}
                        disabled={!hasPermission('roles.update')} // <--- PERMISO
                      >
                        <FaEdit />
                      </CustomButton>
                      <CustomButton
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteRole(role.id)}
                        aria-label={`Eliminar Rol ${role.name}`}
                        disabled={!hasPermission('roles.destroy')} // <--- PERMISO
                      >
                        <FaTrash />
                      </CustomButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No hay roles disponibles.</p>
          )}
          <CustomButton
            onClick={() => setShowAddRoleModal(true)}
            className="mb-3"
            aria-label="Agregar Rol"
            disabled={!hasPermission('roles.store')} // <--- PERMISO
          >
            <FaPlus className="me-2" />
            Crear Rol
          </CustomButton>
        </Col>

        {/* Columna Derecha: Asignación de roles a un usuario y usuarios por rol */}
        <Col xs={12} lg={6}>
          <h5 className="mt-3 mt-lg-0">Asignación de Roles a un Usuario</h5>
          <Form.Control
            type="text"
            placeholder="Buscar por nombre o email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-3 search-input"
            aria-label="Buscar Usuario"
            autoComplete="off"
          />

          {cargandoUsuarios ? (
            <Loading />
          ) : (
            <>
              {searchTerm && memoizedFilteredUsers.length > 0 ? (
                <ul className="list-unstyled">
                  {memoizedFilteredUsers.map((usuario) => (
                    <li
                      key={usuario.id}
                      style={{ cursor: 'pointer', marginBottom: '0.5rem' }}
                      onClick={() => handleSelectUser(usuario)}
                      aria-label={`Seleccionar usuario ${usuario.name}`}
                    >
                      {usuario.name} ({usuario.email})
                    </li>
                  ))}
                </ul>
              ) : (
                // Si hay término de búsqueda pero no resultados
                searchTerm && <p>No se encontraron usuarios.</p>
              )}

              {selectedUser && (
                <div style={{ marginTop: '2rem' }}>
                  <h5>Roles de {selectedUser.name}:</h5>
                  <RolesList
                    userId={selectedUser.id}
                    // Al cerrar, limpiamos la selección y el input
                    onClose={() => {
                      setSelectedUser(null);
                      setSearchTerm(''); // <--- Limpiar el input de búsqueda
                    }}
                  />
                </div>
              )}
            </>
          )}

          <h5 className="mt-4">Usuarios por Rol</h5>
          <Form.Select
            value={selectedRole ? selectedRole.id : ''}
            onChange={(e) => {
              const selectedId = e.target.value;
              if (!selectedId) {
                setSelectedRole(null);
              } else {
                const role = roles.find((r) => r.id === parseInt(selectedId));
                setSelectedRole(role || null);
              }
            }}
            className="mb-3"
            aria-label="Seleccionar Rol"
          >
            <option value="">Seleccionar rol...</option>
            {roles &&
              roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
          </Form.Select>

          {selectedRole && (
            <div style={{ marginTop: '2rem' }}>
              <UsersByRoleList
                roleId={selectedRole.id}
                onClose={() => setSelectedRole(null)}
              />
            </div>
          )}
        </Col>
      </Row>

      {/* Modal para crear Rol */}
      <NewRoleModal
        show={showAddRoleModal}
        handleClose={() => setShowAddRoleModal(false)}
        handleSubmit={handleAddRole}
      />

      {/* Modal para editar Rol */}
      {roleToEdit && (
        <EditRoleModal
          show={showEditRoleModal}
          handleClose={() => setShowEditRoleModal(false)}
          roleData={roleToEdit}
        />
      )}
    </div>
  );
}
