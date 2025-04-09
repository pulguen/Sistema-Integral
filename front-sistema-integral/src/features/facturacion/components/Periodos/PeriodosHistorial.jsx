import React, { useState, useEffect, useContext, useCallback } from "react";
import { Card, Button, Breadcrumb, Form, OverlayTrigger, Tooltip, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import { FacturacionContext } from "../../../../context/FacturacionContext";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from 'react-icons/fa';
import CustomButton from '../../../../components/common/botons/CustomButton.jsx';
import EditPeriodoModal from '../../../../components/common/modals/EditPeriodoModal.jsx';
import customFetch from '../../../../context/CustomFetch.js';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
// Importar AuthContext para obtener user.services y user.permissions
import { AuthContext } from '../../../../context/AuthContext.jsx';
import CommonTable from '../../../../components/common/table/table.jsx';

const animatedComponents = makeAnimated();

/**
 * Filtro por defecto para react-table (opcional).
 */
function DefaultColumnFilter({ column: { filterValue, setFilter } }) {
  return (
    <input
      value={filterValue || ''}
      onChange={(e) => {
        setFilter(e.target.value || undefined);
      }}
      placeholder="Buscar..."
      style={{ width: '100%' }}
      aria-label="Filtro de columna"
    />
  );
}

const PeriodosHistorial = () => {
  const { clientes, fetchClienteById } = useContext(FacturacionContext);
  const { user } = useContext(AuthContext);

  // Permisos existentes
  const canShowClients = user?.permissions.includes('cuentas.show.cliente');
  const canEditPeriod = user?.permissions.includes('cuentas.update');
  const canDeletePeriod = user?.permissions.includes('cuentas.destroy');

  // Permisos nuevos solicitados
  const canShowTributos = user?.permissions.includes('tributos.show.cliente');
  const canShowServices = user?.permissions.includes('servicios.show.cliente');

  // Estados para selección y datos
  const [clientsByServices, setClientsByServices] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [tributosMap, setTributosMap] = useState([]);
  const [selectedTributo, setSelectedTributo] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [selectedServicio, setSelectedServicio] = useState(null);
  const [periodos, setPeriodos] = useState([]);
  const [loadingPeriodos, setLoadingPeriodos] = useState(false);
  const [clienteDatos, setClienteDatos] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPeriodo, setSelectedPeriodo] = useState(null);

  // Filtrar clientes según servicios del usuario
  useEffect(() => {
    if (!Array.isArray(clientes)) return;
    if (!Array.isArray(user?.services) || user.services.length === 0) {
      setClientsByServices([]);
      return;
    }
    const filtered = clientes.filter((cli) => {
      if (!Array.isArray(cli.servicios)) return false;
      return cli.servicios.some((s) => user.services.includes(s.id));
    });
    setClientsByServices(filtered);
    setFilteredClientes(filtered);
  }, [clientes, user?.services]);

  // Manejo de búsqueda en el select
  const handleSearchChange = useCallback((inputValue) => {
    const term = inputValue.toLowerCase();
    const result = clientsByServices.filter((cliente) => {
      const nombre = cliente.persona?.nombre || '';
      const apellido = cliente.persona?.apellido || '';
      const fullName = `${nombre} ${apellido}`.toLowerCase();
      const dni = cliente.persona?.dni?.toString() || '';
      return fullName.includes(term) || dni.includes(term);
    });
    setFilteredClientes(result);    
  }, [clientsByServices]);

  // Opciones para el select (React-Select)
  const clienteOptions = filteredClientes.map((cliente) => ({
    value: cliente.id,
    label: `${cliente.persona?.nombre || ''} ${cliente.persona?.apellido || ''} - DNI: ${cliente.persona?.dni || ''}`,
  }));

  // Cuando se elige un cliente en el Select
  const handleClienteSelect = async (selectedOption) => {
    if (!selectedOption) {
      handleReset();
      return;
    }
    const cliente = filteredClientes.find((c) => c.id === selectedOption.value);
    setSelectedCliente(cliente);
    try {
      const clienteData = await fetchClienteById(cliente.id);
      if (!Array.isArray(clienteData) || clienteData.length === 0) {
        throw new Error("Formato de datos incorrecto");
      }
      setClienteDatos(clienteData[0]);

      const tributosMapLocal = {};
      clienteData[0].forEach((periodo) => {
        const tributoId = periodo.tributo_id;
        const tributoNombre = periodo.tributo?.nombre || "Sin nombre";
        const servicio = periodo.servicio;
        if (!tributosMapLocal[tributoId]) {
          tributosMapLocal[tributoId] = {
            id: tributoId,
            nombre: tributoNombre,
            servicios: [],
          };
        }
        if (servicio) {
          const exists = tributosMapLocal[tributoId].servicios.some(
            (s) => s.id === servicio.id
          );
          if (!exists) {
            tributosMapLocal[tributoId].servicios.push(servicio);
          }
        }
      });
      setTributosMap(Object.values(tributosMapLocal));
      setServicios([]);
      setSelectedTributo(null);
      setSelectedServicio(null);
      setPeriodos([]);
    } catch (error) {
      console.error("Error al procesar los datos del cliente:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al obtener los datos del cliente.",
      });
    }
  };

  // Selección de tributo
  const handleTributoSelect = (e) => {
    const tributoId = e.target.value;
    const tributo = tributosMap.find((t) => t.id === parseInt(tributoId, 10));
    setSelectedTributo(tributoId);
    setServicios(tributo ? tributo.servicios : []);
    setSelectedServicio(null);
    setPeriodos([]);
  };

  // Selección de servicio y obtención de períodos
  const handleServicioSelect = async (e) => {
    const servicioId = parseInt(e.target.value, 10);
    const servicio = servicios.find((s) => s.id === servicioId);
    setSelectedServicio(servicio);
    if (selectedCliente && servicio && selectedTributo) {
      setLoadingPeriodos(true);
      try {
        const tributoIdNumber = parseInt(selectedTributo, 10);
        let filteredPeriodos = clienteDatos
          .filter(
            (periodo) =>
              parseInt(periodo.servicio_id, 10) === servicio.id &&
              parseInt(periodo.tributo_id, 10) === tributoIdNumber
          )
          .map((periodo) => ({
            ...periodo,
            i_debito: parseFloat(periodo.i_debito) || 0,
            i_descuento: parseFloat(periodo.i_descuento) || 0,
            i_recargo_actualizado:
              parseFloat(periodo.i_recargo_actualizado || periodo.i_recargo) || 0,
            total:
              (parseFloat(periodo.i_debito) || 0) -
              (parseFloat(periodo.i_descuento) || 0) +
              (parseFloat(periodo.i_recargo_actualizado) || 0),
          }));
        // Filtrar según user.services
        if (Array.isArray(user?.services) && user.services.length > 0) {
          filteredPeriodos = filteredPeriodos.filter((p) =>
            user.services.includes(parseInt(p.servicio_id, 10))
          );
        } else {
          filteredPeriodos = [];
        }
        setPeriodos(filteredPeriodos);
      } catch (error) {
        console.error("Error al obtener los períodos:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Hubo un problema al obtener los períodos.",
        });
      } finally {
        setLoadingPeriodos(false);
      }
    } else if (!selectedTributo) {
      Swal.fire({
        icon: "warning",
        title: "Tributo no seleccionado",
        text: "Por favor, seleccione un tributo antes de seleccionar un servicio.",
      });
    }
  };

  // Reiniciar la selección y limpiar datos
  const handleReset = () => {
    setSelectedCliente(null);
    setFilteredClientes(clientsByServices);
    setSelectedTributo(null);
    setServicios([]);
    setSelectedServicio(null);
    setPeriodos([]);
    setClienteDatos([]);
  };

  // Editar Período
  const handleEdit = useCallback((periodo) => {
    setSelectedPeriodo(periodo);
    setShowEditModal(true);
  }, []);

  // Confirmar edición
  const handleUpdatePeriodo = useCallback(async (updatedPeriodo) => {
    try {
      await customFetch(`/cuentas/${updatedPeriodo.id}`, 'PUT', updatedPeriodo);
      setPeriodos((prev) =>
        prev.map((p) => (p.id === updatedPeriodo.id ? updatedPeriodo : p))
      );
      setShowEditModal(false);
      Swal.fire('Éxito', 'Periodo modificado exitosamente.', 'success');
    } catch (error) {
      console.error('Error al modificar periodo:', error);
      Swal.fire('Error', 'Hubo un problema al modificar el periodo.', 'error');
    }
  }, []);

  // Eliminar Período
  const handleDelete = useCallback(async (id) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción no se puede deshacer. ¿Deseas eliminar este período?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      });
      if (result.isConfirmed) {
        await customFetch(`/cuentas/${id}`, 'DELETE');
        setPeriodos((prev) => prev.filter((p) => p.id !== id));
        Swal.fire('Eliminado!', 'El período ha sido eliminado.', 'success');
      }
    } catch (error) {
      console.error('Error al eliminar periodo:', error);
      Swal.fire('Error', 'Hubo un problema al eliminar el período.', 'error');
    }
  }, []);

  // Columnas para react-table
  const columns = React.useMemo(
    () => [
      {
        Header: 'Mes',
        accessor: 'mes',
        Filter: DefaultColumnFilter,
      },
      {
        Header: 'Año',
        accessor: 'año',
        Filter: DefaultColumnFilter,
      },
      {
        Header: 'Cuota',
        accessor: 'cuota',
        Filter: DefaultColumnFilter,
      },
      {
        Header: 'Volumen',
        accessor: 'cantidad',
        Filter: DefaultColumnFilter,
      },
      {
        Header: 'Importe',
        accessor: 'i_debito',
        Cell: ({ value }) => `$ ${value.toFixed(2)}`,
        Filter: DefaultColumnFilter,
      },
      {
        Header: 'Descuento',
        accessor: 'i_descuento',
        Cell: ({ value }) => `$ ${value.toFixed(2)}`,
        Filter: DefaultColumnFilter,
      },
      {
        Header: 'Recargo',
        accessor: 'i_recargo_actualizado',
        Cell: ({ value }) => `$ ${value.toFixed(2)}`,
        Filter: DefaultColumnFilter,
      },
      {
        Header: 'Total',
        accessor: 'total',
        Cell: ({ value }) => `$ ${value.toFixed(2)}`,
        Filter: DefaultColumnFilter,
      },
      {
        Header: 'Vencimiento',
        accessor: 'f_vencimiento',
        Cell: ({ value }) => (value ? new Date(value).toLocaleDateString() : 'N/A'),
        Filter: DefaultColumnFilter,
      },
      {
        Header: 'Fecha Creación',
        accessor: 'created_at',
        Cell: ({ value }) => (value ? new Date(value).toLocaleDateString() : 'N/A'),
        Filter: DefaultColumnFilter,
      },
      {
        Header: 'Recibo generado',
        accessor: 'n_recibo_generado',
        Filter: DefaultColumnFilter,
      },
      {
        Header: 'Condición',
        accessor: 'condicion_pago',
        Cell: ({ value }) => value || 'Impago',
        Filter: DefaultColumnFilter,
      },
      {
        Header: 'Fecha Pago',
        accessor: 'f_pago',
        Cell: ({ value }) => (value ? new Date(value).toLocaleDateString() : 'N/A'),
        Filter: DefaultColumnFilter,
      },
      {
        Header: 'Acciones',
        accessor: 'acciones',
        disableSortBy: true,
        disableFilters: true,
        Cell: ({ row }) => (
          <>
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id={`tooltip-edit-${row.original.id}`}>
                  Editar Período
                </Tooltip>
              }
            >
              <CustomButton
                variant="warning"
                size="sm"
                className="me-2"
                onClick={() => handleEdit(row.original)}
                aria-label={`Editar período ${row.original.id}`}
                disabled={!canEditPeriod}
              >
                <FaEdit />
              </CustomButton>
            </OverlayTrigger>
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id={`tooltip-delete-${row.original.id}`}>
                  Eliminar Período
                </Tooltip>
              }
            >
              <CustomButton
                variant="danger"
                size="sm"
                onClick={() => handleDelete(row.original.id)}
                aria-label={`Eliminar período ${row.original.id}`}
                disabled={!canDeletePeriod}
              >
                <FaTrash />
              </CustomButton>
            </OverlayTrigger>
          </>
        ),
      },
    ],
    [handleEdit, handleDelete, canEditPeriod, canDeletePeriod]
  );

  return (
    <Card className="shadow-sm p-4 mt-4">
      {/* Migas de Pan */}
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
          Inicio
        </Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/facturacion" }}>
          Facturación
        </Breadcrumb.Item>
        <Breadcrumb.Item active>Historial de Períodos</Breadcrumb.Item>
      </Breadcrumb>

      <h2 className="text-center mb-4 text-primary">Historial de Períodos</h2>

      {/* Formulario de búsqueda y selección */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          {/* Búsqueda de cliente */}
          <Form.Group controlId="cliente" className="mb-3">
            <Form.Label>Buscar Cliente</Form.Label>
            <Select
              components={animatedComponents}
              isDisabled={!canShowClients}
              value={
                selectedCliente
                  ? {
                      value: selectedCliente.id,
                      label: `${selectedCliente.persona?.nombre || ''} ${selectedCliente.persona?.apellido || ''} - DNI: ${selectedCliente.persona?.dni || ''}`
                    }
                  : null
              }
              onChange={handleClienteSelect}
              onInputChange={handleSearchChange}
              options={clienteOptions}
              placeholder="Ingresa nombre o DNI/CUIT del Cliente"
              isClearable
              isSearchable
              aria-label="Buscar Cliente"
            />
          </Form.Group>

          {/* Selección de tributo */}
          {selectedCliente && (
            <Form.Group controlId="tributo" className="mb-3">
              <Form.Label>Seleccionar Tributo</Form.Label>
              <Form.Control
                as="select"
                value={selectedTributo || ""}
                onChange={handleTributoSelect}
                aria-label="Seleccionar Tributo"
                disabled={!canShowTributos}
              >
                <option value="">Seleccione un tributo</option>
                {tributosMap.map((tributo) => (
                  <option key={tributo.id} value={tributo.id}>
                    {tributo.nombre}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          )}

          {/* Selección de servicio */}
          {selectedTributo && (
            <Form.Group controlId="servicio" className="mb-3">
              <Form.Label>Seleccionar Servicio</Form.Label>
              <Form.Control
                as="select"
                value={selectedServicio?.id || ""}
                onChange={handleServicioSelect}
                aria-label="Seleccionar Servicio"
                disabled={!canShowServices}
              >
                <option value="">Seleccione un servicio</option>
                {servicios.map((serv) => (
                  <option key={serv.id} value={serv.id}>
                    {serv.nombre}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          )}
        </Card.Body>
      </Card>

      {/* Tabla de períodos usando CommonTable o Spinner si se está cargando */}
      {selectedServicio && (
        <>
          {loadingPeriodos ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </Spinner>
            </div>
          ) : (
            <CommonTable columns={columns} data={periodos} />
          )}

          {/* Modal de edición */}
          <EditPeriodoModal
            show={showEditModal}
            handleClose={() => setShowEditModal(false)}
            periodo={selectedPeriodo}
            handleSubmit={handleUpdatePeriodo}
          />

          {/* Botón para limpiar datos */}
          <div className="text-center mt-4">
            <Button variant="outline-secondary" onClick={handleReset}>
              Limpiar Datos
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};

export default PeriodosHistorial;
