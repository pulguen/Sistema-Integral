import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import {
  Card,
  Breadcrumb,
  Form,
  OverlayTrigger,
  Tooltip,
  Spinner,
} from "react-bootstrap";
import Swal from "sweetalert2";
import { FacturacionContext } from "../../../../context/FacturacionContext";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import CustomButton from "../../../../components/common/botons/CustomButton.jsx";
import EditPeriodoModal from "../../../../components/common/modals/EditPeriodoModal.jsx";
import customFetch from "../../../../context/CustomFetch.js";
import { AuthContext } from "../../../../context/AuthContext.jsx";
import CommonTable from "../../../../components/common/table/table.jsx";
import ClientSearch from "../../../../components/common/clienteSearch/ClientSearch.jsx";
import { ClientContext } from "../../../../context/ClientContext";

const PAGE_SIZE_OPTIONS = [15, 30, 45, 60];

function DefaultColumnFilter({ column: { filterValue, setFilter } }) {
  return (
    <input
      value={filterValue || ""}
      onChange={e => setFilter(e.target.value || undefined)}
      placeholder="Buscar..."
      style={{ width: "100%" }}
      aria-label="Filtro de columna"
    />
  );
}

export default function PeriodosHistorial() {
  const { fetchClienteById, condicionesPago } = useContext(FacturacionContext);
  const { user } = useContext(AuthContext);
  const { searchClients } = useContext(ClientContext);

  // permisos
  const canShowClients = user?.permissions.includes("cuentas.show.cliente");
  const canEditPeriod = user?.permissions.includes("cuentas.update");
  const canDeletePeriod = user?.permissions.includes("cuentas.destroy");
  const canShowTributos = user?.permissions.includes("tributos.show.cliente");
  const canShowServices = user?.permissions.includes("servicios.show.cliente");

  // Estados principales
  const [selectedCliente, setSelectedCliente] = useState(null);

  const [tributosMap, setTributosMap] = useState([]);
  const [selectedTributo, setSelectedTributo] = useState(null);

  const [servicios, setServicios] = useState([]);
  const [selectedServicio, setSelectedServicio] = useState(null);

  // Periodos y loading
  const [periodos, setPeriodos] = useState([]);
  const [loadingPeriodos, setLoadingPeriodos] = useState(false);

  // Edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPeriodo, setSelectedPeriodo] = useState(null);

  // Al seleccionar un cliente, cargar sus tributos y servicios
useEffect(() => {
  if (!selectedCliente) return;
  (async () => {
    try {
      const resp = await fetchClienteById(selectedCliente.id);
      const arr = Array.isArray(resp) ? resp[0] : [];

      // Si no hay periodos, simplemente resetear los selects y salir (NO es un error)
      if (!arr || arr.length === 0) {
        setTributosMap([]);
        setSelectedTributo(null);
        setServicios([]);
        setSelectedServicio(null);
        setPeriodos([]);
        Swal.fire({
          icon: "info",
          title: "Sin períodos",
          text: "Este cliente no tiene períodos registrados.",
          timer: 2500,
          showConfirmButton: false
        });
        return;
      }

      // Normal: procesar tributos/servicios como antes
      const map = {};
      arr.forEach(p => {
        if (!map[p.tributo_id]) {
          map[p.tributo_id] = {
            id: p.tributo_id,
            nombre: p.tributo?.nombre || "Sin nombre",
            servicios: [],
          };
        }
        if (
          p.servicio &&
          !map[p.tributo_id].servicios.some(s => s.id === p.servicio.id)
        ) {
          map[p.tributo_id].servicios.push(p.servicio);
        }
      });
      setTributosMap(Object.values(map));
      setSelectedTributo(null);
      setServicios([]);
      setSelectedServicio(null);
      setPeriodos([]);
    } catch (err) {
      // Error real en la request
      Swal.fire(
        "Error",
        "No se pudieron cargar los datos del cliente.",
        "error"
      );
    }
  })();
}, [selectedCliente, fetchClienteById]);


  // Al seleccionar tributo, cargar servicios
  const handleTributoSelect = e => {
    const id = Number(e.target.value);
    setSelectedTributo(id);
    const t = tributosMap.find(x => x.id === id);
    setServicios(t?.servicios || []);
    setSelectedServicio(null);
    setPeriodos([]);
  };

  // Cargar periodos del cliente, filtrados por servicio y tributo
  const [clienteDatos, setClienteDatos] = useState([]);
  useEffect(() => {
    if (!selectedCliente) return;
    (async () => {
      try {
        const resp = await fetchClienteById(selectedCliente.id);
        const arr = Array.isArray(resp) ? resp[0] : [];
        setClienteDatos(arr);
      } catch {}
    })();
  }, [selectedCliente, fetchClienteById]);

  const handleServicioSelect = e => {
    const id = Number(e.target.value);
    setSelectedServicio(id);
    setLoadingPeriodos(true);
    const tp = clienteDatos
      .filter(
        p =>
          p.servicio_id === id &&
          p.tributo_id === selectedTributo &&
          user.services.includes(p.servicio_id)
      )
      .map(p => ({
        ...p,
        i_debito: +p.i_debito || 0,
        i_descuento: +p.i_descuento || 0,
        i_recargo_actualizado: +p.i_recargo_actualizado || +p.i_recargo || 0,
        total:
          (+p.i_debito || 0) -
          (+p.i_descuento || 0) +
          (+p.i_recargo_actualizado || +p.i_recargo || 0),
      }));
    setPeriodos(tp);
    setLoadingPeriodos(false);
  };

  // Reset completo
  const handleReset = () => {
    setSelectedCliente(null);
    setTributosMap([]);
    setSelectedTributo(null);
    setServicios([]);
    setSelectedServicio(null);
    setPeriodos([]);
  };

  // CRUD
  const handleEdit = useCallback(p => {
    setSelectedPeriodo(p);
    setShowEditModal(true);
  }, []);
  const handleUpdatePeriodo = useCallback(
    async upd => {
      await customFetch(`/cuentas/${upd.id}`, "PUT", upd);
      setPeriodos(prev => prev.map(x => (x.id === upd.id ? upd : x)));
      setShowEditModal(false);
      Swal.fire("Éxito", "Período actualizado.", "success");
    },
    []
  );
  const handleDelete = useCallback(
    async id => {
      const { isConfirmed } = await Swal.fire({
        title: "Confirmar",
        text: "¿Eliminar este período?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí",
      });
      if (!isConfirmed) return;
      await customFetch(`/cuentas/${id}`, "DELETE");
      setPeriodos(prev => prev.filter(x => x.id !== id));
      Swal.fire("Eliminado", "Período eliminado.", "success");
    },
    []
  );

  // Columnas de la tabla
  const columns = useMemo(
    () => [
      { Header: "Mes", accessor: "mes", Filter: DefaultColumnFilter },
      { Header: "Año", accessor: "año", Filter: DefaultColumnFilter },
      { Header: "Cuota", accessor: "cuota", Filter: DefaultColumnFilter },
      { Header: "Volumen", accessor: "cantidad", Filter: DefaultColumnFilter },
      {
        Header: "Importe",
        accessor: "i_debito",
        Filter: DefaultColumnFilter,
        Cell: ({ value }) => `$ ${value.toFixed(2)}`,
      },
      {
        Header: "Descuento",
        accessor: "i_descuento",
        Filter: DefaultColumnFilter,
        Cell: ({ value }) => `$ ${value.toFixed(2)}`,
      },
      {
        Header: "Recargo",
        accessor: "i_recargo_actualizado",
        Filter: DefaultColumnFilter,
        Cell: ({ value }) => `$ ${value.toFixed(2)}`,
      },
      {
        Header: "Total",
        accessor: "total",
        Filter: DefaultColumnFilter,
        Cell: ({ value }) => `$ ${value.toFixed(2)}`,
      },
      {
        Header: "Vencimiento",
        accessor: "f_vencimiento",
        Filter: DefaultColumnFilter,
        Cell: ({ value }) =>
          value ? new Date(value).toLocaleDateString() : "N/A",
      },
      {
        Header: "Fecha creación",
        accessor: "created_at",
        Filter: DefaultColumnFilter,
        Cell: ({ value }) =>
          value ? new Date(value).toLocaleDateString() : "N/A",
      },
      {
        Header: "Recibo gen.",
        accessor: "n_recibo_generado",
        Filter: DefaultColumnFilter,
      },
      {
        Header: "Condición",
        accessor: "condicion_pago_id",
        Filter: DefaultColumnFilter,
        Cell: ({ row }) => {
          const id = row.original.condicion_pago_id;
          const c = condicionesPago.find(x => x.id === id);
          return c ? c.nombre : "Impago";
        },
      },
      {
        Header: "Fecha Pago",
        accessor: "f_pago",
        Filter: DefaultColumnFilter,
        Cell: ({ value }) =>
          value ? new Date(value).toLocaleDateString() : "N/A",
      },
      {
        Header: "Acciones",
        id: "acciones",
        disableSortBy: true,
        disableFilters: true,
        Cell: ({ row }) => (
          <>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id={`ed-${row.original.id}`}>Editar</Tooltip>}
            >
              <CustomButton
                variant="warning"
                size="sm"
                className="me-2"
                onClick={() => handleEdit(row.original)}
                disabled={!canEditPeriod || Boolean(row.original.f_pago)}
              >
                <FaEdit />
              </CustomButton>
            </OverlayTrigger>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id={`del-${row.original.id}`}>Eliminar</Tooltip>}
            >
              <CustomButton
                variant="danger"
                size="sm"
                onClick={() => handleDelete(row.original.id)}
                disabled={!canDeletePeriod || Boolean(row.original.f_pago)}
              >
                <FaTrash />
              </CustomButton>
            </OverlayTrigger>
          </>
        ),
      },
    ],
    [
      condicionesPago,
      canEditPeriod,
      canDeletePeriod,
      handleEdit,
      handleDelete,
    ]
  );

  // PAGINACIÓN tabla (cliente-side)
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const totalPages = Math.ceil(periodos.length / pageSize);

  const currentPageData = useMemo(() => {
    const start = pageIndex * pageSize;
    return periodos.slice(start, start + pageSize);
  }, [periodos, pageIndex, pageSize]);

  const fetchPage = useCallback(({ page, per_page }) => {
    setPageIndex(page - 1);
    setPageSize(per_page);
  }, []);

  // ------------------------------------
  // RENDER
  // ------------------------------------
  return (
    <Card className="shadow-sm p-4 mt-4">
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
          Inicio
        </Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/facturacion" }}>
          Facturación
        </Breadcrumb.Item>
        <Breadcrumb.Item active>Historial de Períodos</Breadcrumb.Item>
      </Breadcrumb>

      <h2 className="text-center mb-2 text-primary">
        Historial de Períodos
      </h2>
      <h5 className="text-center mb-4 text-primary">
        Seleccioná un cliente y un tributo para ver sus períodos
      </h5>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          {/* --- Cliente --- */}
          <Form.Group controlId="cliente" className="mb-3">
            <Form.Label>Buscar Cliente</Form.Label>
              <ClientSearch
                searchClients={searchClients}
                onClientSelect={cli => setSelectedCliente(cli)}
                servicesAllowed={user?.services ?? []}
                placeholder="Buscar clientes por DNI, nombre o apellido..."
                disabled={!canShowClients}
              />
          </Form.Group>

          {/* --- Tributo --- */}
          {selectedCliente && (
            <Form.Group controlId="tributo" className="mb-3">
              <Form.Label>Seleccionar Tributo</Form.Label>
              <Form.Select
                value={selectedTributo || ""}
                onChange={handleTributoSelect}
                disabled={!canShowTributos}
              >
                <option value="">-- elige un tributo --</option>
                {tributosMap.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          {/* --- Servicio --- */}
          {selectedTributo && (
            <Form.Group controlId="servicio" className="mb-3">
              <Form.Label>Seleccionar Servicio</Form.Label>
              <Form.Select
                value={selectedServicio || ""}
                onChange={handleServicioSelect}
                disabled={!canShowServices}
              >
                <option value="">-- elige un servicio --</option>
                {servicios.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}
        </Card.Body>
      </Card>

      {/* --- Tabla con paginación --- */}
        {selectedServicio && (
          loadingPeriodos ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-between mb-3">
                <small className="text-muted">
                  Total registros: {periodos.length}
                </small>
                <CustomButton variant="outline-secondary" onClick={handleReset}>
                  Limpiar Filtros
                </CustomButton>
              </div>

              <CommonTable
                columns={columns}
                data={currentPageData}
                loading={loadingPeriodos}
                fetchData={fetchPage}
                controlledPageCount={totalPages}
                initialPageIndex={pageIndex}
                initialPageSize={pageSize}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                emptyMessage="No hay períodos para este cliente y servicio."
              />
            </>
          )
        )}

      <EditPeriodoModal
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        periodo={selectedPeriodo}
        handleSubmit={handleUpdatePeriodo}
      />
    </Card>
  );
}
