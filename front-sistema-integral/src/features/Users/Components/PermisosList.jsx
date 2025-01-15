import React, { useState, useContext } from 'react';
import { Form, ListGroup, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
import Loading from '../../../components/common/loading/Loading.jsx';
import { UsersContext } from '../../../context/UsersContext.jsx';
import customFetch from '../../../context/CustomFetch.js';
import CustomButton from '../../../components/common/botons/CustomButton.jsx';

export default function PermisosList() {
  const { roles, cargandoRoles, permisos, cargandoPermisos, fetchRoles, fetchPermisos } = useContext(UsersContext);
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [cargandoAsignacion, setCargandoAsignacion] = useState(false);
  const [cargandoPermisosRol, setCargandoPermisosRol] = useState(false);

  const handleRoleSelect = async (role) => {
    setSelectedRole(role);
    setCargandoPermisosRol(true);
    try {
      const data = await customFetch(`/roles/${role.id}`, 'GET');
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

  if (cargandoRoles || cargandoPermisos) {
    return <Loading />;
  }

  const mitad = Math.ceil(permisos.length / 2);
  const permisosColumna1 = permisos.slice(0, mitad);
  const permisosColumna2 = permisos.slice(mitad);

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
              <Row>
                <Col md={6}>
                  {permisosColumna1.map((permiso) => (
                    <Form.Check
                      key={permiso.id}
                      type="checkbox"
                      label={
                        <>
                          <strong>{permiso.description}</strong>
                          <small className="text-muted ms-2">{permiso.name || 'Sin descripción'}</small>
                        </>
                      }
                      checked={rolePermissions.includes(permiso.id)}
                      onChange={() => handlePermissionChange(permiso.id)}
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
                          <small className="text-muted ms-2">{permiso.name || 'Sin descripción'}</small>
                        </>
                      }
                      checked={rolePermissions.includes(permiso.id)}
                      onChange={() => handlePermissionChange(permiso.id)}
                    />
                  ))}
                </Col>
              </Row>
            </Form>
          )}
          <div className="d-flex justify-content-start gap-2 mt-3">
            <CustomButton
              variant="primary"
              onClick={handleSaveChanges}
              disabled={cargandoAsignacion}
            >
              {cargandoAsignacion ? 'Guardando...' : 'Guardar Cambios'}
            </CustomButton>
            <CustomButton
              variant="danger"
              onClick={handleCloseRole}
            >
              Cerrar Lista
            </CustomButton>
          </div>
        </div>
      )}
    </div>
  );
}
