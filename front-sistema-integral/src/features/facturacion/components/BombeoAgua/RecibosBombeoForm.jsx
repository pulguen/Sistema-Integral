import React, {
  useState,
  useCallback,
  useRef,
  useContext,
  useMemo,
  useEffect,
} from "react";
import { Form, Row, Col, Card, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import CustomButton from "../../../../components/common/botons/CustomButton.jsx";
import ClientSearch from "./ClientSearch";
import CommonTable from "../../../../components/common/table/table.jsx";
import customFetch from "../../../../context/CustomFetch.js";
import { AuthContext } from "../../../../context/AuthContext";
import { BombeoAguaContext } from "../../../../context/BombeoAguaContext.jsx";
import { formatDateToDMY } from "../../../../utils/dateUtils";
import { FacturacionContext } from "../../../../context/FacturacionContext";
import TotalAPagarInfo from "../../../../components/common/TotalAPagarInfo/TotalAPagarInfo.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faFileInvoiceDollar} from '@fortawesome/free-solid-svg-icons';
import formatNumber from "../../../../utils/formatNumber.js";

const PAGE_SIZE_OPTIONS = [5, 10, 20];

export default function RecibosBombeoForm() {
  const { handleCreateRecibo, clientesBombeo } = useContext(BombeoAguaContext);
  const { user } = useContext(AuthContext);
  const { condicionesPago } = useContext(FacturacionContext);

    const noPagoCond = useMemo(() => {
    if (!Array.isArray(condicionesPago)) return null;
    return condicionesPago.find(
      c =>
        (c.nombre && c.nombre.toLowerCase().includes("no pago")) ||
        (c.abreviatura && c.abreviatura.toLowerCase() === "np")
    );
  }, [condicionesPago]);

  // ---- BUSQUEDA Y SELECCION DE CLIENTE (igual que Periodos) ----
  const [searchTerm, setSearchTerm] = useState("");
  const [showClientList, setShowClientList] = useState(false);
  const dropdownRef = useRef(null);

  const displayedClients = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    if (!t) return clientesBombeo;
    return clientesBombeo.filter((c) => {
      if (!c.persona) return false;
      const full = `${c.persona.nombre} ${c.persona.apellido}`.toLowerCase();
      return (
        full.includes(t) ||
        (c.persona.dni || "").toLowerCase().includes(t)
      );
    });
  }, [clientesBombeo, searchTerm]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowClientList(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ---- PERÍODOS IMPAGOS DEL CLIENTE ----
  const [clientId, setClientId] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [periodos, setPeriodos] = useState([]);
  const [loadingPeriodos, setLoadingPeriodos] = useState(false);

  const fetchPeriodos = useCallback(async (id) => {
    setLoadingPeriodos(true);
    try {
      // Suponiendo que customFetch te devuelve la lista de periodos como array
      const [data] = await customFetch(`/cuentas/cliente/${id}`, 'GET', null, false);
      const arr = Array.isArray(data) ? data : [];
      // Usá el id dinámico:
      const impagos = arr.filter(
        p => Number(p.condicion_pago_id) === Number(noPagoCond?.id)
      );
      setPeriodos(impagos);
      console.log("Periodos impagos:", impagos);
      if (!impagos.length) {
        Swal.fire(
          "Sin períodos",
          "No hay períodos impagos para este cliente.",
          "info"
        );
      }
    } catch (err) {
      Swal.fire("Error", "No se pudieron cargar los períodos.", "error");
    } finally {
      setLoadingPeriodos(false);
    }
  }, [noPagoCond]);

  const handleClientSelect = useCallback(
    (id) => {
      setClientId(id);
      const clienteObj = clientesBombeo.find((c) => c.id === id);
      setSelectedClient(clienteObj);
      setShowClientList(false);
      const persona = clienteObj?.persona || {};
      setSearchTerm(`${persona.nombre} ${persona.apellido}`.trim());
      fetchPeriodos(id);
    },
    [clientesBombeo, fetchPeriodos]
  );

  // ---- SELECCIÓN DE PERÍODOS Y TOTAL ----
  const [selectedPeriodos, setSelectedPeriodos] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const togglePeriodo = useCallback((p) => {
    setSelectedPeriodos((prev) => {
      const next = prev.includes(p)
        ? prev.filter((x) => x !== p)
        : [...prev, p];
      const sum = next.reduce((acc, cur) => {
        const d = parseFloat(cur.i_debito) || 0;
        const ds = parseFloat(cur.i_descuento) || 0;
        const r = parseFloat(cur.i_recargo_a_hoy) || 0;
        return acc + (d - ds + r);
      }, 0);
      setTotalAmount(sum);
      return next;
    });
  }, []);

  // ---- COLUMNAS DE LA TABLA ----
const columns = useMemo(
  () => [
    { Header: "#", id: "idx", Cell: ({ row }) => row.index + 1 },
    { Header: "Año", accessor: "año" },
    { Header: "Mes", accessor: "mes" },
    { Header: "Cuota", accessor: "cuota" },
    {
      Header: "Volumen (m³)",
      accessor: "cantidad",
      Cell: ({ value }) => formatNumber(value, { decimals: 0 }),
    },
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
            title={Number(value) > 0 ? `Venció el ${formatDateToDMY(venc)}` : ""}
          >
            {formatNumber(value)}
          </span>
        );
      },
    },
    {
      Header: "Total",
      id: "total",
      Cell: ({ row }) => {
        const d = parseFloat(row.original.i_debito) || 0;
        const ds = parseFloat(row.original.i_descuento) || 0;
        const r = parseFloat(row.original.i_recargo_a_hoy) || 0;
        const total = d - ds + r;
        return <strong>{formatNumber(total)}</strong>;
      },
    },
    {
      Header: "Vencimiento",
      accessor: "f_vencimiento",
      Cell: ({ value }) => formatDateToDMY(value),
    },
    { Header: "Recibo gen.", accessor: "n_recibo_generado" },
    {
      Header: "Seleccionar",
      id: "select",
      Cell: ({ row }) => (
        <Form.Check
          type="checkbox"
          checked={selectedPeriodos.includes(row.original)}
          onChange={() => togglePeriodo(row.original)}
        />
      ),
    },
  ],
  [selectedPeriodos, togglePeriodo]
);


  // ---- Vencimiento y observaciones ----
  const getTodayDate = () => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(
      t.getDate()
    ).padStart(2, "0")}`;
  };
  const [vencimiento, setVencimiento] = useState(getTodayDate());
  const [observaciones, setObservaciones] = useState("");

  // ---- PAGINACIÓN ----
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

  // ---- ENVIAR RECIBO ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientId) {
      return Swal.fire("Error", "Seleccioná un cliente.", "error");
    }
    if (!selectedPeriodos.length) {
      return Swal.fire("Error", "Seleccioná al menos un período.", "error");
    }
    if (new Date(vencimiento) < new Date(getTodayDate())) {
      return Swal.fire(
        "Error",
        "La fecha de vencimiento no puede ser anterior a hoy.",
        "error"
      );
    }
    const { isConfirmed } = await Swal.fire({
      title: "¿Generar Recibo?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, generar",
    });
    if (!isConfirmed) return;

    const volumenTotal = selectedPeriodos.reduce(
      (sum, p) => sum + (parseFloat(p.cantidad) || 0),
      0
    );

    handleCreateRecibo({
      cliente_id: clientId,
      cliente_nombre: selectedClient.persona.nombre,
      cliente_apellido: selectedClient.persona.apellido,
      cliente_dni: selectedClient.persona.dni,
      totalAmount,
      periodos: selectedPeriodos,
      volumen: volumenTotal,
      vencimiento,
      observaciones,
      cajero_nombre: user.name,
    });

    Swal.fire("Hecho", "Recibo temporal generado correctamente.", "success");

    // reset
    setClientId(null);
    setSelectedClient(null);
    setSearchTerm("");
    setPeriodos([]);
    setSelectedPeriodos([]);
    setTotalAmount(0);
    setVencimiento(getTodayDate());
    setObservaciones("");
  };

   return (
    <Card className="shadow-sm p-5 mt-4 recibos-bombeo-form">
      <h2 className="text-center mb-5 text-primary fw-bold">
        <FontAwesomeIcon icon={faFileInvoiceDollar} className="me-2" />
        Generar Recibo de Bombeo de Agua
      </h2>
      <Form onSubmit={handleSubmit} className="px-4">
        <ClientSearch
          searchTerm={searchTerm}
          onSearchTermChange={(val) => {
            setSearchTerm(val);
            setClientId(null);
            setSelectedClient(null);
            setPeriodos([]);
            setShowClientList(true);
          }}
          clients={displayedClients}
          loading={false} // o tu estado loadingClientes si es asíncrono
          showList={showClientList}
          onClientSelect={handleClientSelect}
          dropdownRef={dropdownRef}
        />

        {clientId && (
          <section className="form-section mb-4">
            <h4 className="mb-3 text-secondary">Períodos Impagos</h4>
            {loadingPeriodos ? (
              <div className="text-center py-3">
                <Spinner animation="border" />
              </div>
            ) : (
              <CommonTable
                columns={columns}
                data={currentPageData}
                loading={false}
                fetchData={fetchPage}
                controlledPageCount={totalPages}
                initialPageIndex={pageIndex}
                initialPageSize={pageSize}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
              />
            )}
          </section>
        )}
 
{clientId && (
  <section className="form-section mb-4">
    <Row>
      <Col md={6}>
        <Form.Group controlId="vencimiento">
          <Form.Label className="fw-bold">
            Fecha de Vencimiento
          </Form.Label>
          <Form.Control
            type="date"
            value={vencimiento}
            min={getTodayDate()}
            onChange={(e) => setVencimiento(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="observaciones" className="mt-3">
          <Form.Label className="fw-bold">Observaciones</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </Form.Group>
      </Col>
      <Col
        md={6}
        className="d-flex justify-content-center align-items-center"
      >
      <TotalAPagarInfo
        total={totalAmount}
        modulos={selectedPeriodos.length}
        periodos={selectedPeriodos}
        formula={null}
        complete={selectedPeriodos.length > 0}
        missingFields={selectedPeriodos.length ? [] : ["Períodos a incluir"]}
        cliente={
          selectedClient?.persona
            ? `${selectedClient.persona.nombre} ${selectedClient.persona.apellido}`
            : ""
        }
        servicio={null}
        volumen={null}
        mes={null}
        year={null}
        cuota={null}
        vencimiento={vencimiento}
        formatLocalDate={formatDateToDMY}
        extraInfo={null}
        labelModulos="Períodos"
      />
      </Col>
    </Row>
  </section>
)}


        {clientId && (
          <div className="d-flex justify-content-center mt-4">
            <CustomButton
              type="submit"
              className="me-3 px-5"
              disabled={!selectedPeriodos.length || !clientId}
            >
              Generar Recibo
            </CustomButton>
            <CustomButton
              variant="outline-secondary"
              onClick={() => {
                setClientId(null);
                setSelectedClient(null);
                setSearchTerm("");
                setPeriodos([]);
                setSelectedPeriodos([]);
                setTotalAmount(0);
                setVencimiento(getTodayDate());
                setObservaciones("");
              }}
              className="px-5"
            >
              Limpiar
            </CustomButton>
          </div>
        )}
      </Form>
    </Card>
  );
}