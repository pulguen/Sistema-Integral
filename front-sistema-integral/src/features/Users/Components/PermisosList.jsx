import React, { useState, useContext } from 'react';
import { Form, Button, ListGroup } from 'react-bootstrap';
import Swal from 'sweetalert2';
import Loading from '../../../components/common/loading/Loading.jsx';
import { UsersContext } from '../../../context/UsersContext.jsx'; // Importamos el contexto
import customFetch from '../../../context/CustomFetch.js'; // Importación de customFetch

export default function PermisosList() {
  const { roles, cargandoRoles, permisos, cargandoPermisos, fetchRoles, fetchPermisos } = useContext(UsersContext);
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]); // Permisos seleccionados para sincronizar
  const [cargandoAsignacion, setCargandoAsignacion] = useState(false);
  const [cargandoPermisosRol, setCargandoPermisosRol] = useState(false);

  // Manejar la selección de un rol
  const handleRoleSelect = async (role) => {
    setSelectedRole(role);
    setCargandoPermisosRol(true);

    try {
      // Obtener los permisos actuales del rol desde la API `/roles/{id}`
      const data = await customFetch(`/roles/${role.id}`, 'GET');
      console.log('Respuesta JSON al seleccionar un rol:', data); // Log detallado

      if (data && Array.isArray(data.permissions)) {
        setRolePermissions(data.permissions.map((permiso) => permiso.id)); // Cargar los permisos actuales del rol
      } else {
        console.warn('El rol no tiene permisos asignados o la respuesta no contiene permisos.');
        setRolePermissions([]); // Si no tiene permisos, lista vacía
      }
    } catch (error) {
      console.error('Error al obtener permisos del rol:', error);
      Swal.fire('Error', 'No se pudieron obtener los permisos del rol.', 'error');
      setRolePermissions([]); // Reiniciar la lista en caso de error
    } finally {
      setCargandoPermisosRol(false);
    }
  };

  // Cambiar permisos (checkbox)
  const handlePermissionChange = (permisoId) => {
    setRolePermissions((prevPermissions) =>
      prevPermissions.includes(permisoId)
        ? prevPermissions.filter((id) => id !== permisoId) // Quitar permiso si ya estaba
        : [...prevPermissions, permisoId] // Agregar permiso si no estaba
    );
  };

  // Sincronizar permisos
  const handleSaveChanges = async () => {
    if (!selectedRole) return;

    const body = {
      rol_id: selectedRole.id.toString(),
      permisos: rolePermissions.map((permiso) => permiso.toString()), // Convertir a string para el body
    };

    setCargandoAsignacion(true);
    try {
      await customFetch('/roles/sync/permisos', 'POST', body); // Envío del body para sincronización
      Swal.fire('Éxito', 'Permisos sincronizados correctamente.', 'success');
      await fetchRoles(); // Actualizar roles después de sincronizar
      await fetchPermisos(); // Refrescar permisos
    } catch (error) {
      console.error('Error al sincronizar permisos:', error);
      Swal.fire('Error', 'No se pudieron sincronizar los permisos.', 'error');
    } finally {
      setCargandoAsignacion(false);
    }
  };

  if (cargandoRoles || cargandoPermisos) {
    return <Loading />;
  }

  return (
    <div className="permisos-section">
      <h4 className="mt-3">Lista de Roles</h4>
      <h6>Seleccionar un Rol para gestionar sus permisos</h6>
      <ListGroup className="mb-3">
        {roles.map((role) => (
          <ListGroup.Item
            key={role.id}
            action
            active={selectedRole && selectedRole.id === role.id}
            onClick={() => handleRoleSelect(role)}
          >
            {role.name} - {role.description || 'Sin descripción'}
          </ListGroup.Item>
        ))}
      </ListGroup>

      {selectedRole && (
        <div className="mt-4">
          <h5>Asignar Permisos al Rol: {selectedRole.name}</h5>
          {cargandoPermisosRol ? (
            <Loading />
          ) : (
          <Form>
            {permisos.map((permiso) => (
              <Form.Check
                key={permiso.id}
                type="checkbox"
                label={
                  <>
                    <strong>{permiso.description}  </strong>
                    <small className="text-muted">{permiso.name || 'Sin descripción'}</small>
                  </>
                }
                checked={rolePermissions.includes(permiso.id)}
                onChange={() => handlePermissionChange(permiso.id)}
              />
            ))}
          </Form>
          )}
          <Button variant="primary" className="mt-3" onClick={handleSaveChanges} disabled={cargandoAsignacion}>
            {cargandoAsignacion ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      )}
    </div>
  );
}
