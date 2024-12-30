// src/features/Users/Components/Permisos.jsx

import React, { useState, useEffect } from 'react';
import { Breadcrumb, Form, Button, ListGroup } from 'react-bootstrap';
import Swal from 'sweetalert2';
import customFetch from '../../../context/CustomFetch.js';
import Loading from '../../../components/common/loading/Loading.jsx';

export default function Permisos() {
  const [usuarios, setUsuarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [permisosDisponibles, setPermisosDisponibles] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(true);
  const [cargandoPermisos, setCargandoPermisos] = useState(false);

  // Obtener lista de usuarios
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const data = await customFetch('/users', 'GET');
        setUsuarios(data);
        setFilteredUsuarios(data);
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
        Swal.fire('Error', 'No se pudieron obtener los usuarios.', 'error');
      } finally {
        setCargandoUsuarios(false);
      }
    };

    fetchUsuarios();
  }, []);

  // Manejar búsqueda de usuarios
  useEffect(() => {
    if (searchTerm) {
      const filtered = usuarios.filter((usuario) =>
        usuario.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsuarios(filtered);
    } else {
      setFilteredUsuarios(usuarios);
    }
  }, [searchTerm, usuarios]);

  // Obtener lista de permisos disponibles
  useEffect(() => {
    const fetchPermisos = async () => {
      try {
        const data = await customFetch('/permisos', 'GET');
        setPermisosDisponibles(data);
      } catch (error) {
        console.error('Error al obtener permisos:', error);
        Swal.fire('Error', 'No se pudieron obtener los permisos.', 'error');
      }
    };

    fetchPermisos();
  }, []);

  // Manejar selección de usuario
  const handleUserSelect = async (usuario) => {
    setSelectedUser(usuario);
    setCargandoPermisos(true);

    try {
      // Obtener los permisos del usuario seleccionado
      const data = await customFetch(`/users/${usuario.id}/permisos`, 'GET');
      setUserPermissions(data.map((permiso) => permiso.id));
    } catch (error) {
      console.error('Error al obtener permisos del usuario:', error);
      Swal.fire('Error', 'No se pudieron obtener los permisos del usuario.', 'error');
    } finally {
      setCargandoPermisos(false);
    }
  };

  // Manejar cambio en los checkboxes
  const handlePermissionChange = (permisoId) => {
    if (userPermissions.includes(permisoId)) {
      setUserPermissions(userPermissions.filter((id) => id !== permisoId));
    } else {
      setUserPermissions([...userPermissions, permisoId]);
    }
  };

  // Guardar cambios
  const handleSave = async () => {
    try {
      await customFetch(`/users/${selectedUser.id}/permisos`, 'PUT', { permisos: userPermissions });
      Swal.fire('Éxito', 'Permisos actualizados correctamente.', 'success');
    } catch (error) {
      console.error('Error al actualizar permisos del usuario:', error);
      Swal.fire('Error', 'No se pudieron actualizar los permisos del usuario.', 'error');
    }
  };

  return (
    <div className="permisos-section">
      {/* Migas de Pan */}
      <Breadcrumb>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item href="/usuarios">Usuarios</Breadcrumb.Item>
        <Breadcrumb.Item active>Permisos</Breadcrumb.Item>
      </Breadcrumb>

      {/* Título de la Sección */}
      <h3 className="section-title">Asignar Permisos a Usuarios</h3>

      {/* Campo de Búsqueda de Usuarios */}
      <Form.Control
        type="text"
        placeholder="Buscar usuario por nombre o email"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-3"
        aria-label="Buscar Usuario"
      />

      {/* Lista de Usuarios */}
      {cargandoUsuarios ? (
        <Loading />
      ) : (
        <ListGroup>
          {filteredUsuarios.map((usuario) => (
            <ListGroup.Item
              key={usuario.id}
              action
              active={selectedUser && selectedUser.id === usuario.id}
              onClick={() => handleUserSelect(usuario)}
            >
              {usuario.name} - {usuario.email}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {/* Lista de Permisos con Checkboxes */}
      {selectedUser && (
        <div className="mt-4">
          <h5>Permisos de {selectedUser.name}</h5>
          {cargandoPermisos ? (
            <Loading />
          ) : (
            <Form>
              {permisosDisponibles.map((permiso) => (
                <Form.Check
                  key={permiso.id}
                  type="checkbox"
                  label={permiso.name}
                  checked={userPermissions.includes(permiso.id)}
                  onChange={() => handlePermissionChange(permiso.id)}
                />
              ))}
            </Form>
          )}
          <Button variant="primary" className="mt-3" onClick={handleSave}>
            Guardar Cambios
          </Button>
        </div>
      )}
    </div>
  );
}
