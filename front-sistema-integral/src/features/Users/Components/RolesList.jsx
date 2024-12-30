import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { Form } from 'react-bootstrap';
import Swal from 'sweetalert2';
import customFetch from '../../../context/CustomFetch.js';
import Loading from '../../../components/common/loading/Loading.jsx';
import CustomButton from '../../../components/common/botons/CustomButton.jsx';
import { UsersContext } from '../../../context/UsersContext.jsx'; // Importar el contexto

export default function RolesList({ userId, onClose }) {
  const [roles, setRoles] = useState([]);
  const [cargandoRoles, setCargandoRoles] = useState(true);
  const [selectedRolesIds, setSelectedRolesIds] = useState([]);
  const [cargandoAsignacion, setCargandoAsignacion] = useState(false);

  // Acceder al contexto para poder actualizar los usuarios
  const { fetchUsuarios } = useContext(UsersContext);

  const fetchRoles = useCallback(async () => {
    setCargandoRoles(true);
    try {
      const data = await customFetch('/roles', 'GET');
      console.log('Datos de roles:', data);

      if (
        Array.isArray(data) &&
        data.length === 2 &&
        Array.isArray(data[0]) &&
        typeof data[1] === 'number'
      ) {
        const [fetchedRoles, status] = data;
        if (status === 200 && Array.isArray(fetchedRoles)) {
          setRoles(fetchedRoles);
        } else {
          console.error('Error: Respuesta inválida para roles:', fetchedRoles, status);
          Swal.fire('Error', 'Error al obtener roles.', 'error');
          setRoles([]);
        }
      } else {
        console.error('Error: Respuesta de roles no es [rolesArray, status]:', data);
        Swal.fire('Error', 'Error al obtener roles.', 'error');
        setRoles([]);
      }
    } catch (error) {
      Swal.fire('Error', 'Error al obtener roles.', 'error');
      console.error('Error al obtener roles:', error);
      setRoles([]);
    } finally {
      setCargandoRoles(false);
    }
  }, []);

  const fetchUserRoles = useCallback(async () => {
    try {
      const userData = await customFetch(`/users/${userId}`, 'GET');
      console.log('Datos del usuario:', userData);
      
      if (userData && typeof userData === 'object' && Array.isArray(userData.roles)) {
        const userRoleIds = userData.roles.map(role => role.id);
        setSelectedRolesIds(userRoleIds);
      } else {
        console.error('Error: El usuario no contiene roles en el formato esperado', userData);
        Swal.fire('Error', 'Error al obtener roles del usuario.', 'error');
        setSelectedRolesIds([]);
      }
    } catch (error) {
      Swal.fire('Error', 'Error al obtener roles del usuario.', 'error');
      console.error('Error al obtener roles del usuario:', error);
      setSelectedRolesIds([]);
    }
  }, [userId]);

  useEffect(() => {
    fetchRoles();
    fetchUserRoles();
  }, [fetchRoles, fetchUserRoles]);

  const handleCheckboxChange = useCallback((roleId) => {
    setSelectedRolesIds((prevSelected) => {
      if (prevSelected.includes(roleId)) {
        return prevSelected.filter((id) => id !== roleId);
      } else {
        return [...prevSelected, roleId];
      }
    });
  }, []);

  const handleSaveChanges = useCallback(async () => {
    setCargandoAsignacion(true);
    try {
      const data = await customFetch(`/users/${userId}/roles-sinc`, 'POST', {
        id: userId,
        roles: selectedRolesIds,
      });
      console.log('Respuesta al actualizar roles:', data);
      // data es un objeto de usuario con los roles actualizados
      if (data && typeof data === 'object' && Array.isArray(data.roles)) {
        Swal.fire('Éxito', 'Roles actualizados exitosamente.', 'success');
        await fetchUserRoles(); // Refresca los roles del usuario
        await fetchUsuarios(); // Refresca la lista global de usuarios
      } else {
        console.error('Error: La respuesta no es un objeto de usuario con roles:', data);
        Swal.fire('Error', 'No se pudieron actualizar los roles.', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'No se pudieron actualizar los roles.', 'error');
      console.error('Error al actualizar roles del usuario:', error);
    } finally {
      setCargandoAsignacion(false);
    }
  }, [userId, selectedRolesIds, fetchUserRoles, fetchUsuarios]);

  const memoizedRoles = useMemo(() => roles, [roles]);

  if (cargandoRoles) {
    return <Loading />;
  }

  if (!memoizedRoles || memoizedRoles.length === 0) {
    return <p>No hay roles disponibles para asignar.</p>;
  }

  return (
    <div className="roles-list">
      <Form>
        {memoizedRoles.map((role) => (
          <Form.Check
            key={role.id}
            type="checkbox"
            id={`role-${role.id}`}
            label={role.name}
            checked={selectedRolesIds.includes(role.id)}
            onChange={() => handleCheckboxChange(role.id)}
          />
        ))}
        <div className="d-flex gap-2 mt-3">
          <CustomButton
            onClick={handleSaveChanges}
            disabled={cargandoAsignacion}
            aria-label="Guardar Cambios de Roles"
          >
            {cargandoAsignacion ? 'Guardando...' : 'Guardar Cambios'}
          </CustomButton>
          <CustomButton
            variant="danger"
            onClick={onClose}
            aria-label="Cerrar Asignación de Roles"
          >
            Cerrar
          </CustomButton>
        </div>
      </Form>
    </div>
  );
}
