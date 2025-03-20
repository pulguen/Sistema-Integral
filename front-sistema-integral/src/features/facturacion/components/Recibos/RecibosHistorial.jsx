// src/features/facturacion/components/Periodos/RecibosHistorial.jsx

import React, { useState, useEffect, useContext, useCallback } from "react";
import { FacturacionContext } from "../../../../context/FacturacionContext";
import Swal from "sweetalert2";
import Select from "react-select";
import { Card, Spinner, Button, Breadcrumb, Form, Table, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useTable, useSortBy, usePagination } from "react-table";
import { FaEdit, FaTrash } from "react-icons/fa";

// Importar AuthContext para obtener user.permissions y user.services
import { AuthContext } from "../../../../context/AuthContext.jsx";

// Importar nuestro customFetch
import customFetch from "../../../../context/CustomFetch.js";

const RecibosHistorial = () => {
  // Ahora extraemos también "condicionesPago" desde el contexto
  const { 
    clientes, 
    fetchClienteById, 
    fetchRecibosByNumeros,
    condicionesPago 
  } = useContext(FacturacionContext);
  const { user } = useContext(AuthContext);

  // Definir permisos
  const canShowClients = user?.permissions.includes("recibos.show.cliente");
  const canEditRecibo = user?.permissions.includes("recibos.update");
  const canDeleteRecibo = user?.permissions.includes("recibos.destroy");

  // **Nuevos permisos**
  const canShowTributo = user?.permissions.includes("tributos.show.cliente");
  const canShowServicio = user?.permissions.includes("servicios.show.cliente");

  /**
   * clientsByServices: los clientes que tienen algún servicio en común con user.services.
   * filteredClientes: filtrado adicional según el texto de búsqueda (handleSearchChange).
   */
  const [clientsByServices, setClientsByServices] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);

  const [selectedCliente, setSelectedCliente] = useState(null);

  const [tributosMap, setTributosMap] = useState([]);
  const [selectedTributo, setSelectedTributo] = useState(null);

  const [servicios, setServicios] = useState([]);
  const [selectedServicio, setSelectedServicio] = useState(null);

  const [clienteDatos, setClienteDatos] = useState([]);
  const [recibos, setRecibos] = useState([]);
  const [loadingRecibos, setLoadingRecibos] = useState(false);

  /**
   * Filtrar clientes según los servicios asignados al usuario
   */
  useEffect(() => {
    if (!Array.isArray(clientes)) {
      setClientsByServices([]);
      setFilteredClientes([]);
      return;
    }

    if (!Array.isArray(user?.services) || user.services.length === 0) {
      // Si el usuario no tiene servicios asignados, no mostrar ningún cliente
      setClientsByServices([]);
      setFilteredClientes([]);
      return;
    }

    // Filtrar clientes que tienen al menos un servicio en común con user.services
    const filtered = clientes.filter((cliente) => {
      if (!Array.isArray(cliente.servicios)) return false;
      // Suponiendo que cada servicio tiene una propiedad 'id'
      return cliente.servicios.some((servicio) => user.services.includes(servicio.id));
    });

    setClientsByServices(filtered);
    setFilteredClientes(filtered);
  }, [clientes, user?.services]);

  /**
   * Maneja la búsqueda en el campo Select (react-select).
   */
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

  /**
   * Opciones para el select (React-Select)
   */
  const clienteOptions = filteredClientes.map((cliente) => ({
    value: cliente.id,
    label: `${cliente.persona?.nombre || ""} ${cliente.persona?.apellido || ""} - DNI: ${cliente.persona?.dni || ""}`,
  }));

  /**
   * Cuando se elige un cliente en el Select
   */
  const handleClienteSelect = async (selectedOption) => {
    if (!selectedOption) {
      handleReset();
      return;
    }
    const cliente = clientes.find((c) => c.id === selectedOption.value);
    setSelectedCliente(cliente);

    try {
      const clienteData = await fetchClienteById(cliente.id);
      if (!Array.isArray(clienteData) || clienteData.length === 0) {
        throw new Error("Formato de datos incorrecto");
      }

      setClienteDatos(clienteData[0]);

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

  /**
   * Selección de tributo
   */
  const handleTributoSelect = (e) => {
    const tributoId = e.target.value;
    const tributo = tributosMap.find((t) => t.id === parseInt(tributoId, 10));
    setSelectedTributo(tributoId);
    setServicios(tributo ? tributo.servicios : []);
    setSelectedServicio(null);
    setRecibos([]);
  };

  /**
   * Selección de servicio
   */
  const handleServicioSelect = async (e) => {
    const servicioId = e.target.value;
    const servicio = servicios.find((s) => s.id === parseInt(servicioId, 10));
    setSelectedServicio(servicio);

    if (selectedCliente && servicio && selectedTributo) {
      setLoadingRecibos(true);
      try {
        const tributoIdNumber = parseInt(selectedTributo, 10);

        // Filtrar las cuentas para obtener n_recibo_generado
        const filteredCuentas = clienteDatos.filter(
          (cuenta) =>
            parseInt(cuenta.servicio_id, 10) === servicio.id &&
            parseInt(cuenta.tributo_id, 10) === tributoIdNumber &&
            cuenta.n_recibo_generado
        );

        const numerosRecibo = filteredCuentas.map((c) => c.n_recibo_generado);

        if (numerosRecibo.length === 0) {
          setRecibos([]);
          Swal.fire({
            icon: "info",
            title: "Sin Recibos",
            text: "No se encontraron recibos para este cliente y servicio.",
          });
          return;
        }

        const todosRecibos = await fetchRecibosByNumeros(numerosRecibo);
        // Aplanar datos
        const deepFlatten = (arr) =>
          arr.reduce((acc, val) => (Array.isArray(val) ? acc.concat(deepFlatten(val)) : acc.concat(val)), []);
        const aplanados = deepFlatten(todosRecibos);

        // Sólo objetos
        const soloObjetos = aplanados.filter((item) => typeof item === "object" && item !== null);

        // Filtrar por cliente_id
        const recibosDelCliente = soloObjetos.filter((r) => r.cliente_id === selectedCliente.id);

        // Desduplicar por id
        const uniqueMap = new Map();
        for (const recibo of recibosDelCliente) {
          uniqueMap.set(recibo.id, recibo);
        }
        const uniqueRecibos = [...uniqueMap.values()];

        setRecibos(uniqueRecibos);
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

  /**
   * Reiniciar la selección y limpiar datos
   */
  const handleReset = () => {
    setSelectedCliente(null);
    setFilteredClientes(clientes);
    setSelectedTributo(null);
    setServicios([]);
    setSelectedServicio(null);
    setClienteDatos([]);
    setRecibos([]);
  };

  /**
   * Función para editar (sin cambios relevantes)
   */
  const handleEdit = useCallback((recibo) => {
    console.log("Editar recibo:", recibo);
    Swal.fire("Editar", `Editar recibo con ID: ${recibo.id}`, "info");
  }, []);

  /**
   * Función para anular recibo (reemplaza la antigua handleDelete)
   * Utiliza customFetch para la petición POST.
   */
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
            // Usamos customFetch para hacer la petición
            await customFetch("/recibos/anular", "POST", {
              recibo: recibo.n_recibo, // O usa recibo.id según requiera tu API
              comentario: comentario,
            });

            // Opcional: eliminarlo del estado si ya no se debe mostrar
            setRecibos((prev) => prev.filter((r) => r.id !== recibo.id));

            Swal.fire("Recibo Anulado", "El recibo se ha anulado correctamente.", "success");
          } catch (error) {
            console.error("Error al anular recibo:", error);
            Swal.fire("Error", "Hubo un problema al anular el recibo.", "error");
          }
        }
      });
    },
    [setRecibos]
  );

  // Definición de las columnas para la tabla
  const columns = React.useMemo(
    () => [
      {
        Header: "N° Recibo",
        accessor: "n_recibo",
      },
      {
        Header: "Cliente ID",
        accessor: "cliente_id",
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
        // Aquí se busca el nombre correspondiente al id, usando el array condicionesPago obtenido del contexto
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
        Header: "Acciones",
        accessor: "acciones",
        disableSortBy: true,
        Cell: ({ row }) => (
          <>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id={`tooltip-edit-${row.original.id}`}>Editar Recibo</Tooltip>}
            >
              <Button
                variant="warning"
                size="sm"
                className="me-2"
                onClick={() => handleEdit(row.original)}
                disabled={!canEditRecibo}
                aria-label={`Editar recibo ${row.original.id}`}
              >
                <FaEdit />
              </Button>
            </OverlayTrigger>
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
    [handleEdit, handleAnular, canEditRecibo, canDeleteRecibo, condicionesPago]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data: recibos,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useSortBy,
    usePagination
  );

  return (
    <Card className="shadow-sm p-4 mt-4">
      {/* Migas de Pan */}
      <Breadcrumb>
        <Breadcrumb.Item>Inicio</Breadcrumb.Item>
        <Breadcrumb.Item>Facturación</Breadcrumb.Item>
        <Breadcrumb.Item active>Historial de Recibos</Breadcrumb.Item>
      </Breadcrumb>

      <h2 className="text-center mb-4 text-primary">Historial de Recibos</h2>

      {/* Búsqueda y selección */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          {/* Búsqueda de cliente */}
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

          {/* Selección de tributo */}
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

          {/* Selección de servicio */}
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

      {/* Tabla de Recibos */}
      {selectedServicio && (
        <div className="table-responsive">
          {loadingRecibos ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </Spinner>
            </div>
          ) : (
            <>
              <Table {...getTableProps()} striped bordered hover>
                <thead>
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                      {headerGroup.headers.map((column) => (
                        <th {...column.getHeaderProps(column.getSortByToggleProps())} key={column.id}>
                          {column.render("Header")}
                          <span>
                            {column.isSorted
                              ? column.isSortedDesc
                                ? " 🔽"
                                : " 🔼"
                              : ""}
                          </span>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                  {page.length > 0 ? (
                    page.map((row, i) => {
                      prepareRow(row);
                      return (
                        <tr {...row.getRowProps()} key={row.original.id}>
                          {row.cells.map((cell) => (
                            <td {...cell.getCellProps()} key={cell.column.id}>
                              {cell.render("Cell")}
                            </td>
                          ))}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="text-center text-muted">
                        No hay recibos para este cliente y servicio.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>

              {/* Paginación */}
              <div className="pagination d-flex justify-content-between align-items-center">
                <div>
                  <Button onClick={() => gotoPage(0)} disabled={!canPreviousPage} className="me-2">
                    {"<<"}
                  </Button>
                  <Button onClick={() => previousPage()} disabled={!canPreviousPage} className="me-2">
                    {"<"}
                  </Button>
                  <Button onClick={() => nextPage()} disabled={!canNextPage} className="me-2">
                    {">"}
                  </Button>
                  <Button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                    {">>"}
                  </Button>
                </div>
                <span>
                  Página <strong>{pageIndex + 1} de {pageOptions.length}</strong>{" "}
                </span>
                <span>
                  | Ir a la página:{" "}
                  <input
                    type="number"
                    defaultValue={pageIndex + 1}
                    onChange={(e) => {
                      const page = e.target.value ? Number(e.target.value) - 1 : 0;
                      gotoPage(page);
                    }}
                    style={{ width: "100px" }}
                    aria-label="Ir a la página"
                  />
                </span>
                <Form.Select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                  }}
                  aria-label="Seleccione el número de filas por página"
                  style={{ width: "150px" }}
                >
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      Mostrar {pageSize}
                    </option>
                  ))}
                </Form.Select>
              </div>
            </>
          )}

          {/* Botón para limpiar datos */}
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
