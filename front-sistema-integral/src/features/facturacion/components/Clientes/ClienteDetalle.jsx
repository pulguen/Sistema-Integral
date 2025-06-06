import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Breadcrumb, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
import Loading from '../../../../components/common/loading/Loading.jsx';
import { AuthContext } from '../../../../context/AuthContext';
import { FacturacionContext } from '../../../../context/FacturacionContext';
import { ClientContext } from '../../../../context/ClientContext';
import DetalleClienteDisplay from './DetalleClienteDisplay';
import ServiciosAsignados from './ServiciosAsignados';
import AsignacionServicios from './AsignacionServicios';
import customFetch from '../../../../context/CustomFetch.js';
import EditClientModal from '../../../../components/common/modals/EditClientModal.jsx';

export default function ClienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const {
    serviciosDisponibles,
    tributos: tributosArray,
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

  // MODAL EDIT STATE
  const [showEditModal, setShowEditModal] = useState(false);
  const [serviciosAsignados, setServiciosAsignados] = useState([]);

  // mapa de tributos para lookup rápido
  const tributos = useMemo(
    () => Object.fromEntries(tributosArray.map(t => [t.id, t])),
    [tributosArray]
  );

  useEffect(() => {
    fetchClientById(id);
  }, [fetchClientById, id]);

  useEffect(() => {
    if (!cliente) return;
    setServiciosAsignados(cliente.servicios?.map(s => s.id) || []);
  }, [cliente]);

  if (loadingClient) return <Loading />;
  if (!cliente) return <p>Cliente no encontrado</p>;

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
          <DetalleClienteDisplay
            cliente={cliente}
            onEditMode={() => setShowEditModal(true)}
            hasPermission={hasPermission}
            handleDeleteCliente={handleDelete}
          />
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

      {/* MODAL DE EDICIÓN */}
      {showEditModal && cliente && (
        <EditClientModal
          show={showEditModal}
          handleClose={() => setShowEditModal(false)}
          clientData={cliente}
          handleSubmit={async data => {
            const updated = await updateClient(data);
            setShowEditModal(false);
            fetchClientById(cliente.id);
            return updated;
          }}
        />
      )}
    </Card>
  );
}
