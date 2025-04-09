import React from 'react';
import { Table, Button, Spinner, Form } from 'react-bootstrap';
import { useTable, useSortBy, usePagination } from 'react-table';

/**
 * Filtro por defecto para cada columna.
 */
function DefaultColumnFilter({ column: { filterValue, setFilter } }) {
  return (
    <input
      value={filterValue || ''}
      onChange={(e) => setFilter(e.target.value || undefined)}
      placeholder="Buscar..."
      style={{ width: '100%' }}
      aria-label="Filtro de columna"
    />
  );
}

/**
 * Componente de Tabla Común
 *
 * Props:
 * - columns: Arreglo de columnas para react-table (con propiedades como Header, accessor, Cell, Filter, etc.).
 * - data: Arreglo de objetos con la información de las filas.
 * - loading: Booleano para indicar si se debe mostrar un spinner (opcional).
 * - initialPageIndex: Página inicial de la paginación (por defecto 0).
 * - initialPageSize: Tamaño inicial de página (por defecto 10).
 * - pageSizeOptions: Opciones para seleccionar cantidad de filas por página (por defecto [10,20,30,40,50]).
 * - onRowClick: Función callback opcional que se dispara al hacer clic en una fila.
 * - className: Clases CSS adicionales para el contenedor.
 * - ...rest: Otras props que se pueden pasar al componente Table de react-bootstrap.
 */
const CommonTable = ({
  columns,
  data,
  loading = false,
  initialPageIndex = 0,
  initialPageSize = 10,
  pageSizeOptions = [10, 20, 30, 40, 50],
  onRowClick,
  className = '',
  ...rest
}) => {
  // Define una columna por defecto que incluya el filtro
  const defaultColumn = React.useMemo(() => ({
    Filter: DefaultColumnFilter,
  }), []);

  // Configuración de react-table con ordenamiento y paginación
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page, // filas de la página actual
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
      data,
      defaultColumn,
      initialState: { pageIndex: initialPageIndex, pageSize: initialPageSize },
    },
    useSortBy,
    usePagination
  );

  return (
    <div className={`common-table ${className}`}>
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
        </div>
      ) : (
        <>
          {/* Contenedor responsivo para evitar desbordamientos */}
          <div className="table-responsive">
            <Table {...getTableProps()} striped bordered hover {...rest}>
              <thead>
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                    {headerGroup.headers.map((column) => (
                      <th
                        {...column.getHeaderProps(column.getSortByToggleProps())}
                        key={column.id}
                      >
                        {column.render('Header')}
                        {/* Iconos de ordenamiento */}
                        {column.isSorted
                          ? column.isSortedDesc
                            ? ' 🔽'
                            : ' 🔼'
                          : ''}
                        {/* Filtro de columna (si se permite) */}
                        {column.canFilter && <div>{column.render('Filter')}</div>}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {page.map((row) => {
                  prepareRow(row);
                  return (
                    <tr
                      {...row.getRowProps()}
                      key={row.id}
                      onClick={() => onRowClick && onRowClick(row.original)}
                      style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                    >
                      {row.cells.map((cell) => (
                        <td {...cell.getCellProps()} key={cell.column.id}>
                          {cell.render('Cell')}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>

          {/* Controles de paginación */}
          <div className="pagination d-flex justify-content-between align-items-center">
            <div>
              <Button
                onClick={() => gotoPage(0)}
                disabled={!canPreviousPage}
                className="me-2"
              >
                {'<<'}
              </Button>
              <Button
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
                className="me-2"
              >
                {'<'}
              </Button>
              <Button
                onClick={() => nextPage()}
                disabled={!canNextPage}
                className="me-2"
              >
                {'>'}
              </Button>
              <Button
                onClick={() => gotoPage(pageCount - 1)}
                disabled={!canNextPage}
              >
                {'>>'}
              </Button>
            </div>
            <span>
              Página <strong>{pageIndex + 1} de {pageOptions.length}</strong>
            </span>
            <span>
              | Ir a la página:{' '}
              <input
                type="number"
                defaultValue={pageIndex + 1}
                onChange={(e) => {
                  const pageNumber = e.target.value
                    ? Number(e.target.value) - 1
                    : 0;
                  gotoPage(pageNumber);
                }}
                style={{ width: '100px' }}
                aria-label="Ir a la página"
              />
            </span>
            <Form.Select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              style={{ width: '150px' }}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  Mostrar {size}
                </option>
              ))}
            </Form.Select>
          </div>
        </>
      )}
    </div>
  );
};

export default CommonTable;
