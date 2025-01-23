import React, { useState, useContext, useCallback } from 'react';
import { Form, ListGroup, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
import Loading from '../../../components/common/loading/Loading.jsx';
import { UsersContext } from '../../../context/UsersContext.jsx';
import customFetch from '../../../context/CustomFetch.js';
import CustomButton from '../../../components/common/botons/CustomButton.jsx';
// 1. Importar AuthContext
import { AuthContext } from '../../../context/AuthContext.jsx';

export default function PermisosList() {
  const {
    roles,
    cargandoRoles,
    permisos,
    cargandoPermisos,
    fetchRoles,
    fetchPermisos
  } = useContext(UsersContext);

  // 2. Extraer user y definir la función hasPermission
  const { user } = useContext(AuthContext);
  const hasPermission = useCallback(
    (perm) => user?.permissions?.includes(perm),
    [user?.permissions]
  );

  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [cargandoAsignacion, setCargandoAsignacion] = useState(false);
  const [cargandoPermisosRol, setCargandoPermisosRol] = useState(false);

  // 3. Si el usuario NO tiene permiso roles.index, mostramos mensaje y no pintamos la lista
  if (!hasPermission('roles.index')) {
    return (
      <div className="permisos-section">
        <h4>Permisos</h4>
        <p>No tienes permiso <strong>Acceso a Roles</strong> para ver esta lista de roles.</p>
      </div>
    );
  }

  const handleRoleSelect = async (role) => {
    // Comprobamos que el usuario tenga permiso roles.show
    if (!hasPermission('roles.show')) {
      Swal.fire('Error', 'No tienes permiso para ver los permisos del rol.', 'error');
      return;
    }

    setSelectedRole(role);
    setCargandoPermisosRol(true);
    try {
      const data = await customFetch(`/roles/${role.id}`, 'GET');
      // El endpoint /roles/:id debe devolver algo como:
      // { id: roleId, name: "...", permissions: [ { id: 1, name: "...", description: "..." }, ... ] }
      setRolePermissions(data.permissions.map((permiso) => permiso.id));
    } catch (error) {
      console.error('Error al obtener permisos del rol:', error);
      Swal.fire('Error', 'No se pudieron obtener los permisos del rol.', 'error');
      setRolePermissions([]);
    } finally {
      setCargandoPermisosRol(false);
    }
  };

  const handlePermissionChange = (permisoId) => {
    setRolePermissions((prevPermissions) =>
      prevPermissions.includes(permisoId)
        ? prevPermissions.filter((id) => id !== permisoId)
        : [...prevPermissions, permisoId]
    );
  };

  const handleSaveChanges = async () => {
    if (!selectedRole) return;

    const body = {
      rol_id: selectedRole.id.toString(),
      permisos: rolePermissions.map((permiso) => permiso.toString()),
    };

    setCargandoAsignacion(true);
    try {
      await customFetch('/roles/sync/permisos', 'POST', body);
      Swal.fire('Éxito', 'Permisos sincronizados correctamente.', 'success');
      await fetchRoles();
      await fetchPermisos();
    } catch (error) {
      console.error('Error al sincronizar permisos:', error);
      Swal.fire('Error', 'No se pudieron sincronizar los permisos.', 'error');
    } finally {
      setCargandoAsignacion(false);
    }
  };

  const handleCloseRole = () => {
    setSelectedRole(null);
    setRolePermissions([]);
  };

  // Mientras carga roles o permisos
  if (cargandoRoles || cargandoPermisos) {
    return <Loading />;
  }

  // Ordenar la lista de permisos alfabéticamente por description
  const sortedPermisos = [...permisos].sort((a, b) => {
    const descA = a.description?.toLowerCase() || '';
    const descB = b.description?.toLowerCase() || '';
    return descA.localeCompare(descB);
  });

  const mitad = Math.ceil(sortedPermisos.length / 2);
  const permisosColumna1 = sortedPermisos.slice(0, mitad);
  const permisosColumna2 = sortedPermisos.slice(mitad);

  return (
    <div className="permisos-section">
      <h4 className="mt-3">Lista de Roles</h4>
      <h6>Seleccionar un Rol para gestionar sus permisos</h6>

      {/* Lista de roles */}
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
              <Row>
                <Col md={6}>
                  {permisosColumna1.map((permiso) => (
                    <Form.Check
                      key={permiso.id}
                      type="checkbox"
                      label={
                        <>
                          <strong>{permiso.description}</strong>
                          <small className="text-muted ms-2">
                            {permiso.name || 'Sin descripción'}
                          </small>
                        </>
                      }
                      checked={rolePermissions.includes(permiso.id)}
                      onChange={() => handlePermissionChange(permiso.id)}
                      // Aquí inhabilitamos el check si no tiene permiso "permisos.show"
                      disabled={!hasPermission('permisos.show')}
                    />
                  ))}
                </Col>
                <Col md={6}>
                  {permisosColumna2.map((permiso) => (
                    <Form.Check
                      key={permiso.id}
                      type="checkbox"
                      label={
                        <>
                          <strong>{permiso.description}</strong>
                          <small className="text-muted ms-2">
                            {permiso.name || 'Sin descripción'}
                          </small>
                        </>
                      }
                      checked={rolePermissions.includes(permiso.id)}
                      onChange={() => handlePermissionChange(permiso.id)}
                      disabled={!hasPermission('permisos.show')}
                    />
                  ))}
                </Col>
              </Row>
            </Form>
          )}

          <div className="d-flex justify-content-start gap-2 mt-3">
            {/* Botón para Guardar Cambios, requiere permiso roles.sync-perm */}
            <CustomButton
              variant="primary"
              onClick={handleSaveChanges}
              disabled={!hasPermission('roles.sync-perm') || cargandoAsignacion}
            >
              {cargandoAsignacion ? 'Guardando...' : 'Guardar Cambios'}
            </CustomButton>
            <CustomButton variant="danger" onClick={handleCloseRole}>
              Cerrar Lista
            </CustomButton>
          </div>
        </div>
      )}
    </div>
  );
}
