import React, { useState, useContext, useMemo, useRef, useEffect, useCallback } from "react";
import { Card, Spinner, Form, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2";
import { AlquilerPlataformaContext } from "../../../../context/AlquilerPlataformaContext";
import { FacturacionContext } from "../../../../context/FacturacionContext";
import ClientSearch from "../Common/ClientSearch";
import CommonTable from "../../../../components/common/table/table";
import ValorModuloInfo from "../../../../components/common/moduloInfo/ValorModuloInfo.jsx";
import TotalAPagarInfo from "../../../../components/common/TotalAPagarInfo/TotalAPagarInfo.jsx";
import { formatDateToDMY } from "../../../../utils/dateUtils";
import formatNumber from "../../../../utils/formatNumber.js";

const PAGE_SIZE_OPTIONS = [15, 30, 45, 60];

const monthNameToNumber = (month) => ({
  Enero: 1, Febrero: 2, Marzo: 3, Abril: 4, Mayo: 5, Junio: 6,
  Julio: 7, Agosto: 8, Septiembre: 9, Octubre: 10, Noviembre: 11, Diciembre: 12,
}[month] || 0);

export default function PeriodosAlquilerForm() {
  const { clientesAlquiler, loadingServicios, periodos, setPeriodos, servicios } = useContext(AlquilerPlataformaContext);
  const { moduleInfo } = useContext(FacturacionContext);

  // --- Busqueda y seleccion de cliente ---
  const [searchTerm, setSearchTerm] = useState("");
  const [showClientList, setShowClientList] = useState(false);
  const dropdownRef = useRef(null);

  const displayedClients = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return term === ""
      ? clientesAlquiler
      : clientesAlquiler.filter(c => {
          if (!c.persona) return false;
          const fullName = `${c.persona.nombre} ${c.persona.apellido}`.toLowerCase();
          const dni = (c.persona.dni || "").toLowerCase();
          return fullName.includes(term) || dni.includes(term);
        });
  }, [clientesAlquiler, searchTerm]);

  useEffect(() => {
    const handler = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowClientList(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // --- Seleccion de cliente y setup de servicios ---
  const [clientId, setClientId] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loadingPeriodos, setLoadingPeriodos] = useState(false);
  const [filteredServices, setFilteredServices] = useState([]);
  const [service, setService] = useState("");
  const [modulosServicio, setModulosServicio] = useState(0);

  // ---- Estados formulario periodo ----
  const [formMonth, setFormMonth] = useState("");
  const [formYear, setFormYear] = useState(new Date().getFullYear());
  const [formCuota, setFormCuota] = useState(1);
  const [formCantidad, setFormCantidad] = useState(1);
  const [formVencimiento, setFormVencimiento] = useState("");

  // --- Selección del cliente: recibe ID, busca objeto seguro ---
  const handleClientSelect = useCallback((id) => {
    const cli = clientesAlquiler.find(c => c.id === id);
    if (!cli) return;
    setClientId(cli.id);
    setSelectedClient(cli);
    setShowClientList(false);
    setSearchTerm(`${cli.persona.nombre} ${cli.persona.apellido}`);
    // Servicios asociados de alquiler (según tributo)
    const asociados = servicios.filter(s =>
      Array.isArray(s.clientes) && s.clientes.some(c2 => c2.id === cli.id)
    );
    setFilteredServices(asociados);
    if (asociados.length === 1) {
      setService(asociados[0].id);
      setModulosServicio(asociados[0].modulos);
    } else {
      setService("");
      setModulosServicio(0);
    }
    setLoadingPeriodos(true);
    setPeriodos([]); // TODO: fetch real
    setTimeout(() => setLoadingPeriodos(false), 400);
    setFormMonth("");
    setFormYear(new Date().getFullYear());
    setFormCuota(1);
    setFormCantidad(1);
    setFormVencimiento("");
  }, [clientesAlquiler, servicios, setPeriodos]);

  // --- Tabla columnas ---
  const columns = useMemo(() => [
    { Header: "#", id: "idx", accessor: (_r, i) => i + 1 },
    { Header: "Mes", accessor: "mes" },
    { Header: "Año", accessor: "año" },
    { Header: "Cantidad", accessor: "cantidad" },
    { Header: "Módulos", accessor: "modulos" },
    { Header: "Importe", accessor: "importe", Cell: ({ value }) => formatNumber(value) },
    { Header: "Estado", accessor: "estado" },
    { Header: "Recibo Gen.", accessor: "n_recibo_generado" },
  ], []);

  // --- Paginacion cliente-side ---
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

  // --- Opciones de mes y año ---
  const monthOptions = useMemo(() => [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ], []);
  const yearOptions = useMemo(() => {
    const curr = new Date().getFullYear();
    return Array.from({ length: curr - 2019 }, (_, i) => curr - i);
  }, []);

  // --- Cálculo total ---
  const totalAPagar = useMemo(() =>
    (modulosServicio || 0) * (formCantidad || 0) * (parseFloat(moduleInfo?.valor_modulo) || 0),
    [modulosServicio, formCantidad, moduleInfo?.valor_modulo]
  );

  // --- Validación visual ---
  const isComplete = !!(service && modulosServicio && formCantidad && formMonth && formYear && formCuota && formVencimiento);

  // --- Handler de submit ---
  const handleAddPeriodo = (e) => {
    e.preventDefault();
    if (!selectedClient) return Swal.fire("Error", "Seleccioná un cliente.", "error");
    if (!service) return Swal.fire("Error", "Seleccioná un servicio.", "error");
    if (!modulosServicio) return Swal.fire("Error", "No hay módulos definidos para este servicio.", "error");
    if (!formMonth) return Swal.fire("Error", "Seleccioná el mes.", "error");
    if (!formYear) return Swal.fire("Error", "Seleccioná el año.", "error");
    if (!formCuota || formCuota < 1) return Swal.fire("Error", "La cuota debe ser mayor a 0.", "error");
    if (!formCantidad || formCantidad < 1) return Swal.fire("Error", "La cantidad debe ser mayor a 0.", "error");
    if (!formVencimiento) return Swal.fire("Error", "Seleccioná la fecha de vencimiento.", "error");

    const mesNum = monthNameToNumber(formMonth);

    // Chequeo de duplicados en periodos locales
    if (
      periodos.some(p =>
        p.servicio_id === Number(service) &&
        Number(p.año) === formYear &&
        Number(p.mes) === mesNum &&
        Number(p.cuota) === formCuota &&
        Number(p.cantidad) === Number(formCantidad)
      )
    ) {
      return Swal.fire("Duplicado", "Ya existe un período con esos datos.", "error");
    }

    const nuevoPeriodo = {
      id: Date.now(),
      cliente_id: clientId,
      clientName: `${selectedClient.persona.nombre} ${selectedClient.persona.apellido}`,
      servicio_id: Number(service),
      modulos: modulosServicio,
      cantidad: formCantidad,
      mes: mesNum,
      año: formYear,
      cuota: formCuota,
      vencimiento: formVencimiento,
      importe: totalAPagar,
      estado: "Pendiente",
      n_recibo_generado: null,
    };
    setPeriodos(prev => [...prev, nuevoPeriodo]);
    Swal.fire("Éxito", "Período agregado a la lista.", "success");
    handleReset();
  };

  // --- Reset form y cliente ---
  const handleReset = () => {
    setClientId(null);
    setSelectedClient(null);
    setPeriodos([]);
    setSearchTerm("");
    setShowClientList(true);
    setFilteredServices([]);
    setService("");
    setModulosServicio(0);
    setFormMonth("");
    setFormYear(new Date().getFullYear());
    setFormCuota(1);
    setFormCantidad(1);
    setFormVencimiento("");
  };

  // --- Para mostrar nombre del servicio ---
  const getServiceNameById = (id) => filteredServices.find(x => x.id === Number(id))?.nombre || "";

  return (
    <Card className="shadow-sm p-5 mt-4">
      <h2 className="text-center mb-5 text-primary">
        Períodos de Alquiler de Plataforma
      </h2>
      <Form onSubmit={handleAddPeriodo}>
        <ClientSearch
          searchTerm={searchTerm}
          onSearchTermChange={val => {
            setSearchTerm(val);
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
                <button type="button" className="btn btn-outline-secondary"
                  onClick={handleReset}>
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
              {/* --------- Formulario de Nuevo Período --------- */}
              <section className="form-section mb-4 mt-4">
                <h4 className="mb-3 text-secondary">Nuevo Período</h4>
                <Row className="gy-4">
                  <Col xs={12} md={6}>
                    <Form.Group controlId="service" className="mb-3">
                      <Form.Label className="fw-bold">
                        Tipo de Servicio <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select
                        value={service}
                        onChange={e => {
                          setService(e.target.value);
                          const selected = filteredServices.find(s => s.id === Number(e.target.value));
                          setModulosServicio(selected ? selected.modulos : 0);
                        }}
                        required
                      >
                        <option value="">Seleccione un servicio</option>
                        {filteredServices.map(s => (
                          <option key={s.id} value={s.id}>{s.nombre}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                    <Form.Group controlId="cantidad" className="mb-3">
                      <Form.Label className="fw-bold">
                        Cantidad de espacios <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="number"
                        min={1}
                        value={formCantidad}
                        onChange={e => setFormCantidad(Math.max(1, Number(e.target.value)))}
                        required
                      />
                    </Form.Group>
                    <Form.Group controlId="month" className="mb-3">
                      <Form.Label className="fw-bold">
                        Mes de Facturación <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select
                        value={formMonth}
                        onChange={e => setFormMonth(e.target.value)}
                        required
                      >
                        <option value="">Seleccione un mes</option>
                        {monthOptions.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                    <Form.Group controlId="year" className="mb-3">
                      <Form.Label className="fw-bold">
                        Año <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select
                        value={formYear}
                        onChange={e => setFormYear(Number(e.target.value))}
                        required
                      >
                        {yearOptions.map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                    <Form.Group controlId="cuota" className="mb-3">
                      <Form.Label className="fw-bold">
                        Cuota <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="number"
                        value={formCuota}
                        min={1}
                        onChange={e => setFormCuota(Math.max(1, Number(e.target.value)))}
                        required
                      />
                    </Form.Group>
                    <Form.Group controlId="vencimiento" className="mb-3">
                      <Form.Label className="fw-bold">
                        Fecha de Vencimiento <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="date"
                        value={formVencimiento}
                        onChange={e => setFormVencimiento(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6} className="d-flex flex-column justify-content-center align-items-center">
                    <TotalAPagarInfo
                      total={totalAPagar}
                      modulos={modulosServicio * formCantidad}
                      formula="[Módulos] x [Cantidad] x [Valor Módulo] x 1 mes"
                      complete={isComplete}
                      missingFields={[]}
                      cliente={selectedClient ? `${selectedClient.persona.nombre} ${selectedClient.persona.apellido}` : ""}
                      servicio={getServiceNameById(service)}
                      volumen={null}
                      mes={formMonth}
                      year={formYear}
                      cuota={formCuota}
                      vencimiento={formVencimiento}
                      formatLocalDate={formatDateToDMY}
                      extraInfo={
                        <ValorModuloInfo
                          valor={moduleInfo?.valor_modulo}
                          ordenanza={moduleInfo?.ordenanza_modulo}
                          updatedAt={formatDateToDMY(moduleInfo?.updated_at)}
                          modulosServicio={modulosServicio}
                          size="sm"
                        />
                      }
                    />
                  </Col>
                </Row>
                <div className="d-flex justify-content-center mt-4">
                  <button type="submit" className="btn btn-primary me-3 px-5 py-2 fw-bold">
                    Generar Período
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-5 py-2 fw-bold"
                    onClick={handleReset}
                  >
                    Limpiar
                  </button>
                </div>
              </section>
            </> 
          )
        )}
      </Form>
    </Card>
  );
}