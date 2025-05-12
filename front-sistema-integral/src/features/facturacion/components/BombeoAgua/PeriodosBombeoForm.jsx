// src/features/facturacion/components/BombeoAgua/PeriodosBombeoForm.jsx

import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { Form, Card, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarCheck } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import customFetch from "../../../../context/CustomFetch.js";
import { BombeoAguaContext } from "../../../../context/BombeoAguaContext.jsx";
import { FacturacionContext } from "../../../../context/FacturacionContext";
import { transformarCliente } from "../../../../utils/clienteUtils.js";
import ClientSearch from "./ClientSearch";
import NewPeriodoForm from "./NewPeriodoForm";
import CommonTable from "../../../../components/common/table/table.jsx";
import "../../../../styles/PeriodosBombeoForm.css";

const BATCH_SIZE = 15;
const PAGE_SIZE_OPTIONS = [15, 30, 45, 60];
const TRIBUTO_ID = 1;

// Convierte nombre de mes a número
const monthNameToNumber = (monthName) => {
  const map = {
    Enero: 1, Febrero: 2, Marzo: 3, Abril: 4,
    Mayo: 5, Junio: 6, Julio: 7, Agosto: 8,
    Septiembre: 9, Octubre: 10, Noviembre: 11, Diciembre: 12,
  };
  return map[monthName] || 0;
};

export default function PeriodosBombeoForm() {
  const { moduleValue, condicionesPago: paymentConditions } = useContext(FacturacionContext);
  const { handleCreatePeriodo } = useContext(BombeoAguaContext);

  // Formatea YYYY-MM-DD a DD/MM/YYYY
  const formatDDMMYYYY = useCallback((isoDate) => {
    if (!isoDate) return "Sin fecha";
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
  }, []);

  // — BÚSQUEDA Y PAGINACIÓN DE CLIENTES —
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [showClientList, setShowClientList] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchClientsPage = useCallback(async (pageNum = 1) => {
    setLoadingClients(true);
    try {
      const res = await customFetch(`/clientes?page=${pageNum}&per_page=${BATCH_SIZE}`);
      const raw = Array.isArray(res.data) ? res.data : [];
      const filtered = raw
        .map(transformarCliente)
        .filter(c => c.servicios?.some(s => s.tributo_id === TRIBUTO_ID));
      setClients(prev => pageNum === 1 ? filtered : [...prev, ...filtered]);
      setPage(pageNum);
      setPageCount(res.last_page || 1);
      setShowClientList(true);
    } catch (err) {
      console.error("Error cargando clientes:", err);
    } finally {
      setLoadingClients(false);
    }
  }, []);

  useEffect(() => {
    fetchClientsPage(1);
  }, [fetchClientsPage]);

  const onClientListScroll = e => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (
      scrollTop + clientHeight >= scrollHeight - 10 &&
      page < pageCount &&
      !loadingClients
    ) {
      fetchClientsPage(page + 1);
    }
  };

  useEffect(() => {
    const handler = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowClientList(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayedClients = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter(c => {
      const fullName = `${c.persona.nombre} ${c.persona.apellido}`.toLowerCase();
      const dni = (c.persona.dni || "").toLowerCase();
      return fullName.includes(term) || dni.includes(term);
    });
  }, [clients, searchTerm]);

  // — SELECCIÓN DE CLIENTE Y CARGA DE HISTORIAL —
  const [clientId, setClientId] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [periodos, setPeriodos] = useState([]);
  const [loadingPeriodos, setLoadingPeriodos] = useState(false);
  const [filteredServices, setFilteredServices] = useState([]);
  const [service, setService] = useState("");
  const [moduleRate, setModuleRate] = useState(0);

  const handleClientSelect = useCallback(async id => {
    const cli = clients.find(c => c.id === id);
    if (!cli) return;
    setClientId(id);
    setSelectedClient(cli);
    setShowClientList(false);
    setSearchTerm(`${cli.persona.nombre} ${cli.persona.apellido}`);

    const svs = cli.servicios.filter(s => s.tributo_id === TRIBUTO_ID);
    setFilteredServices(svs);
    if (svs.length === 1) {
      setService(svs[0].id);
      setModuleRate(svs[0].modulos);
    }

    setLoadingPeriodos(true);
    try {
      const [data] = await customFetch(`/cuentas/cliente/${id}`);
      const arr = Array.isArray(data) ? data : [];
      setPeriodos(
        arr.map(p => {
          const d  = parseFloat(p.i_debito) || 0;
          const ds = parseFloat(p.i_descuento) || 0;
          const r  = parseFloat(p.i_recargo_actualizado ?? p.i_recargo ?? 0) || 0;
          return { ...p, i_recargo_actualizado: r, total: d - ds + r };
        })
      );
      if (arr.length === 0) {
        Swal.fire("Sin períodos", "No hay períodos para este cliente.", "info");
      }
    } catch (err) {
      console.error("Error cargando períodos:", err);
      Swal.fire("Error", "No se pudieron cargar los períodos.", "error");
    } finally {
      setLoadingPeriodos(false);
    }
  }, [clients]);

  // — NUEVO PERÍODO Y TOTALES —
  const [volume, setVolume] = useState("");
  const [cuota, setCuota] = useState(1);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [vencimiento, setVencimiento] = useState("");
  const [totalModules, setTotalModules] = useState(0);
  const [totalInPesos, setTotalInPesos] = useState(0);

  useEffect(() => {
    const v = parseFloat(volume) || 0;
    const mods = moduleRate * v;
    setTotalModules(mods);
    setTotalInPesos(mods * (parseFloat(moduleValue) || 1));
  }, [volume, moduleRate, moduleValue]);

  const handleClientClear = () => {
    setClientId(null);
    setSelectedClient(null);
    setPeriodos([]);
    setFilteredServices([]);
    setService("");
    setModuleRate(0);
  };

  const handleReset = () => {
    handleClientClear();
    setSearchTerm("");
    setVolume("");
    setCuota(1);
    setMonth("");
    setYear(new Date().getFullYear());
    setVencimiento("");
    setTotalModules(0);
    setTotalInPesos(0);
    setShowClientList(true);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!selectedClient) {
      return Swal.fire("Error", "Seleccioná un cliente.", "error");
    }
    if (!(parseFloat(volume) > 0)) {
      return Swal.fire("Error", "Ingrese volumen válido.", "error");
    }
    if (cuota < 1) {
      return Swal.fire("Error", "La cuota debe ser >= 1.", "error");
    }
    if (!service) {
      return Swal.fire("Error", "Seleccioná un servicio.", "error");
    }

    const mesNum = monthNameToNumber(month);
    const isDup = periodos.some(p =>
      p.servicio_id === Number(service) &&
      Number(p.año) === year &&
      Number(p.mes) === mesNum &&
      Number(p.cuota) === cuota
    );
    if (isDup) {
      return Swal.fire(
        "Duplicado",
        "Ya existe un período con ese Servicio, Año, Mes y Cuota.",
        "error"
      );
    }

    handleCreatePeriodo({
      cliente_id:  clientId,
      clientName:  `${selectedClient.persona.nombre} ${selectedClient.persona.apellido}`,
      dni:         selectedClient.persona.dni || "",
      volume:      parseFloat(volume),
      servicio_id: Number(service),
      service:     filteredServices.find(s => s.id === Number(service))?.nombre || "",
      totalAmount: `AR$ ${totalInPesos.toFixed(2)}`,
      cuota,
      month,
      year,
      vencimiento,
    });

    Swal.fire("Éxito", "Período agregado a la lista para confirmar.", "success");
    handleReset();
  };

  // — CONFIGURACIÓN DE COLUMNAS PARA LA TABLA —
  const columns = useMemo(() => [
    { Header: "#",           id: "idx", accessor: (_r,i) => i+1 },
    { Header: "Mes",         accessor: "mes" },
    { Header: "Año",         accessor: "año" },
    { Header: "Cuota",       accessor: "cuota" },
    { Header: "Volumen (m³)",accessor: "cantidad" },
    { Header: "Importe",     accessor: "i_debito",              Cell: ({value}) => Number(value).toFixed(2) },
    { Header: "Descuento",   accessor: "i_descuento",           Cell: ({value}) => Number(value).toFixed(2) },
    { Header: "Recargo",     accessor: "i_recargo_actualizado", Cell: ({value}) => Number(value).toFixed(2) },
    { Header: "Total",       accessor: "total",                 Cell: ({value}) => Number(value).toFixed(2) },
    {
      Header: "Vencimiento",
      accessor: "f_vencimiento",
      Cell: ({value}) => value
        ? formatDDMMYYYY(value.split("T")[0])
        : "Sin fecha"
    },
    { Header: "Recibo Gen.", accessor: "n_recibo_generado" },
    {
      Header: "Condición Pago",
      accessor: "condicion_pago_id",
      Cell: ({value}) => {
        const cond = paymentConditions.find(c => c.id === Number(value));
        return cond ? cond.nombre : "—";
      }
    },
    {
      Header: "Fecha de Pago",
      accessor: "f_pago",
      Cell: ({value}) => value
        ? new Date(value).toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
          })
        : "No pago"
    },
  ], [formatDDMMYYYY, paymentConditions]);

  // — PAGINACIÓN CLIENTE-SIDE DE PERIODOS —
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize,  setPageSize]   = useState(PAGE_SIZE_OPTIONS[0]);
  const totalPages = Math.ceil(periodos.length / pageSize);

  const currentPageData = useMemo(() => {
    const start = pageIndex * pageSize;
    return periodos.slice(start, start + pageSize);
  }, [periodos, pageIndex, pageSize]);

  const fetchPage = useCallback(({ page, per_page }) => {
    setPageIndex(page - 1);
    setPageSize(per_page);
  }, []);

  return (
    <Card className="shadow-sm p-5 mt-4 bombeo-agua-form">
      <h2 className="text-center mb-5 text-primary">
        <FontAwesomeIcon icon={faCalendarCheck} className="me-2" />
        Generar Período de Bombeo de Agua
      </h2>

      <Form onSubmit={handleSubmit} className="px-4">
        <ClientSearch
          searchTerm={searchTerm}
          onSearchTermChange={val => {
            setSearchTerm(val);
            handleClientClear();
            setShowClientList(true);
          }}
          clients={displayedClients}
          loading={loadingClients}
          showList={showClientList}
          onScroll={onClientListScroll}
          onClientSelect={handleClientSelect}
          dropdownRef={dropdownRef}
        />

        {clientId && (
          <>
            {loadingPeriodos ? (
              <div className="text-center py-5">
                <Spinner animation="border" />
              </div>
            ) : (
              <>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <small className="text-muted">
                    Total registros: {periodos.length}
                  </small>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleReset}
                  >
                    Limpiar Filtros
                  </button>
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
                />
              </>
            )}

            <NewPeriodoForm
              volume={volume}
              onVolumeChange={setVolume}
              filteredServices={filteredServices}
              service={service}
              onServiceChange={setService}
              month={month}
              onMonthChange={setMonth}
              year={year}
              onYearChange={setYear}
              cuota={cuota}
              onCuotaChange={setCuota}
              vencimiento={vencimiento}
              onVencimientoChange={setVencimiento}
              totalModules={totalModules}
              totalInPesos={totalInPesos}
              searchTerm={`${selectedClient.persona.nombre} ${selectedClient.persona.apellido}`}
              getServiceNameById={id =>
                filteredServices.find(x => x.id === Number(id))?.nombre || ""
              }
              onSubmit={handleSubmit}
              onReset={handleReset}
              formatLocalDate={formatDDMMYYYY}
            />
          </>
        )}
      </Form>
    </Card>
  );
}
