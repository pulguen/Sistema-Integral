// src/features/facturacion/components/Periodos/PeriodosHistorial.jsx

import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  Card,
  Spinner,
  Button,
  Breadcrumb,
  Form,
  Table,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import Swal from "sweetalert2";
import { FacturacionContext } from "../../../../context/FacturacionContext";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from 'react-icons/fa';
import CustomButton from '../../../../components/common/botons/CustomButton.jsx';
import EditPeriodoModal from '../../../../components/common/modals/EditPeriodoModal.jsx';
import customFetch from '../../../../context/CustomFetch.js';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { useTable, useSortBy, usePagination } from 'react-table';

// Elimina o comenta las siguientes líneas para evitar errores de importación
// import 'react-select/dist/react-select.css';
// import 'react-table/react-table.css';

const animatedComponents = makeAnimated();

// Definición del filtro por defecto
function DefaultColumnFilter({
  column: { filterValue, setFilter },
}) {
  return (
    <input
      value={filterValue || ''}
      onChange={e => {
        setFilter(e.target.value || undefined); // Establecer undefined para eliminar el filtro
      }}
      placeholder={`Buscar...`}
      style={{ width: '100%' }}
      aria-label="Filtro de columna"
    />
  );
}

const PeriodosHistorial = () => {
  const { 
    clientes, 
    fetchClienteById 
  } = useContext(FacturacionContext);

  const [filteredClientes, setFilteredClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);

  const [tributosMap, setTributosMap] = useState([]);
  const [selectedTributo, setSelectedTributo] = useState(null);

  const [servicios, setServicios] = useState([]);
  const [selectedServicio, setSelectedServicio] = useState(null);

  const [periodos, setPeriodos] = useState([]);
  const [loadingPeriodos, setLoadingPeriodos] = useState(false);

  const [clienteDatos, setClienteDatos] = useState([]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPeriodo, setSelectedPeriodo] = useState(null);

  // Inicializar clientes para filtrado
  useEffect(() => {
    setFilteredClientes(clientes);
  }, [clientes]);

  // Función para manejar la búsqueda de clientes
  const handleSearchChange = (inputValue) => {
    const term = inputValue.toLowerCase();
    setFilteredClientes(
      clientes.filter((cliente) => {
        const fullName = `${cliente.persona?.nombre || ""} ${cliente.persona?.apellido || ""}`.toLowerCase();
        const dni = cliente.persona?.dni?.toString() || "";
        return fullName.includes(term) || dni.includes(term);
      })
    );
  };

  // Opciones para react-select
  const clienteOptions = filteredClientes.map((cliente) => ({
    value: cliente.id,
    label: `${cliente.persona?.nombre} ${cliente.persona?.apellido} - DNI: ${cliente.persona?.dni}`,
  }));

  // Función para manejar la selección de un cliente
  const handleClienteSelect = async (selectedOption) => {
    if (!selectedOption) {
      handleReset();
      return;
    }
    const cliente = clientes.find(c => c.id === selectedOption.value);
    setSelectedCliente(cliente);

    try {
      const clienteData = await fetchClienteById(cliente.id);

      if (!Array.isArray(clienteData) || clienteData.length === 0) {
        throw new Error("Formato de datos incorrecto");
      }

      setClienteDatos(clienteData[0]);

      const tributosMapLocal = {};
      clienteData[0].forEach((periodo) => {
        const tributoId = periodo.tributo_id;
        const tributoNombre = periodo.tributo?.nombre || "Sin nombre";
        const servicio = periodo.servicio;

        if (!tributosMapLocal[tributoId]) {
          tributosMapLocal[tributoId] = { 
            id: tributoId, 
            nombre: tributoNombre, 
            servicios: [] 
          };
        }

        if (servicio) {
          const exists = tributosMapLocal[tributoId].servicios.some(s => s.id === servicio.id);
          if (!exists) {
            tributosMapLocal[tributoId].servicios.push(servicio);
          }
        }
      });

      setTributosMap(Object.values(tributosMapLocal));
      setServicios([]);
      setSelectedTributo(null);
      setSelectedServicio(null);
      setPeriodos([]);
    } catch (error) {
      console.error("Error al procesar los datos del cliente:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al obtener los datos del cliente.",
      });
    }
  };

  // Función para manejar la selección de un tributo
  const handleTributoSelect = (e) => {
    const tributoId = e.target.value;
    const tributo = tributosMap.find((t) => t.id === parseInt(tributoId, 10));
    setSelectedTributo(tributoId);
    setServicios(tributo ? tributo.servicios : []);
    setSelectedServicio(null);
    setPeriodos([]);
  };

  // Función para manejar la selección de un servicio
  const handleServicioSelect = async (e) => {
    const servicioId = e.target.value;
    const servicio = servicios.find((s) => s.id === parseInt(servicioId, 10));
    setSelectedServicio(servicio);
    if (selectedCliente && servicio && selectedTributo) {
      setLoadingPeriodos(true);
      try {
        const tributoIdNumber = parseInt(selectedTributo, 10);
        const filteredPeriodos = clienteDatos.filter(
          (periodo) => 
            parseInt(periodo.servicio_id, 10) === servicio.id &&
            parseInt(periodo.tributo_id, 10) === tributoIdNumber
        ).map(periodo => ({
          ...periodo,
          i_debito: parseFloat(periodo.i_debito) || 0,
          i_descuento: parseFloat(periodo.i_descuento) || 0,
          i_recargo_actualizado: parseFloat(periodo.i_recargo_actualizado || periodo.i_recargo) || 0,
          total: (parseFloat(periodo.i_debito) || 0) - (parseFloat(periodo.i_descuento) || 0) + (parseFloat(periodo.i_recargo_actualizado) || 0),
        }));

        setPeriodos(filteredPeriodos);
      } catch (error) {
        console.error("Error al obtener los períodos:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Hubo un problema al obtener los períodos.",
        });
      } finally {
        setLoadingPeriodos(false);
      }
    } else if (!selectedTributo) {
      Swal.fire({
        icon: "warning",
        title: "Tributo no seleccionado",
        text: "Por favor, seleccione un tributo antes de seleccionar un servicio.",
      });
    }
  };

  // Función para reiniciar la selección
  const handleReset = () => {
    setSelectedCliente(null);
    setFilteredClientes(clientes);
    setSelectedTributo(null);
    setServicios([]);
    setSelectedServicio(null);
    setPeriodos([]);
    setClienteDatos([]);
  };

  // Función para manejar la edición de un periodo
  const handleEdit = useCallback((periodo) => {
    setSelectedPeriodo(periodo);
    setShowEditModal(true);
  }, []);

  // Función para manejar la actualización del periodo con actualización optimista
  const handleUpdatePeriodo = useCallback(async (updatedPeriodo) => {
    try {
      await customFetch(`/periodos/${updatedPeriodo.id}`, 'PUT', updatedPeriodo);
      setPeriodos(prevPeriodos => prevPeriodos.map(p => p.id === updatedPeriodo.id ? updatedPeriodo : p));
      setShowEditModal(false);
      Swal.fire('Éxito', 'Periodo modificado exitosamente.', 'success');
    } catch (error) {
      console.error('Error al modificar periodo:', error);
      Swal.fire('Error', 'Hubo un problema al modificar el periodo.', 'error');
    }
  }, []);

  // Función para manejar la eliminación de un periodo con eliminación optimista
  const handleDelete = useCallback(async (id) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción no se puede deshacer. ¿Deseas eliminar este período?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      });

      if (result.isConfirmed) {
        await customFetch(`/cuentas/${id}`, 'DELETE');
        setPeriodos(prevPeriodos => prevPeriodos.filter(p => p.id !== id));
        Swal.fire('Eliminado!', 'El período ha sido eliminado.', 'success');
      }
    } catch (error) {
      console.error('Error al eliminar periodo:', error);
      Swal.fire('Error', 'Hubo un problema al eliminar el período.', 'error');
    }
  }, []);

  // Definición de las columnas para react-table
  const columns = React.useMemo(
    () => [
      {
        Header: 'Mes',
        accessor: 'mes',
        Filter: DefaultColumnFilter,
      },
      {
        Header: 'Año',
        accessor: 'año',
        Filter: DefaultColumnFilter,
      },
      {
        Header: 'Volumen',
        accessor: 'cantidad',
        Filter: DefaultColumnFilter,
      },
      {
        Header: 'Importe',
        accessor: 'i_debito',
        Cell: ({ value }) => `$ ${value.toFixed(2)}`,
        Filter: DefaultColumnFilter,
      },
      {
        Header: 'Descuento',
        accessor: 'i_descuento',
        Cell: ({ value }) => `$ ${value.toFixed(2)}`,
        Filter: DefaultColumnFilter,
      },
      {
        Header: 'Recargo',
        accessor: 'i_recargo_actualizado',
        Cell: ({ value }) => `$ ${value.toFixed(2)}`,
        Filter: DefaultColumnFilter,
      },
      {
        Header: 'Total',
        accessor: 'total',
        Cell: ({ value }) => `$ ${value.toFixed(2)}`,
        Filter: DefaultColumnFilter,
      },
      {
        Header: 'Vencimiento',
        accessor: 'f_vencimiento',
        Cell: ({ value }) => value ? new Date(value).toLocaleDateString() : 'N/A',
        Filter: DefaultColumnFilter,
      },
      {
        Header: 'Fecha Creación',
        accessor: 'created_at',
        Cell: ({ value }) => value ? new Date(value).toLocaleDateString() : 'N/A',
        Filter: DefaultColumnFilter,
      },
      {
        Header: 'Condición',
        accessor: 'condicion_pago',
        Cell: ({ value }) => value || 'Impago',
        Filter: DefaultColumnFilter,
      },
      {
        Header: 'Fecha Pago',
        accessor: 'f_pago',
        Cell: ({ value }) => value ? new Date(value).toLocaleDateString() : 'N/A',
        Filter: DefaultColumnFilter,
      },
      {
        Header: 'Acciones',
        accessor: 'acciones',
        disableSortBy: true,
        disableFilters: true,
        Cell: ({ row }) => (
          <>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id={`tooltip-edit-${row.original.id}`}>Editar Período</Tooltip>}
            >
              <CustomButton
                variant="warning"
                size="sm"
                className="me-2"
                onClick={() => handleEdit(row.original)}
                aria-label={`Editar período ${row.original.id}`}
              >
                <FaEdit />
              </CustomButton>
            </OverlayTrigger>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id={`tooltip-delete-${row.original.id}`}>Eliminar Período</Tooltip>}
            >
              <CustomButton
                variant="danger"
                size="sm"
                onClick={() => handleDelete(row.original.id)}
                aria-label={`Eliminar período ${row.original.id}`}
              >
                <FaTrash />
              </CustomButton>
            </OverlayTrigger>
          </>
        ),
      },
    ],
    [handleEdit, handleDelete] // Añadidas dependencias para useMemo
  );

  // Uso de react-table
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page, // reemplaza a rows
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
      data: periodos,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useSortBy,
    usePagination
  );

  return (
    <Card className="shadow-sm p-4 mt-4">
      {/* Migas de Pan */}
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
          Inicio
        </Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/facturacion" }}>
          Facturación
        </Breadcrumb.Item>
        <Breadcrumb.Item active>
          Historial de Períodos
        </Breadcrumb.Item>
      </Breadcrumb>

      <h2 className="text-center mb-4 text-primary">Historial de Períodos</h2>

      {/* Encapsular la búsqueda y selección dentro de un Card */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          {/* Búsqueda de cliente */}
          <Form.Group controlId="cliente" className="mb-3">
            <Form.Label>Buscar Cliente</Form.Label>
            <Select
              components={animatedComponents}
              value={selectedCliente ? { value: selectedCliente.id, label: `${selectedCliente.persona?.nombre} ${selectedCliente.persona?.apellido} - DNI: ${selectedCliente.persona?.dni}` } : null}
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

      {/* Tabla de períodos */}
      {selectedServicio && (
        <div className="table-responsive">
          {loadingPeriodos ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </Spinner>
            </div>
          ) : (
            <>
              <Table {...getTableProps()} striped bordered hover>
                <thead>
                  {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map(column => (
                        <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                          {column.render('Header')}
                          {/* Añadir indicadores de orden */}
                          <span>
                            {column.isSorted
                              ? column.isSortedDesc
                                ? ' 🔽'
                                : ' 🔼'
                              : ''}
                          </span>
                          {/* Renderizar el filtro solo si existe */}
                          <div>{column.canFilter ? column.render('Filter') : null}</div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                  {page.map((row, i) => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()}>
                        {row.cells.map(cell => {
                          return (
                            <td {...cell.getCellProps()}>
                              {cell.render('Cell')}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </Table>

              {/* Paginación */}
              <div className="pagination d-flex justify-content-between align-items-center">
                <div>
                  <Button onClick={() => gotoPage(0)} disabled={!canPreviousPage} className="me-2">
                    {'<<'}
                  </Button>
                  <Button onClick={() => previousPage()} disabled={!canPreviousPage} className="me-2">
                    {'<'}
                  </Button>
                  <Button onClick={() => nextPage()} disabled={!canNextPage} className="me-2">
                    {'>'}
                  </Button>
                  <Button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                    {'>>'}
                  </Button>
                </div>
                <span>
                  Página{' '}
                  <strong>
                    {pageIndex + 1} de {pageOptions.length}
                  </strong>{' '}
                </span>
                <span>
                  | Ir a la página:{' '}
                  <input
                    type="number"
                    defaultValue={pageIndex + 1}
                    onChange={e => {
                      const page = e.target.value ? Number(e.target.value) - 1 : 0
                      gotoPage(page)
                    }}
                    style={{ width: '100px' }}
                    aria-label="Ir a la página"
                  />
                </span>
                <Form.Select
                  value={pageSize}
                  onChange={e => {
                    setPageSize(Number(e.target.value))
                  }}
                  aria-label="Seleccione el número de filas por página"
                  style={{ width: '150px' }}
                >
                  {[10, 20, 30, 40, 50].map(pageSize => (
                    <option key={pageSize} value={pageSize}>
                      Mostrar {pageSize}
                    </option>
                  ))}
                </Form.Select>
              </div>
            </>
          )}

          {/* Modal de edición */}
          <EditPeriodoModal
            show={showEditModal}
            handleClose={() => setShowEditModal(false)}
            periodo={selectedPeriodo}
            handleSubmit={handleUpdatePeriodo} // Asegúrate de que handleUpdatePeriodo esté definido
          />

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

// Exportación del componente
export default PeriodosHistorial;
