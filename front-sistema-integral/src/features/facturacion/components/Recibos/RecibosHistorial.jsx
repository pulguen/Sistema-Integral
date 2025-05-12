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
  Button,
  Breadcrumb,
  Form,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import Swal from "sweetalert2";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { FacturacionContext } from "../../../../context/FacturacionContext";
import { AuthContext } from "../../../../context/AuthContext.jsx";
import CommonTable from "../../../../components/common/table/table.jsx";
import customFetch from "../../../../context/CustomFetch.js";
import { FaTrash } from "react-icons/fa";

const animatedComponents = makeAnimated();

const RecibosHistorial = () => {
  const {
    clientes,
    fetchClienteById,
    fetchRecibosByCliente,
    condicionesPago,
  } = useContext(FacturacionContext);
  const { user } = useContext(AuthContext);

  const canShowClients = user?.permissions.includes("recibos.show.cliente");
  const canDeleteRecibo = user?.permissions.includes("recibos.destroy");
  const canShowTributo = user?.permissions.includes("tributos.show.cliente");
  const canShowServicio = user?.permissions.includes("servicios.show.cliente");

  const [clientsByServices, setClientsByServices] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [tributosMap, setTributosMap] = useState([]);
  const [selectedTributo, setSelectedTributo] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [selectedServicio, setSelectedServicio] = useState(null);
  const [recibos, setRecibos] = useState([]);
  const [loadingRecibos, setLoadingRecibos] = useState(false);

  // 1) Filtrar clientes que tengan al menos un servicio en user.services
  useEffect(() => {
    if (!Array.isArray(clientes) || !Array.isArray(user?.services)) {
      setClientsByServices([]);
      setFilteredClientes([]);
      return;
    }
    const filtered = clientes.filter((c) =>
      Array.isArray(c.servicios) &&
      c.servicios.some((s) => user.services.includes(s.id))
    );
    setClientsByServices(filtered);
    setFilteredClientes(filtered);
  }, [clientes, user?.services]);

  // 2) Búsqueda interna
  const handleSearchChange = (inputValue) => {
    const term = inputValue.toLowerCase();
    setFilteredClientes(
      clientsByServices.filter((c) => {
        const full = `${c.persona?.nombre || ""} ${c.persona?.apellido || ""}`.toLowerCase();
        const dni = (c.persona?.dni || "").toString();
        return full.includes(term) || dni.includes(term);
      })
    );
  };

  const clienteOptions = filteredClientes.map((c) => ({
    value: c.id,
    label: `${c.persona?.nombre || ""} ${c.persona?.apellido || ""} - DNI: ${c.persona?.dni || ""}`,
  }));

  // 3) Seleccionar cliente → cargar tributos y servicios
  const handleClienteSelect = async (opt) => {
    if (!opt) {
      handleReset();
      return;
    }
    const cli = filteredClientes.find((c) => c.id === opt.value);
    setSelectedCliente(cli);
    try {
      const data = await fetchClienteById(cli.id);
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Formato de datos incorrecto");
      }
      // data[0] es un array de entradas { tributo_id, tributo, servicio, ... }
      const map = {};
      data[0].forEach((e) => {
        const tId = e.tributo_id;
        if (!map[tId]) {
          map[tId] = {
            id: tId,
            nombre: e.tributo?.nombre || "Sin nombre",
            servicios: [],
          };
        }
        if (e.servicio && !map[tId].servicios.find((s) => s.id === e.servicio.id)) {
          map[tId].servicios.push(e.servicio);
        }
      });
      setTributosMap(Object.values(map));
      setServicios([]);
      setSelectedTributo(null);
      setSelectedServicio(null);
      setRecibos([]);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudieron cargar los datos del cliente.", "error");
    }
  };

  // 4) Seleccionar tributo → mostrar sus servicios
  const handleTributoSelect = (e) => {
    const tId = parseInt(e.target.value, 10);
    setSelectedTributo(tId);
    const t = tributosMap.find((x) => x.id === tId);
    setServicios(t ? t.servicios : []);
    setSelectedServicio(null);
    setRecibos([]);
  };

  // 5) Seleccionar servicio → cargar recibos del cliente
  const handleServicioSelect = async (e) => {
    const sId = parseInt(e.target.value, 10);
    const serv = servicios.find((s) => s.id === sId);
    setSelectedServicio(serv);
    if (!selectedTributo || !selectedCliente) {
      Swal.fire("Atención", "Selecciona primero un tributo y un servicio.", "warning");
      return;
    }
    setLoadingRecibos(true);
    try {
      const all = await fetchRecibosByCliente(selectedCliente.id);
      setRecibos(Array.isArray(all) ? all : []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudieron cargar los recibos.", "error");
    } finally {
      setLoadingRecibos(false);
    }
  };

  // 6) Reset de todo
  const handleReset = () => {
    setSelectedCliente(null);
    setFilteredClientes(clientsByServices);
    setSelectedTributo(null);
    setServicios([]);
    setSelectedServicio(null);
    setRecibos([]);
  };

  // 7) Anular recibo
  const handleAnular = useCallback(
    (recibo) => {
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
          } catch (err) {
            console.error(err);
            Swal.fire("Error", "No se pudo anular el recibo.", "error");
          }
        }
      });
    },
    []
  );

  // 8) Columnas de la tabla
  const columns = useMemo(
    () => [
      { Header: "N° Recibo", accessor: "n_recibo" },
      {
        Header: "Emisor",
        accessor: "emisor",
        Cell: ({ value }) => value?.name || "N/A",
      },
      {
        Header: "Importe Débito",
        accessor: "i_debito",
        Cell: ({ value }) => `$ ${parseFloat(value || 0).toFixed(2)}`,
      },
      {
        Header: "Recargo",
        accessor: "i_recargo",
        Cell: ({ value }) => `$ ${parseFloat(value || 0).toFixed(2)}`,
      },
      {
        Header: "Total",
        accessor: "i_total",
        Cell: ({ value }) => `$ ${parseFloat(value || 0).toFixed(2)}`,
      },
      {
        Header: "Vencimiento",
        accessor: "f_vencimiento",
        Cell: ({ value }) => value ? new Date(value).toLocaleDateString() : "N/A",
      },
      {
        Header: "Condición",
        accessor: "condicion_pago_id",
        Cell: ({ value }) => {
          const c = condicionesPago.find((x) => x.id === value);
          return c?.nombre || "Impago";
        },
      },
      {
        Header: "Fecha Pago",
        accessor: "f_pago",
        Cell: ({ value }) => value ? new Date(value).toLocaleDateString() : "N/A",
      },
      {
        Header: "Cajero",
        accessor: "cajero",
        Cell: ({ value }) => value?.name || "N/A",
      },
      {
        Header: "Acciones",
        id: "acciones",
        disableSortBy: true,
        Cell: ({ row }) => (
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id={`tooltip-anular-${row.original.id}`}>
                Anular recibo
              </Tooltip>
            }
          >
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleAnular(row.original)}
              disabled={!canDeleteRecibo}
            >
              <FaTrash />
            </Button>
          </OverlayTrigger>
        ),
      },
    ],
    [handleAnular, canDeleteRecibo, condicionesPago]
  );

  return (
    <Card className="shadow-sm p-4 mt-4">
      <Breadcrumb>
        <Breadcrumb.Item linkAs="a" href="/">
          Inicio
        </Breadcrumb.Item>
        <Breadcrumb.Item>Facturación</Breadcrumb.Item>
        <Breadcrumb.Item active>Historial de Recibos</Breadcrumb.Item>
      </Breadcrumb>

      <h2 className="text-center mb-4 text-primary">Historial de Recibos</h2>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Form.Group controlId="cliente" className="mb-3">
            <Form.Label>Buscar Cliente</Form.Label>
            <Select
              components={animatedComponents}
              isDisabled={!canShowClients}
              value={
                selectedCliente
                  ? {
                      value: selectedCliente.id,
                      label: `${selectedCliente.persona?.nombre} ${selectedCliente.persona?.apellido} - DNI: ${selectedCliente.persona?.dni}`,
                    }
                  : null
              }
              onChange={handleClienteSelect}
              onInputChange={handleSearchChange}
              options={clienteOptions}
              placeholder="Ingresa nombre o DNI del Cliente"
              isClearable
              isSearchable
              aria-label="Buscar Cliente"
            />
          </Form.Group>

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

      {selectedServicio && (
        <div className="table-responsive">
          {loadingRecibos ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" />
            </div>
          ) : (
            <CommonTable columns={columns} data={recibos} />
          )}
          <div className="text-center mt-4">
            <Button variant="outline-secondary" onClick={handleReset}>
              Limpiar Datos
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default RecibosHistorial;
