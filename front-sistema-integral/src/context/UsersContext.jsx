// src/context/UsersContext.jsx

import React, { createContext, useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import customFetch from './CustomFetch';

// Crear el contexto
export const UsersContext = createContext();

export const UsersProvider = ({ children }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(true);

  const [roles, setRoles] = useState([]);
  const [cargandoRoles, setCargandoRoles] = useState(true);

  const [permisos, setPermisos] = useState([]);
  const [cargandoPermisos, setCargandoPermisos] = useState(true);

  const fetchUsuarios = useCallback(async () => {
    setCargandoUsuarios(true);
    try {
      const data = await customFetch('/users', 'GET');
      console.log('Datos de usuarios:', data);
      if (Array.isArray(data)) {
        setUsuarios(data);
      } else {
        console.error('Error: La respuesta no es un arreglo de usuarios:', data);
        setUsuarios([]);
      }
    } catch (error) {
      Swal.fire('Error', 'Error al obtener usuarios.', 'error');
      console.error('Error al obtener usuarios:', error);
      setUsuarios([]);
    } finally {
      setCargandoUsuarios(false);
    }
  }, []);

  const fetchUsuario = useCallback(async (id) => {
    try {
      const data = await customFetch(`/users/${id}`, 'GET');
      console.log('Datos del usuario:', data);
  
      if (data && typeof data === 'object') {
        return data;
      } else {
        console.error('Error: Respuesta inesperada al obtener un usuario:', data);
        return null;
      }
    } catch (error) {
      Swal.fire('Error', 'Error al obtener usuario.', 'error');
      console.error('Error al obtener usuario:', error);
      return null;
    }
  }, []);

const fetchRoles = useCallback(async () => {
  setCargandoRoles(true);
  try {
    const data = await customFetch('/roles', 'GET');
    console.log('Datos de roles:', data);
    // Debe retornar algo como [ [ {id: 1, name: 'Admin'}... ], 200 ]
    if (
      Array.isArray(data) &&
      data.length === 2 &&
      Array.isArray(data[0]) &&
      typeof data[1] === 'number'
    ) {
      const [fetchedRoles, status] = data;
      if (status === 200) {
        setRoles(fetchedRoles); // guardamos en el estado
        console.log('Roles actualizados en el contexto:', fetchedRoles);
        return fetchedRoles;   // <-- retornamos también
      } else {
        console.error('Error: estado no es 200 en roles:', fetchedRoles, status);
        setRoles([]);
        return [];
      }
    } else {
      console.error('Error: Respuesta de roles no es [rolesArray, status]:', data);
      setRoles([]);
      return [];
    }
  } catch (error) {
    Swal.fire('Error', 'Error al obtener roles.', 'error');
    console.error('Error al obtener roles:', error);
    setRoles([]);
    return [];
  } finally {
    setCargandoRoles(false);
  }
}, []);


  const fetchPermisos = useCallback(async () => {
    setCargandoPermisos(true);
    try {
      const data = await customFetch('/permisos', 'GET');
      console.log('Datos de permisos:', data);
      if (Array.isArray(data) && data.length === 2 && Array.isArray(data[0]) && typeof data[1] === 'number') {
        const [fetchedPermisos, status] = data;
        if (status === 200) {
          setPermisos(fetchedPermisos);
        } else {
          console.error('Error: estado no es 200 en permisos:', fetchedPermisos, status);
          setPermisos([]);
        }
      } else {
        console.error('Error: Respuesta de permisos no es [permisosArray, status]:', data);
        setPermisos([]);
      }
    } catch (error) {
      Swal.fire('Error', 'Error al obtener permisos.', 'error');
      console.error('Error al obtener permisos:', error);
      setPermisos([]);
    } finally {
      setCargandoPermisos(false);
    }
  }, []);

  const addUsuario = useCallback(async (newUser) => {
    try {
      const data = await customFetch('/users', 'POST', newUser);
      console.log('Respuesta al agregar usuario:', data);
  
      if (typeof data === 'object' && data.id) {
        // Agrega el usuario directamente al estado
        setUsuarios((prevUsuarios) => [...prevUsuarios, data]);
        Swal.fire('Éxito', 'Usuario agregado exitosamente.', 'success');
      } else {
        throw new Error('Error al agregar usuario');
      }
    } catch (error) {
      console.error('Error al agregar usuario:', error);
      Swal.fire('Error', 'No se pudo agregar el usuario. Intenta nuevamente.', 'error');
    }
  }, []);
  

  const editUsuario = useCallback(async (updatedUser) => {
    try {
      const payload = {
        name: updatedUser.name,
        email: updatedUser.email,
      };
      if (updatedUser.password) {
        payload.password = updatedUser.password;
      }
      const data = await customFetch(`/users/${updatedUser.id}`, 'PUT', payload);
      console.log('Respuesta al editar usuario:', data);
      if (Array.isArray(data) && data.length >= 2) {
        const [, status] = data;
        if (status === 200) {
          await fetchUsuarios();
        } else {
          throw new Error('Error al editar usuario');
        }
      }
    } catch (error) {
      throw error;
    }
  }, [fetchUsuarios]);

  const deleteUsuario = useCallback(async (id) => {
    try {
      const data = await customFetch(`/users/${id}`, 'DELETE');
      console.log('Respuesta al eliminar usuario:', data);
      if (Array.isArray(data) && data.length >= 2) {
        const [, status] = data;
        if (status === 200) {
          await fetchUsuarios();
        } else {
          throw new Error('Error al eliminar usuario');
        }
      }
    } catch (error) {
      throw error;
    }
  }, [fetchUsuarios]);

  const addRole = useCallback(async (newRole) => {
    try {
      const data = await customFetch('/roles', 'POST', newRole);
      console.log('Respuesta al agregar rol:', data);
      if (Array.isArray(data) && data.length >= 2) {
        const [, status] = data;
        if (status === 200) {
          await fetchRoles();
        } else {
          throw new Error('Error al agregar rol');
        }
      } else if (typeof data === 'string' && data.toLowerCase().includes('agregado exitosamente')) {
        await fetchRoles();
      } else if (data && typeof data === 'object' && data.id && data.name && data.created_at) {
        await fetchRoles();
      } else {
        console.error('Formato de respuesta inesperado al agregar rol:', data);
        throw new Error('Formato de respuesta inesperado al agregar rol');
      }
    } catch (error) {
      console.error('Error al agregar rol:', error);
      let errorMessage = 'No se pudo agregar el rol.';
      const match = error.message.match(/\{.*\}/);
      if (match) {
        try {
          const jsonError = JSON.parse(match[0]);
          if (jsonError.error) {
            errorMessage = jsonError.error;
          }
        } catch (parseError) {
          console.error('Error al parsear el mensaje de error JSON:', parseError);
        }
      }
      Swal.fire('Error', errorMessage, 'error');
    }
  }, [fetchRoles]);

  const editRole = useCallback(async (updatedRole) => {
    try {
      const data = await customFetch(`/roles/${updatedRole.id}`, 'PUT', updatedRole);
      console.log('Respuesta al editar rol:', data);
      if (Array.isArray(data) && data.length >= 2) {
        const [, status] = data;
        if (status === 200) {
          await fetchRoles();
        } else {
          throw new Error('Error al editar rol');
        }
      }
    } catch (error) {
      throw error;
    }
  }, [fetchRoles]);

  const deleteRole = useCallback(async (id) => {
    try {
      const data = await customFetch(`/roles/${id}`, 'DELETE');
      console.log('Respuesta al eliminar rol:', data);
      if (typeof data === 'string' && data.includes('eliminado exitosamente')) {
        Swal.fire('Eliminado', data, 'success');
        await fetchRoles();
      } else {
        console.error('Formato de respuesta inesperado al eliminar rol:', data);
        Swal.fire('Error', 'Formato de respuesta inesperado al eliminar rol.', 'error');
      }
    } catch (error) {
      console.error('Error al eliminar rol:', error);
      let errorMessage = 'No se pudo eliminar el rol.';
      const match = error.message.match(/\{.*\}/);
      if (match) {
        try {
          const jsonError = JSON.parse(match[0]);
          if (jsonError.error) {
            errorMessage = jsonError.error;
          }
        } catch (parseError) {
          console.error('Error al parsear el mensaje de error JSON:', parseError);
        }
      }
      Swal.fire('Error', errorMessage, 'error');
    }
  }, [fetchRoles]);

  const assignRolesToUser = useCallback(async (userId, rolesIds) => {
    try {
      const data = await customFetch(`/users/${userId}/roles-sinc`, 'POST', {
        id: userId,
        roles: rolesIds,
      });
      console.log('Respuesta al asignar roles a usuario:', data);
      if (Array.isArray(data) && data.length >= 2) {
        const [, status] = data;
        if (status === 200) {
          await fetchUsuarios();
        } else {
          throw new Error('Error al asignar roles');
        }
      }
    } catch (error) {
      throw error;
    }
  }, [fetchUsuarios]);

  const assignPermissionsToUser = useCallback(async (userId, permissionsIds) => {
    try {
      const data = await customFetch(`/users/${userId}/permisos`, 'PUT', {
        permisos: permissionsIds,
      });
      console.log('Respuesta al asignar permisos a usuario:', data);
      if (Array.isArray(data) && data.length >= 2) {
        const [, status] = data;
        if (status === 200) {
          await fetchUsuarios();
        } else {
          throw new Error('Error al asignar permisos');
        }
      }
    } catch (error) {
      throw error;
    }
  }, [fetchUsuarios]);

  // Nueva función para obtener usuarios por rol
  const fetchUsersByRole = useCallback(async (roleId) => {
    try {
      const data = await customFetch(`/roles/${roleId}/users`, 'GET');
      console.log(`Usuarios con el rol ${roleId}:`, data);
      if (Array.isArray(data)) {
        return data;
      } else {
        console.error('Respuesta al obtener usuarios por rol no es un arreglo:', data);
        Swal.fire('Error', 'Error al obtener usuarios por rol.', 'error');
        return [];
      }
    } catch (error) {
      Swal.fire('Error', 'Error al obtener usuarios por rol.', 'error');
      console.error('Error al obtener usuarios por rol:', error);
      return [];
    }
  }, []);

    // Obtener servicios disponibles
    const fetchServicios = useCallback(async () => {
      try {
        const data = await customFetch('/servicios', 'GET');
        return data || [];
      } catch (error) {
        Swal.fire('Error', 'No se pudieron obtener los servicios.', 'error');
        console.error('Error al obtener servicios:', error);
        return [];
      }
    }, []);

      // Sincronizar servicios con un usuario
  const syncServicios = useCallback(async (userId, serviciosIds) => {
    try {
      await customFetch(`/users/${userId}/servicios-sinc`, 'POST', {
        servicios: serviciosIds,
      });
      console.log(`Servicios sincronizados para usuario ${userId}:`, serviciosIds);
    } catch (error) {
      Swal.fire('Error', 'No se pudieron sincronizar los servicios.', 'error');
      console.error('Error al sincronizar servicios:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
    fetchRoles();
    fetchPermisos();
  }, [fetchUsuarios, fetchRoles, fetchPermisos]);

  return (
    <UsersContext.Provider
      value={{
        usuarios,
        cargandoUsuarios,
        roles,
        cargandoRoles,
        permisos,
        cargandoPermisos,
        fetchUsuarios,
        fetchRoles,
        fetchPermisos,
        addUsuario,
        editUsuario,
        deleteUsuario,
        addRole,
        editRole,
        deleteRole,
        assignRolesToUser,
        assignPermissionsToUser,
        fetchUsersByRole,
        fetchUsuario,
        fetchServicios,
        syncServicios,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};
