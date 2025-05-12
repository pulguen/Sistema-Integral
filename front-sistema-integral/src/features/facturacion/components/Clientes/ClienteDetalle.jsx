// src/pages/facturacion/ClienteDetalle.jsx
import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Breadcrumb, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
import Loading from '../../../../components/common/loading/Loading.jsx';
import { AuthContext } from '../../../../context/AuthContext';
import { FacturacionContext } from '../../../../context/FacturacionContext';
import { ClientContext } from '../../../../context/ClientContext';
import DetalleClienteDisplay from './DetalleClienteDisplay';
import DetalleClienteEditForm from './DetalleClienteEditForm';
import ServiciosAsignados from './ServiciosAsignados';
import AsignacionServicios from './AsignacionServicios';
import customFetch from '../../../../context/CustomFetch.js';

export default function ClienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const {
    serviciosDisponibles,
    tributos: tributosArray,
    provincias,
    municipios,
    calles,
  } = useContext(FacturacionContext);
  const {
    currentClient: cliente,
    loadingClient,
    fetchClientById,
    updateClient,
    removeClient
  } = useContext(ClientContext);

  // permisos
  const hasPermission = useCallback(
    perm => user?.permissions?.includes(perm),
    [user]
  );

  // tipos de cliente
  const [clienteTipos, setClienteTipos] = useState([]);
  const loadTipos = useCallback(async () => {
    try {
      const data = await customFetch('/cliente-tipos');
      setClienteTipos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando tipos:', err);
    }
  }, []);

  // edit state
  const [editMode, setEditMode] = useState(false);
  const [editedCliente, setEditedCliente] = useState({
    tipo_cliente: '',
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    telefono: '',
    f_nacimiento: '',
    provincia_id: '',
    municipio_id: '',
    calle_id: '',
    altura: '',
  });
  const [serviciosAsignados, setServiciosAsignados] = useState([]);

  // mapa de tributos para lookup rápido
  const tributos = useMemo(
    () => Object.fromEntries(tributosArray.map(t => [t.id, t])),
    [tributosArray]
  );

  // al montar, cargar cliente y tipos
  useEffect(() => {
    fetchClientById(id);
    loadTipos();
  }, [fetchClientById, loadTipos, id]);

  // cuando cambia el cliente cargado, rellenar formulario y serviciosAsignados
  useEffect(() => {
    if (!cliente) return;
    setEditedCliente({
      tipo_cliente: String(cliente.cliente_tipo_id || ''),
      nombre: cliente.persona?.nombre || '',
      apellido: cliente.persona?.apellido || '',
      dni: String(cliente.persona?.dni || ''),
      email: cliente.persona?.email || '',
      telefono: String(cliente.persona?.telefono || ''),
      f_nacimiento: cliente.persona?.f_nacimiento || '',
      provincia_id: String(cliente.direccion?.provincia?.id || ''),
      municipio_id: String(cliente.direccion?.municipio?.id || ''),
      calle_id: String(cliente.direccion?.calle?.id || ''),
      altura: String(cliente.direccion?.altura || ''),
    });
    setServiciosAsignados(cliente.servicios?.map(s => s.id) || []);
  }, [cliente]);

  if (loadingClient) return <Loading />;
  if (!cliente) return <p>Cliente no encontrado</p>;

  // manejadores de formulario de edición
  const handleEditedChange = e => {
    const { name, value } = e.target;
    setEditedCliente(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'provincia_id' && { municipio_id: '', calle_id: '' }),
      ...(name === 'municipio_id' && { calle_id: '' }),
    }));
  };

  const handleSave = async () => {
    const payload = {
      id: cliente.id,
      cliente_tipo_id: Number(editedCliente.tipo_cliente) || null,
      nombre: editedCliente.nombre,
      apellido: editedCliente.apellido,
      dni: parseInt(editedCliente.dni, 10) || null,
      email: editedCliente.email,
      telefono: editedCliente.telefono,
      f_nacimiento: editedCliente.f_nacimiento,
      provincia_id: parseInt(editedCliente.provincia_id, 10) || null,
      municipio_id: parseInt(editedCliente.municipio_id, 10) || null,
      calle_id: parseInt(editedCliente.calle_id, 10) || null,
      altura: parseInt(editedCliente.altura, 10) || null,
    };
    try {
      await updateClient(payload);
      Swal.fire('Éxito', 'Cliente actualizado correctamente.', 'success');
      setEditMode(false);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Error al actualizar el cliente.', 'error');
    }
  };

  const handleDelete = async () => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar cliente?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!isConfirmed) return;
    try {
      await removeClient(cliente.id);
      Swal.fire('Eliminado', 'Cliente eliminado con éxito.', 'success');
      navigate('/facturacion/clientes');
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo eliminar el cliente.', 'error');
    }
  };

  return (
    <Card className="p-4">
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Home</Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/facturacion/clientes' }}>
          Gestión de Clientes
        </Breadcrumb.Item>
        <Breadcrumb.Item active>
          {cliente.persona?.nombre} {cliente.persona?.apellido}
        </Breadcrumb.Item>
      </Breadcrumb>

      <Row>
        <Col md={6}>
          <h4 className="text-primary">Datos del Cliente</h4>
          {!editMode ? (
            <DetalleClienteDisplay
              cliente={cliente}
              onEditMode={() => setEditMode(true)}
              hasPermission={hasPermission}
              handleDeleteCliente={handleDelete}
            />
          ) : (
            <DetalleClienteEditForm
              cliente={cliente}
              editedCliente={editedCliente}
              provincias={provincias}
              municipios={municipios}
              calles={calles}
              clienteTipos={clienteTipos}
              handleEditedChange={handleEditedChange}
              handleEditCliente={handleSave}
              cancelEdit={() => setEditMode(false)}
            />
          )}
        </Col>

        <Col md={6}>
          <h4 className="text-primary">Servicios Asignados</h4>
          <ServiciosAsignados cliente={cliente} tributos={tributos} />
          <hr />
          <h4>Asignar Servicios</h4>
          <AsignacionServicios
            clienteId={cliente.id}
            serviciosDisponibles={serviciosDisponibles}
            tributos={tributos}
            serviciosAsignados={serviciosAsignados}
            setServiciosAsignados={setServiciosAsignados}
            onAsignar={async () => {
              await customFetch(`/clientes/${cliente.id}/serv-sinc`, 'POST', {
                servicios: serviciosAsignados
              });
              Swal.fire('Éxito', 'Servicios sincronizados.', 'success');
              fetchClientById(cliente.id);
            }}
            hasPermission={hasPermission}
          />
        </Col>
      </Row>
    </Card>
  );
}
