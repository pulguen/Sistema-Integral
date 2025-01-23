import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Breadcrumb, Form, Row, Col, Table } from 'react-bootstrap';
import Swal from 'sweetalert2';
import CustomButton from '../../../components/common/botons/CustomButton.jsx';
import Loading from '../../../components/common/loading/Loading.jsx';
import { FaEdit, FaTrash, FaSave } from 'react-icons/fa';

import { AuthContext } from '../../../context/AuthContext.jsx';
import { UsersContext } from '../../../context/UsersContext.jsx';

const UsuarioDetalle = () => {
  const { id } = useParams(); // ID del usuario
  const navigate = useNavigate();

  const { user } = useContext(AuthContext);
  const {
    fetchUsuario,
    deleteUsuario,
    editUsuario,
    fetchServicios,
    syncServicios,
    fetchRoles,         // <-- Importante
    assignRolesToUser,  // <-- Importante
  } = useContext(UsersContext);

  // ---------- Estados para el usuario ----------
  const [usuario, setUsuario] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedUsuario, setEditedUsuario] = useState({
    name: '',
    email: '',
    roles: [],
  });

  // ---------- Estados para SERVICIOS ----------
  const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
  const [serviciosAsignados, setServiciosAsignados] = useState([]);

  // ---------- Estados para ROLES ----------
  const [rolesDisponibles, setRolesDisponibles] = useState([]);
  const [rolesAsignados, setRolesAsignados] = useState([]);

  // Verificar permisos
  const hasPermission = useCallback(
    (permission) => user?.permissions?.includes(permission),
    [user?.permissions]
  );

  // --- 1) Cargar datos del usuario ---
  const fetchUserDetails = useCallback(async () => {
    try {
      const data = await fetchUsuario(id);
      if (data) {
        setUsuario(data);
        setEditedUsuario({
          name: data.name || '',
          email: data.email || '',
          roles: data.roles || [],
          servicios: data.servicios || [],
        });
        // Asignar IDs al estado local
        setServiciosAsignados(data.servicios.map(s => s.id));
        setRolesAsignados(data.roles.map(r => r.id));
      }
    } catch (error) {
      Swal.fire('Error', 'No se pudo obtener la información del usuario.', 'error');
    }
  }, [id, fetchUsuario]);

  // --- 2) Cargar servicios disponibles ---
  const loadServicios = useCallback(async () => {
    try {
      const servicios = await fetchServicios();
      setServiciosDisponibles(servicios);
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar los servicios disponibles.', 'error');
    }
  }, [fetchServicios]);

  // --- 3) Cargar roles disponibles ---
  const loadRoles = useCallback(async () => {
    try {
      const data = await fetchRoles();  // retorna un array de roles
      if (Array.isArray(data)) {
        setRolesDisponibles(data);
      } else {
        setRolesDisponibles([]);
      }
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar los roles disponibles.', 'error');
    }
  }, [fetchRoles]);

  // ---------------------------
  //  Sincronizar SERVICIOS
  // ---------------------------
  const handleAsignarServicios = async () => {
    try {
      await syncServicios(id, serviciosAsignados);
      Swal.fire('Éxito', 'Servicios asignados correctamente.', 'success');
      fetchUserDetails();
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al asignar los servicios.', 'error');
    }
  };

  // ---------------------------
  //  Sincronizar ROLES
  // ---------------------------
  const handleAsignarRoles = async () => {
    try {
      await assignRolesToUser(id, rolesAsignados);
      Swal.fire('Éxito', 'Roles asignados correctamente.', 'success');
      fetchUserDetails();
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al asignar los roles.', 'error');
    }
  };

  // Checkboxes de servicios
  const handleCheckboxChange = (servicioId) => {
    setServiciosAsignados(prev =>
      prev.includes(servicioId)
        ? prev.filter(id => id !== servicioId)
        : [...prev, servicioId]
    );
  };

  // Checkboxes de roles
  const handleCheckboxRoleChange = (roleId) => {
    setRolesAsignados(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  // Guardar ediciones (nombre, email)
  const handleSave = async () => {
    try {
      const updatedData = {
        id: usuario.id,
        name: editedUsuario.name,
        email: editedUsuario.email,
        roles: editedUsuario.roles,
      };
      await editUsuario(updatedData);
      Swal.fire('Éxito', 'El usuario ha sido actualizado.', 'success');
      setEditMode(false);
      fetchUserDetails();
    } catch (error) {
      Swal.fire('Error', 'No se pudo actualizar el usuario.', 'error');
    }
  };

  // Eliminar usuario
  const handleDelete = async () => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      });
      if (result.isConfirmed) {
        await deleteUsuario(id);
        Swal.fire('Eliminado', 'El usuario ha sido eliminado.', 'success');
        navigate('/users');
      }
    } catch (error) {
      Swal.fire('Error', 'No se pudo eliminar el usuario.', 'error');
    }
  };

  // Efecto para cargar datos al montar
  useEffect(() => {
    fetchUserDetails();
    loadServicios();
    loadRoles();
  }, [fetchUserDetails, loadServicios, loadRoles]);

  if (!usuario) return <Loading />;

  return (
    <Card className="p-4">
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/users' }}>
          Gestión de Usuarios
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{usuario.name}</Breadcrumb.Item>
      </Breadcrumb>

      <Row>
        {/* Columna Izquierda: info usuario */}
        <Col md={6}>
          <h4 className="text-primary">Datos del Usuario</h4>
          {!editMode ? (
            <>
              <p><strong>Nombre:</strong> {usuario.name}</p>
              <p><strong>Email:</strong> {usuario.email}</p>
              <p>
                <strong>Roles:</strong>{' '}
                {usuario.roles.map((role) => role.name).join(', ')}
              </p>
              <p>
                <strong>Servicios:</strong>{' '}
                {usuario.servicios.map((s) => s.nombre).join(', ')}
              </p>
              <CustomButton
                variant="warning"
                onClick={() => setEditMode(true)}
                disabled={!hasPermission('users.update')}
              >
                <FaEdit /> Modificar
              </CustomButton>
              <CustomButton
                variant="danger"
                className="ms-3"
                onClick={handleDelete}
                disabled={!hasPermission('users.destroy')}
              >
                <FaTrash /> Eliminar
              </CustomButton>
            </>
          ) : (
            <Form>
              <Form.Group controlId="name">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  value={editedUsuario.name}
                  onChange={(e) =>
                    setEditedUsuario({ ...editedUsuario, name: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group controlId="email" className="mt-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={editedUsuario.email}
                  onChange={(e) =>
                    setEditedUsuario({ ...editedUsuario, email: e.target.value })
                  }
                />
              </Form.Group>
              <CustomButton
                variant="success"
                className="mt-3"
                onClick={handleSave}
              >
                <FaSave /> Guardar
              </CustomButton>
              <CustomButton
                variant="danger"
                className="mt-3 ms-3"
                onClick={() => setEditMode(false)}
              >
                Cancelar
              </CustomButton>
            </Form>
          )}
        </Col>

        {/* Columna Derecha: Servicios */}
        <Col md={6}>
          <h4 className="text-primary">Servicios Asignados</h4>
          <Table striped bordered hover className="mt-3">
            <thead>
              <tr>
                <th>#</th>
                <th>Servicio</th>
              </tr>
            </thead>
            <tbody>
              {usuario.servicios.map((servicio, index) => (
                <tr key={servicio.id}>
                  <td>{index + 1}</td>
                  <td>{servicio.nombre}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <hr />

          <h4>Asignar Servicios</h4>
          <Form>
            <Row>
              {serviciosDisponibles.map((servicio) => (
                <Col md={6} key={servicio.id}>
                  <Form.Check
                    type="checkbox"
                    id={`servicio-${servicio.id}`}
                    label={servicio.nombre}
                    checked={serviciosAsignados.includes(servicio.id)}
                    onChange={() => handleCheckboxChange(servicio.id)}
                    disabled={!hasPermission('users.sync-serv')}
                  />
                </Col>
              ))}
            </Row>
          </Form>
          <CustomButton
            variant="primary"
            className="mt-3"
            onClick={handleAsignarServicios}
            disabled={!hasPermission('users.sync-serv')}
          >
            <FaSave /> Asignar Servicios
          </CustomButton>
        </Col>
      </Row>

      <hr />

      {/* Asignación de Roles */}
      <Row>
        <Col md={12}>
          <h4 className="text-primary">Asignar Roles</h4>
          <Form>
            <Row>
              {rolesDisponibles.map((role) => (
                <Col md={4} key={role.id}>
                  <Form.Check
                    type="checkbox"
                    id={`role-${role.id}`}
                    label={role.name}
                    checked={rolesAsignados.includes(role.id)}
                    onChange={() => handleCheckboxRoleChange(role.id)}
                    disabled={!hasPermission('users.sync-roles')}
                  />
                </Col>
              ))}
            </Row>
          </Form>
          <CustomButton
            variant="primary"
            className="mt-3"
            onClick={handleAsignarRoles}
            disabled={!hasPermission('users.sync-roles')}
          >
            <FaSave /> Asignar Roles
          </CustomButton>
        </Col>
      </Row>
    </Card>
  );
};

export default UsuarioDetalle;
