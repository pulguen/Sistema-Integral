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
import ClientSearch from "./ClientSearch";
import NewPeriodoForm from "./NewPeriodoForm";
import CommonTable from "../../../../components/common/table/table.jsx";
import "../../../../styles/PeriodosBombeoForm.css";
import { formatDateToDMY } from "../../../../utils/dateUtils";
import ValorModuloInfo from "../../../../components/common/moduloInfo/ValorModuloInfo.jsx";
import formatNumber from "../../../../utils/formatNumber.js";

const TRIBUTO_ID = 1;
const PAGE_SIZE_OPTIONS = [15, 30, 45, 60];

const monthNameToNumber = (month) => {
  const map = {
    Enero: 1, Febrero: 2, Marzo: 3, Abril: 4,
    Mayo: 5, Junio: 6, Julio: 7, Agosto: 8,
    Septiembre: 9, Octubre: 10, Noviembre: 11, Diciembre: 12,
  };
  return map[month] || 0;
};

export default function PeriodosBombeoForm() {
  const { moduleInfo, condicionesPago: paymentConditions } = useContext(FacturacionContext);
  const {
    handleCreatePeriodo,
    clientesBombeo,
    loadingServicios,
    servicios, // <-- ahora tomamos los servicios del contexto
  } = useContext(BombeoAguaContext);

  // Formatea YYYY-MM-DD a DD/MM/YYYY
  const formatDDMMYYYY = useCallback((isoDate) => {
    if (!isoDate) return "Sin fecha";
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
  }, []);

  // — BÚSQUEDA DE CLIENTES DE BOMBEO —
  const [searchTerm, setSearchTerm] = useState("");
  const [showClientList, setShowClientList] = useState(false);
  const dropdownRef = useRef(null);

  // Filtramos en memoria los clientes por término de búsqueda
  const displayedClients = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return term === ""
      ? clientesBombeo
      : clientesBombeo.filter(c => {
          if (!c.persona) return false;
          const fullName = `${c.persona.nombre} ${c.persona.apellido}`.toLowerCase();
          const dni = (c.persona.dni || "").toLowerCase();
          return fullName.includes(term) || dni.includes(term);
        });
  }, [clientesBombeo, searchTerm]);

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    const handler = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowClientList(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // — SELECCIÓN DE CLIENTE Y CARGA DE HISTORIAL —
  const [clientId, setClientId] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [periodos, setPeriodos] = useState([]);
  const [loadingPeriodos, setLoadingPeriodos] = useState(false);
  const [filteredServices, setFilteredServices] = useState([]);
  const [service, setService] = useState("");
  const [moduleRate, setModuleRate] = useState(0);

  // -- FIX: Obtener todos los servicios asociados a este cliente --
  const handleClientSelect = useCallback(async id => {
    const cli = clientesBombeo.find(c => c.id === id);
    if (!cli) return;
    setClientId(id);
    setSelectedClient(cli);
    setShowClientList(false);
    setSearchTerm(`${cli.persona.nombre} ${cli.persona.apellido}`);

    // FIX: Buscar todos los servicios del TRIBUTO_ID asociados a este cliente
    const serviciosAsociados = servicios.filter(s =>
      s.tributo_id === TRIBUTO_ID &&
      Array.isArray(s.clientes) &&
      s.clientes.some(c2 => c2.id === cli.id)
    );
    setFilteredServices(serviciosAsociados);

    // Si hay uno solo, lo selecciona por defecto
    if (serviciosAsociados.length === 1) {
      setService(serviciosAsociados[0].id);
      setModuleRate(serviciosAsociados[0].modulos);
    } else {
      setService("");
      setModuleRate(0);
    }

    setLoadingPeriodos(true);
    try {
      const [data] = await customFetch(`/cuentas/cliente/${id}`);
      const arr = Array.isArray(data) ? data : [];
      setPeriodos(
        arr.map(p => {
          const d  = parseFloat(p.i_debito) || 0;
          const ds = parseFloat(p.i_descuento) || 0;
          const r  = parseFloat(p.i_recargo_a_hoy ?? p.i_recargo ?? 0) || 0;
          return { ...p, i_recargo_a_hoy: r, total: d - ds + r };
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
  }, [clientesBombeo, servicios]);

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
    setTotalInPesos(mods * (parseFloat(moduleInfo.valor_modulo) || 1));
  }, [volume, moduleRate, moduleInfo.valor_modulo]);

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
    if (periodos.some(p =>
      p.servicio_id === Number(service) &&
      Number(p.año) === year &&
      Number(p.mes) === mesNum &&
      Number(p.cuota) === cuota
    )) {
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
    { Header: "Servicio",    accessor: "servicio.nombre" },
    {
      Header: "Importe",
      accessor: "i_debito",
      Cell: ({ value }) => formatNumber(value),
    },
    {
      Header: "Descuento",
      accessor: "i_descuento",
      Cell: ({ value }) => (
        <span className="text-success">{formatNumber(value)}</span>
      ),
    },
    {
      Header: "Recargo",
      accessor: "i_recargo_a_hoy",
      Cell: ({ value, row }) => {
        const venc = row.original.f_vencimiento;
        return (
          <span
            className={Number(value) > 0 ? "text-danger fw-semibold" : ""}
            title={Number(value) > 0 ? `Venció el ${formatDDMMYYYY(venc?.split("T")[0])}` : ""}
          >
            {formatNumber(value)}
          </span>
        );
      },
    },
    {
      Header: "Total",
      accessor: "total",
      Cell: ({ value }) => <strong>{formatNumber(value)}</strong>,
    },
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
    { Header: "Fecha de Pago",
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
          loading={loadingServicios}
          showList={showClientList}
          onClientSelect={handleClientSelect}
          dropdownRef={dropdownRef}
        />

        {clientId && (
          loadingPeriodos ? (
            <div className="text-center py-5"><Spinner animation="border" /></div>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <small className="text-muted">Total registros: {periodos.length}</small>
                <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>
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

              <NewPeriodoForm
                volume={volume}
                onVolumeChange={setVolume}
                filteredServices={filteredServices}
                service={service}
                onServiceChange={val => {
                  setService(val);
                  const selected = filteredServices.find(s => s.id === Number(val));
                  setModuleRate(selected ? selected.modulos : 0);
                }}
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
                searchTerm={selectedClient ? `${selectedClient.persona.nombre} ${selectedClient.persona.apellido}` : ""}
                getServiceNameById={id => filteredServices.find(x => x.id === Number(id))?.nombre || ""}
                onSubmit={handleSubmit}
                onReset={handleReset}
                formatLocalDate={formatDDMMYYYY}
                extraInfo={
                  <ValorModuloInfo
                    valor={moduleInfo?.valor_modulo}
                    ordenanza={moduleInfo?.ordenanza_modulo}
                    updatedAt={formatDateToDMY(moduleInfo?.updated_at)}
                    modulosServicio={moduleRate}
                    size="sm"
                  />
                }
              />
            </>
          )
        )}
      </Form>
    </Card>
  );
}
