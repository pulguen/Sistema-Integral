// src/features/facturacion/components/BombeoAgua/RecibosBombeoForm.jsx

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useContext,
  useMemo,
} from "react";
import { Form, Row, Col, Card, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import CustomButton from "../../../../components/common/botons/CustomButton.jsx";
import ClientSearch from "./ClientSearch";
import CommonTable from "../../../../components/common/table/table.jsx";
import customFetch from "../../../../context/CustomFetch.js";
import { AuthContext } from "../../../../context/AuthContext";
import { BombeoAguaContext } from "../../../../context/BombeoAguaContext.jsx";
import { transformarCliente } from "../../../../utils/clienteUtils.js";

const PAGE_SIZE = 15;
const PAGE_SIZE_OPTIONS = [5, 10, 20];
const TRIBUTO_ID = 1;

const getTodayDate = () => {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(
    t.getDate()
  ).padStart(2, "0")}`;
};

const formatDate = (iso) => {
  if (!iso) return "Sin fecha";
  const [date] = iso.split("T");
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y}`;
};

export default function RecibosBombeoForm() {
  const { handleCreateRecibo } = useContext(BombeoAguaContext);
  const { user } = useContext(AuthContext);

  // —— Clientes filtrados by servicio ——  
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [showClientList, setShowClientList] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchClients = useCallback(async (pageNum = 1) => {
    setLoadingClients(true);
    try {
      const res = await customFetch(
        `/clientes?page=${pageNum}&per_page=${PAGE_SIZE}`
      );
      const raw = Array.isArray(res.data) ? res.data : [];
      const filt = raw
        .map(transformarCliente)
        .filter((c) => c.servicios?.some((s) => s.tributo_id === TRIBUTO_ID));
      setClients((prev) => (pageNum === 1 ? filt : [...prev, ...filt]));
      setPage(pageNum);
      setPageCount(res.last_page || 0);
      setShowClientList(true);
    } catch (err) {
      console.error("fetchClients error:", err);
    } finally {
      setLoadingClients(false);
    }
  }, []);

  useEffect(() => {
    fetchClients(1);
  }, [fetchClients]);

  const onScrollClients = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (
      scrollTop + clientHeight >= scrollHeight - 10 &&
      page < pageCount &&
      !loadingClients
    ) {
      fetchClients(page + 1);
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowClientList(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayedClients = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    if (!t) return clients;
    return clients.filter((c) => {
      const full = `${c.persona.nombre} ${c.persona.apellido}`.toLowerCase();
      return (
        full.includes(t) ||
        (c.persona.dni || "").toLowerCase().includes(t)
      );
    });
  }, [clients, searchTerm]);

  // —— Períodos impagos por cliente ——  
  const [clientId, setClientId] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [periodos, setPeriodos] = useState([]);
  const [loadingPeriodos, setLoadingPeriodos] = useState(false);

  const fetchPeriodos = useCallback(async (id) => {
    setLoadingPeriodos(true);
    try {
      const [data] = await customFetch(`/cuentas/cliente/${id}`);
      const arr = Array.isArray(data) ? data : [];
      const impagos = arr.filter((p) => p.condicion_pago_id === null);
      setPeriodos(impagos);
      if (!impagos.length) {
        Swal.fire(
          "Sin períodos",
          "No hay períodos impagos para este cliente.",
          "info"
        );
      }
    } catch (err) {
      console.error("fetchPeriodos error:", err);
      Swal.fire("Error", "No se pudieron cargar los períodos.", "error");
    } finally {
      setLoadingPeriodos(false);
    }
  }, []);

  const handleClientSelect = useCallback(
    (id) => {
      setClientId(id);
      const clienteObj = clients.find((c) => c.id === id);
      setSelectedClient(clienteObj);
      setShowClientList(false);
      const persona = clienteObj?.persona || {};
      setSearchTerm(`${persona.nombre} ${persona.apellido}`.trim());
      fetchPeriodos(id);
    },
    [clients, fetchPeriodos]
  );

  // —— Selección múltiple y suma ——  
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
        const r = parseFloat(cur.i_recargo_actualizado) || 0;
        return acc + (d - ds + r);
      }, 0);
      setTotalAmount(sum);
      return next;
    });
  }, []);

  const columns = useMemo(
    () => [
      { Header: "#", id: "idx", Cell: ({ row }) => row.index + 1 },
      { Header: "Año", accessor: "año" },
      { Header: "Mes", accessor: "mes" },
      { Header: "Cuota", accessor: "cuota" },
      { Header: "Volumen (m³)", accessor: "cantidad" },
      {
        Header: "Importe",
        accessor: "i_debito",
        Cell: ({ value }) => Number(value).toFixed(2),
      },
      {
        Header: "Descuento",
        accessor: "i_descuento",
        Cell: ({ value }) => Number(value).toFixed(2),
      },
      {
        Header: "Recargo",
        accessor: "i_recargo_actualizado",
        Cell: ({ value }) => Number(value).toFixed(2),
      },
      {
        Header: "Total",
        id: "total",
        Cell: ({ row }) => {
          const d = parseFloat(row.original.i_debito) || 0;
          const ds = parseFloat(row.original.i_descuento) || 0;
          const r = parseFloat(row.original.i_recargo_actualizado) || 0;
          return (d - ds + r).toFixed(2);
        },
      },
      {
        Header: "Vencimiento",
        accessor: "f_vencimiento",
        Cell: ({ value }) => formatDate(value),
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

  // —— Vencimiento y observaciones ——  
  const [vencimiento, setVencimiento] = useState(getTodayDate());
  const [observaciones, setObservaciones] = useState("");

  // —— PAGINACIÓN CLIENTE-SIDE ——  
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

  // —— Envía Recibo ——  
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
          loading={loadingClients}
          showList={showClientList}
          onScroll={onScrollClients}
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
                <div className="text-center">
                  <h4 className="text-secondary mb-1">Total a Pagar</h4>
                  <h1 className="display-4 text-primary mb-2">
                    AR$ {totalAmount.toFixed(2)}
                  </h1>
                  <p className="text-muted">
                    Períodos:{" "}
                    {selectedPeriodos.map((p) => `${p.mes}/${p.año}`).join(", ")}
                    <br />
                    Fecha de Vencimiento: {formatDate(vencimiento)}
                  </p>
                </div>
              </Col>
            </Row>
          </section>
        )}

        {clientId && (
          <div className="d-flex justify-content-center mt-4">
            <CustomButton type="submit" className="me-3 px-5">
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
