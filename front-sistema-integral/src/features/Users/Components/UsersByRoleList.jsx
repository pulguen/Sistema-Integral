// src/features/Users/Components/UsersByRoleList.jsx

import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Form } from 'react-bootstrap';
import Swal from 'sweetalert2';
import Loading from '../../../components/common/loading/Loading.jsx';
import CustomButton from '../../../components/common/botons/CustomButton.jsx';
import { UsersContext } from '../../../context/UsersContext.jsx';

// 1. Importar el AuthContext
import { AuthContext } from '../../../context/AuthContext.jsx';

export default function UsersByRoleList({ roleId, onClose }) {
  const { usuarios, assignRolesToUser, fetchUsuarios } = useContext(UsersContext);

  const [usuariosConRol, setUsuariosConRol] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [selectedUsersIds, setSelectedUsersIds] = useState([]);

  // 2. Extraer user del AuthContext y definir hasPermission
  const { user } = useContext(AuthContext);

  const hasPermission = useCallback(
    (permission) => user?.permissions?.includes(permission),
    [user?.permissions]
  );

  useEffect(() => {
    setCargando(true);

    // Filtrar usuarios que tienen el rol actual
    const usersWithRole = usuarios.filter((u) => {
      if (Array.isArray(u.roles)) {
        return u.roles.some((r) => r.id === parseInt(roleId));
      }
      return false;
    });

    setUsuariosConRol(usersWithRole);

    // Marcar como seleccionados todos los que ya tienen el rol
    setSelectedUsersIds(usersWithRole.map((u) => u.id));
    setCargando(false);
  }, [usuarios, roleId]);

  const handleCheckboxChange = (userId) => {
    setSelectedUsersIds((prevSelected) => {
      if (prevSelected.includes(userId)) {
        return prevSelected.filter((id) => id !== userId);
      } else {
        return [...prevSelected, userId];
      }
    });
  };

  const handleSaveChanges = async () => {
    try {
      let anyChange = false;

      for (const user of usuariosConRol) {
        // Roles actuales del usuario
        const userData = usuarios.find((u) => u.id === user.id);

        if (userData && Array.isArray(userData.roles)) {
          const userRoleIds = userData.roles.map((r) => r.id);
          const hasRole = userRoleIds.includes(parseInt(roleId));
          const shouldHaveRole = selectedUsersIds.includes(user.id);

          if (hasRole && !shouldHaveRole) {
            // Quitar el rol
            const newRoles = userRoleIds.filter((rId) => rId !== parseInt(roleId));
            await assignRolesToUser(user.id, newRoles);
            anyChange = true;
          } else if (!hasRole && shouldHaveRole) {
            // Agregar el rol
            const newRoles = [...userRoleIds, parseInt(roleId)];
            await assignRolesToUser(user.id, newRoles);
            anyChange = true;
          }
        }
      }

      if (anyChange) {
        Swal.fire('Éxito', 'Roles actualizados exitosamente.', 'success');
      } else {
        Swal.fire('Sin cambios', 'No hubo cambios en los roles.', 'info');
      }

      // Actualizar usuarios globales
      await fetchUsuarios();

      // Volver a filtrar usuarios con el rol
      const updatedUsersWithRole = usuarios.filter((u) => {
        if (Array.isArray(u.roles)) {
          return u.roles.some((r) => r.id === parseInt(roleId));
        }
        return false;
      });
      setUsuariosConRol(updatedUsersWithRole);
      setSelectedUsersIds(updatedUsersWithRole.map((u) => u.id));
    } catch (error) {
      Swal.fire('Error', 'No se pudieron actualizar los roles.', 'error');
      console.error('Error al actualizar roles del usuario:', error);
    }
  };

  if (cargando) {
    return <Loading />;
  }

  if (!usuariosConRol || usuariosConRol.length === 0) {
    return (
      <div className="mt-3">
        <p>No hay usuarios con este rol.</p>
        <CustomButton variant="danger" onClick={onClose}>
          Cerrar
        </CustomButton>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <h5>Usuarios con este Rol:</h5>
      <Form>
        {usuariosConRol.map((user) => (
          <Form.Check
            key={user.id}
            type="checkbox"
            id={`user-${user.id}`}
            label={`${user.name} (${user.email})`}
            checked={selectedUsersIds.includes(user.id)}
            onChange={() => handleCheckboxChange(user.id)}
          />
        ))}
        <div className="d-flex gap-2 mt-3">
          {/* 3. Deshabilitar botón si no tiene el permiso users.sync-roles */}
          <CustomButton
            variant="primary"
            onClick={handleSaveChanges}
            disabled={!hasPermission('users.sync-roles')}
          >
            Guardar Cambios
          </CustomButton>
          <CustomButton variant="danger" onClick={onClose}>
            Cerrar
          </CustomButton>
        </div>
      </Form>
    </div>
  );
}
