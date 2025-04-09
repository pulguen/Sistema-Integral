import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { FacturacionContext } from "../../../../context/FacturacionContext";
import Swal from "sweetalert2";
import Select from "react-select";
import { Card, Spinner, Button, Breadcrumb, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import CommonTable from "../../../../components/common/table/table.jsx";
import { AuthContext } from "../../../../context/AuthContext.jsx";
import customFetch from "../../../../context/CustomFetch.js";

const RecibosHistorial = () => {
  const { 
    clientes, 
    fetchClienteById, 
    fetchRecibosByCliente,
    condicionesPago 
  } = useContext(FacturacionContext);
  const { user } = useContext(AuthContext);

  const canShowClients = user?.permissions.includes("recibos.show.cliente");
  // Se eliminó la referencia a editar recibos, por lo que ya no se utiliza canEditRecibo
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

  useEffect(() => {
    if (!Array.isArray(clientes)) {
      setClientsByServices([]);
      setFilteredClientes([]);
      return;
    }
    if (!Array.isArray(user?.services) || user.services.length === 0) {
      setClientsByServices([]);
      setFilteredClientes([]);
      return;
    }
    const filtered = clientes.filter((cliente) => {
      if (!Array.isArray(cliente.servicios)) return false;
      return cliente.servicios.some((servicio) => user.services.includes(servicio.id));
    });
    setClientsByServices(filtered);
    setFilteredClientes(filtered);
  }, [clientes, user?.services]);

  const handleSearchChange = (inputValue) => {
    const term = inputValue.toLowerCase();
    const result = clientsByServices.filter((cliente) => {
      const nombre = cliente.persona?.nombre || "";
      const apellido = cliente.persona?.apellido || "";
      const fullName = `${nombre} ${apellido}`.toLowerCase();
      const dni = cliente.persona?.dni?.toString() || "";
      return fullName.includes(term) || dni.includes(term);
    });
    setFilteredClientes(result);
  };

  const clienteOptions = filteredClientes.map((cliente) => ({
    value: cliente.id,
    label: `${cliente.persona?.nombre || ""} ${cliente.persona?.apellido || ""} - DNI: ${cliente.persona?.dni || ""}`,
  }));

  const handleClienteSelect = async (selectedOption) => {
    if (!selectedOption) {
      handleReset();
      return;
    }
    const cliente = clientes.find((c) => c.id === selectedOption.value);
    setSelectedCliente(cliente);
    try {
      const clienteData = await fetchClienteById(cliente.id);
      console.log("JSON clienteData:", clienteData);
      if (!Array.isArray(clienteData) || clienteData.length === 0) {
        throw new Error("Formato de datos incorrecto");
      }
      // Construir mapa de tributos a partir del primer elemento de la respuesta
      const tributosMapLocal = {};
      clienteData[0].forEach((entry) => {
        const tributoId = entry.tributo_id;
        const tributoNombre = entry.tributo?.nombre || "Sin nombre";
        const servicio = entry.servicio;
        if (!tributosMapLocal[tributoId]) {
          tributosMapLocal[tributoId] = {
            id: tributoId,
            nombre: tributoNombre,
            servicios: [],
          };
        }
        if (servicio) {
          const exists = tributosMapLocal[tributoId].servicios.some((s) => s.id === servicio.id);
          if (!exists) {
            tributosMapLocal[tributoId].servicios.push(servicio);
          }
        }
      });
      setTributosMap(Object.values(tributosMapLocal));
      setServicios([]);
      setSelectedTributo(null);
      setSelectedServicio(null);
      setRecibos([]);
    } catch (error) {
      console.error("Error al procesar los datos del cliente:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al obtener los datos del cliente.",
      });
    }
  };

  const handleTributoSelect = (e) => {
    const tributoId = e.target.value;
    const tributo = tributosMap.find((t) => t.id === parseInt(tributoId, 10));
    setSelectedTributo(tributoId);
    setServicios(tributo ? tributo.servicios : []);
    setSelectedServicio(null);
    setRecibos([]);
  };

  // Al seleccionar un servicio, se obtienen los recibos del cliente
  // Dado que la nueva ruta ya retorna los recibos del cliente, no se realiza filtrado extra
  const handleServicioSelect = async (e) => {
    const servicioId = e.target.value;
    const servicio = servicios.find((s) => s.id === parseInt(servicioId, 10));
    setSelectedServicio(servicio);
    if (selectedCliente && servicio && selectedTributo) {
      setLoadingRecibos(true);
      try {
        const allRecibos = await fetchRecibosByCliente(selectedCliente.id);
        console.log("Recibos totales del cliente:", allRecibos);
        // Aquí podrías aplicar filtrado extra si la respuesta incluyera "servicio_id" y "tributo_id"
        // Pero si no vienen, simplemente asignamos todos
        setRecibos(allRecibos);
      } catch (error) {
        console.error("Error al obtener los recibos:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Hubo un problema al obtener los recibos.",
        });
      } finally {
        setLoadingRecibos(false);
      }
    } else {
      Swal.fire({
        icon: "warning",
        title: "Datos insuficientes",
        text: "Debe seleccionar un tributo y un servicio antes de continuar.",
      });
    }
  };

  const handleReset = () => {
    setSelectedCliente(null);
    setFilteredClientes(clientes);
    setSelectedTributo(null);
    setServicios([]);
    setSelectedServicio(null);
    setRecibos([]);
  };

  const handleAnular = useCallback(
    (recibo) => {
      Swal.fire({
        title: "Anular Recibo",
        text: "Ingrese el motivo de la anulación:",
        input: "text",
        inputPlaceholder: "Motivo de anulación",
        showCancelButton: true,
        confirmButtonText: "Anular",
        cancelButtonText: "Cancelar",
        preConfirm: (motivo) => {
          if (!motivo) {
            Swal.showValidationMessage("El motivo es obligatorio");
          }
          return motivo;
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          const comentario = result.value;
          try {
            await customFetch("/recibos/anular", "POST", {
              recibo: recibo.n_recibo,
              comentario: comentario,
            });
            setRecibos((prev) => prev.filter((r) => r.id !== recibo.id));
            Swal.fire("Recibo Anulado", "El recibo se ha anulado correctamente.", "success");
          } catch (error) {
            console.error("Error al anular recibo:", error);
            Swal.fire("Error", "Hubo un problema al anular el recibo.", "error");
          }
        }
      });
    },
    []
  );

  const columns = useMemo(
    () => [
      { Header: "N° Recibo", accessor: "n_recibo" },
      { 
        Header: "Emisor", 
        accessor: "emisor", 
        Cell: ({ value }) => (value && value.name ? value.name : "N/A") 
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
        Header: "Fecha Vencimiento",
        accessor: "f_vencimiento",
        Cell: ({ value }) => (value ? new Date(value).toLocaleDateString() : "N/A"),
      },
      {
        Header: "Condición",
        accessor: "condicion_pago_id",
        Cell: ({ value }) => {
          const cond = condicionesPago.find((c) => c.id === value);
          return cond ? cond.nombre : "Impago";
        },
      },
      {
        Header: "Fecha condición",
        accessor: "f_pago",
        Cell: ({ value }) => (value ? new Date(value).toLocaleDateString() : "N/A"),
      },
      { 
        Header: "Cajero", 
        accessor: "cajero", 
        Cell: ({ value }) => (value && value.name ? value.name : "N/A") 
      },
      {
        Header: "Acciones",
        accessor: "acciones",
        disableSortBy: true,
        Cell: ({ row }) => (
          <>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id={`tooltip-anular-${row.original.id}`}>Anular Recibo</Tooltip>}
            >
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleAnular(row.original)}
                disabled={!canDeleteRecibo}
                aria-label={`Anular recibo ${row.original.id}`}
              >
                <FaTrash />
              </Button>
            </OverlayTrigger>
          </>
        ),
      },
    ],
    [handleAnular, canDeleteRecibo, condicionesPago]
  );

  return (
    <Card className="shadow-sm p-4 mt-4">
      <Breadcrumb>
        <Breadcrumb.Item>Inicio</Breadcrumb.Item>
        <Breadcrumb.Item>Facturación</Breadcrumb.Item>
        <Breadcrumb.Item active>Historial de Recibos</Breadcrumb.Item>
      </Breadcrumb>
      <h2 className="text-center mb-4 text-primary">Historial de Recibos</h2>
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Form.Group controlId="cliente" className="mb-3">
            <Form.Label>Buscar Cliente</Form.Label>
            <Select
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
              placeholder="Ingresa nombre o DNI/CUIT del Cliente"
              isClearable
              isSearchable
              aria-label="Buscar Cliente"
            />
          </Form.Group>
          {selectedCliente && (
            <Form.Group controlId="tributo" className="mb-3">
              <Form.Label>Seleccionar Tributo</Form.Label>
              <Form.Control
                as="select"
                value={selectedTributo || ""}
                onChange={handleTributoSelect}
                aria-label="Seleccionar Tributo"
                disabled={!canShowTributo}
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
          {selectedTributo && (
            <Form.Group controlId="servicio" className="mb-3">
              <Form.Label>Seleccionar Servicio</Form.Label>
              <Form.Control
                as="select"
                value={selectedServicio?.id || ""}
                onChange={handleServicioSelect}
                aria-label="Seleccionar Servicio"
                disabled={!canShowServicio}
              >
                <option value="">Seleccione un servicio</option>
                {servicios.map((servicio) => (
                  <option key={servicio.id} value={servicio.id}>
                    {servicio.nombre}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          )}
        </Card.Body>
      </Card>
      {selectedServicio && (
        <div className="table-responsive">
          {loadingRecibos ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </Spinner>
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
