import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import {
  Card,
  Spinner,
  Breadcrumb,
  Form,
  OverlayTrigger,
  Tooltip,
  Badge,
} from "react-bootstrap";
import Swal from "sweetalert2";
import { FacturacionContext } from "../../../../context/FacturacionContext";
import { AuthContext } from "../../../../context/AuthContext.jsx";
import CommonTable from "../../../../components/common/table/table.jsx";
import customFetch from "../../../../context/CustomFetch.js";
import { FaTrash } from "react-icons/fa";
import CustomButton from "../../../../components/common/botons/CustomButton.jsx";
import { Link } from "react-router-dom";
import ClientSearch from "../../../../components/common/clienteSearch/ClientSearch.jsx";
import { ClientContext } from "../../../../context/ClientContext";

const PAGE_SIZE_OPTIONS = [15, 30, 45, 60];

const RecibosHistorial = () => {
  const {
    fetchClienteById,
    fetchRecibosByCliente,
    condicionesPago,
  } = useContext(FacturacionContext);
  const { user } = useContext(AuthContext);
  const { searchClients } = useContext(ClientContext);

  const canShowClients = user?.permissions.includes("recibos.show.cliente");
  const canDeleteRecibo = user?.permissions.includes("recibos.destroy");
  const canShowTributo = user?.permissions.includes("tributos.show.cliente");
  const canShowServicio = user?.permissions.includes("servicios.show.cliente");

  // Estado
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [tributosMap, setTributosMap] = useState([]);
  const [selectedTributo, setSelectedTributo] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [selectedServicio, setSelectedServicio] = useState(null);
  const [recibos, setRecibos] = useState([]);
  const [loadingRecibos, setLoadingRecibos] = useState(false);

  // Paginación
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const totalPages = Math.ceil(recibos.length / pageSize);

  const fetchPage = useCallback(({ page, per_page }) => {
    setPageIndex(page - 1);
    setPageSize(per_page);
  }, []);

  const currentPageData = useMemo(() => {
    const start = pageIndex * pageSize;
    return recibos.slice(start, start + pageSize);
  }, [recibos, pageIndex, pageSize]);

  // Al seleccionar cliente
  useEffect(() => {
    if (!selectedCliente) return;
    (async () => {
      try {
        const data = await fetchClienteById(selectedCliente.id);
        const arr = Array.isArray(data) ? data[0] : [];
        if (!arr || arr.length === 0) {
          setTributosMap([]);
          setSelectedTributo(null);
          setServicios([]);
          setSelectedServicio(null);
          setRecibos([]);
          return;
        }
        // Map tributos y servicios
        const map = {};
        arr.forEach((e) => {
          const tId = e.tributo_id;
          if (!map[tId]) {
            map[tId] = {
              id: tId,
              nombre: e.tributo?.nombre || "Sin nombre",
              servicios: [],
            };
          }
          if (e.servicio && !map[tId].servicios.some((s) => s.id === e.servicio.id)) {
            map[tId].servicios.push(e.servicio);
          }
        });
        setTributosMap(Object.values(map));
        setServicios([]);
        setSelectedTributo(null);
        setSelectedServicio(null);
        setRecibos([]);
      } catch {
        Swal.fire("Error", "No se pudieron cargar los datos del cliente.", "error");
      }
    })();
  }, [selectedCliente, fetchClienteById]);

  // Selección de tributo
  const handleTributoSelect = e => {
    const id = parseInt(e.target.value, 10);
    setSelectedTributo(id);
    const tributo = tributosMap.find((t) => t.id === id);
    setServicios(tributo?.servicios || []);
    setSelectedServicio(null);
    setRecibos([]);
  };

  // Selección de servicio → cargar recibos
  const handleServicioSelect = async (e) => {
    const id = parseInt(e.target.value, 10);
    const serv = servicios.find((s) => s.id === id);
    setSelectedServicio(serv);
    if (!selectedCliente || !selectedTributo) return;
    setLoadingRecibos(true);
    try {
      const all = await fetchRecibosByCliente(selectedCliente.id);
      // Si querés filtrar local por tributo y servicio (ajusta según tu API)
      const recibosFiltrados = Array.isArray(all)
        ? all.filter(r =>
            (!r.servicio_id || r.servicio_id === id) &&
            (!r.tributo_id || r.tributo_id === selectedTributo)
          )
        : [];
      setRecibos(recibosFiltrados);
      if (recibosFiltrados.length === 0) {
        Swal.fire({
          icon: "info",
          title: "Sin recibos",
          text: "Este cliente no tiene recibos para este servicio.",
          timer: 2200,
          showConfirmButton: false,
        });
      }
    } catch {
      Swal.fire("Error", "No se pudieron cargar los recibos.", "error");
    } finally {
      setLoadingRecibos(false);
    }
  };

  // Reset
  const handleReset = useCallback(() => {
    setSelectedCliente(null);
    setTributosMap([]);
    setSelectedTributo(null);
    setServicios([]);
    setSelectedServicio(null);
    setRecibos([]);
  }, []);

  // Anulación de recibo
  const handleAnular = useCallback((recibo) => {
    Swal.fire({
      title: "Anular Recibo",
      text: "Ingresa el motivo de la anulación:",
      input: "text",
      inputPlaceholder: "Motivo",
      showCancelButton: true,
      confirmButtonText: "Anular",
      preConfirm: (motivo) => {
        if (!motivo) Swal.showValidationMessage("El motivo es obligatorio");
        return motivo;
      },
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await customFetch("/recibos/anular", "POST", {
            recibo: recibo.n_recibo,
            comentario: res.value,
          });
          setRecibos((prev) => prev.filter((r) => r.id !== recibo.id));
          Swal.fire("Anulado", "El recibo ha sido anulado.", "success");
        } catch {
          Swal.fire("Error", "No se pudo anular el recibo.", "error");
        }
      }
    });
  }, []);

  // Columnas de la tabla
  const columns = useMemo(
    () => [
      { Header: "N° Recibo", accessor: "n_recibo" },
      { Header: "Emisor", accessor: "emisor", Cell: ({ value }) => value?.name || "N/A" },
      {
        Header: "Débito",
        accessor: "i_debito",
        Cell: ({ value }) => `$ ${parseFloat(value || 0).toFixed(2)}`
      },
      {
        Header: "Recargo",
        accessor: "i_recargo",
        Cell: ({ value }) => `$ ${parseFloat(value || 0).toFixed(2)}`
      },
      {
        Header: "Total",
        accessor: "i_total",
        Cell: ({ value }) => `$ ${parseFloat(value || 0).toFixed(2)}`
      },
      {
        Header: "Vencimiento",
        accessor: "f_vencimiento",
        Cell: ({ value }) => value ? new Date(value).toLocaleDateString() : "N/A"
      },
      {
        Header: "Condición",
        accessor: "condicion_pago_id",
        Cell: ({ value }) => {
          const c = condicionesPago.find((x) => x.id === value);
          return c?.nombre || "Impago";
        }
      },
      {
        Header: "Fecha Pago",
        accessor: "f_pago",
        Cell: ({ value }) => value ? new Date(value).toLocaleDateString() : "N/A"
      },
      { Header: "Cajero", accessor: "cajero", Cell: ({ value }) => value?.name || "N/A" },
      {
        Header: "Estado",
        id: "estado",
        Cell: ({ row }) =>
          row.original.f_pago ? (
            <Badge bg="success">Pagado</Badge>
          ) : (
            <Badge bg="danger">Impago</Badge>
          ),
      },
      {
        Header: "Acciones",
        id: "acciones",
        Cell: ({ row }) => (
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Anular recibo</Tooltip>}
          >
            <CustomButton
              variant="danger"
              size="sm"
              onClick={() => handleAnular(row.original)}
              disabled={!canDeleteRecibo}
            >
              <FaTrash />
            </CustomButton>
          </OverlayTrigger>
        )
      }
    ],
    [condicionesPago, canDeleteRecibo, handleAnular]
  );

  // Render
  return (
    <Card className="shadow-sm p-4 mt-4">
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
          Inicio
        </Breadcrumb.Item>
        <Breadcrumb.Item>Facturación</Breadcrumb.Item>
        <Breadcrumb.Item active>Historial de Recibos</Breadcrumb.Item>
      </Breadcrumb>

      <h2 className="text-center mb-2 text-primary">Historial de Recibos</h2>
      <h5 className="text-center mb-4 text-primary">
        Seleccioná un cliente y un tributo para ver sus recibos
      </h5>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          {/* Buscador de cliente reutilizable */}
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

          {/* Tributo */}
          {selectedCliente && (
            <Form.Group controlId="tributo" className="mb-3">
              <Form.Label>Seleccionar Tributo</Form.Label>
              <Form.Select
                value={selectedTributo || ""}
                onChange={handleTributoSelect}
                disabled={!canShowTributo}
              >
                <option value="">-- elige un tributo --</option>
                {tributosMap.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          {/* Servicio */}
          {selectedTributo && (
            <Form.Group controlId="servicio" className="mb-3">
              <Form.Label>Seleccionar Servicio</Form.Label>
              <Form.Select
                value={selectedServicio?.id || ""}
                onChange={handleServicioSelect}
                disabled={!canShowServicio}
              >
                <option value="">-- elige un servicio --</option>
                {servicios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}
        </Card.Body>
      </Card>

      {/* Tabla de recibos */}
      {selectedServicio && (
        loadingRecibos ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-between mb-3">
              <small className="text-muted">
                Total recibos: {recibos.length}
              </small>
              <CustomButton variant="outline-secondary" onClick={handleReset}>
                Limpiar Filtros
              </CustomButton>
            </div>
            <CommonTable
              columns={columns}
              data={currentPageData}
              loading={loadingRecibos}
              fetchData={fetchPage}
              controlledPageCount={totalPages}
              initialPageIndex={pageIndex}
              initialPageSize={pageSize}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
            />
          </>
        )
      )}
    </Card>
  );
};

export default RecibosHistorial;
