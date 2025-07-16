import React from 'react';
import { Table, Button, Spinner, Form, Alert } from 'react-bootstrap';
import { useTable, useSortBy, usePagination } from 'react-table';

function DefaultColumnFilter({ column: { filterValue, setFilter } }) {
  return (
    <input
      value={filterValue || ''}
      onChange={e => setFilter(e.target.value || undefined)}
      placeholder="Buscar..."
      style={{ width: '100%' }}
      aria-label="Filtro de columna"
    />
  );
}

const PAGE_SIZE_OPTIONS = [15, 30, 45, 60];

const CommonTable = ({
  columns,
  data,
  loading = false,
  fetchData,               // (opcional) para paginación server-side
  controlledPageCount,     // solo en server-side
  initialPageIndex,
  initialPageSize,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  onRowClick,
  className = '',
  ...rest
}) => {
  const isServerSide = typeof fetchData === 'function';

  const defaultColumn = React.useMemo(() => ({ Filter: DefaultColumnFilter }), []);

  const tableOptions = {
    columns,
    data,
    defaultColumn,
    manualPagination: isServerSide,
    pageCount: isServerSide ? controlledPageCount : undefined,
    autoResetPage: false
  };
  if (isServerSide && typeof initialPageIndex !== "undefined" && typeof initialPageSize !== "undefined") {
    tableOptions.initialState = { pageIndex: initialPageIndex, pageSize: initialPageSize };
  } else if (!isServerSide) {
    tableOptions.initialState = { pageIndex: 0, pageSize: pageSizeOptions[0] };
  }

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
    state: { pageIndex, pageSize }
  } = useTable(
    tableOptions,
    useSortBy,
    usePagination
  );

  React.useEffect(() => {
    if (isServerSide && fetchData) {
      fetchData({ page: pageIndex + 1, per_page: pageSize });
    }
    // eslint-disable-next-line
  }, [isServerSide, fetchData, pageIndex, pageSize]);

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border"/></div>;
  }
  if (!loading && data.length === 0) {
    return <Alert variant="info" className="mt-3">No hay registros para mostrar.</Alert>;
  }

  return (
    <div className={`common-table ${className}`}>
      <div className="table-responsive">
        <Table {...getTableProps()} striped bordered hover {...rest}>
          <thead>
            {headerGroups.map(hg => (
              <tr key={hg.id} {...hg.getHeaderGroupProps()}>
                {hg.headers.map(col => (
                  <th key={col.id} {...col.getHeaderProps(col.getSortByToggleProps())}>
                    {col.render('Header')}
                    {col.isSorted ? (col.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                    {col.canFilter && <div>{col.render('Filter')}</div>}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map(row => {
              prepareRow(row);
              return (
                <tr
                  key={row.id || row.original.id || row.index}
                  {...row.getRowProps({
                    onClick: () => onRowClick && onRowClick(row.original),
                    style: { cursor: onRowClick ? 'pointer' : 'default' }
                  })}
                >
                  {row.cells.map(cell => (
                    <td key={cell.column.id} {...cell.getCellProps()}>
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
      <div className="pagination d-flex justify-content-between align-items-center mt-3">
        <div>
          <Button onClick={() => gotoPage(0)} disabled={!canPreviousPage} className="me-2">{'<<'}</Button>
          <Button onClick={() => previousPage()} disabled={!canPreviousPage} className="me-2">{'<'}</Button>
          <Button onClick={() => nextPage()} disabled={!canNextPage} className="me-2">{'>'}</Button>
          <Button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>{'>>'}</Button>
        </div>
        <span>Página <strong>{pageIndex + 1} de {pageOptions.length}</strong></span>
        <span>| Ir a la página: {' '}
          <input
            type="number"
            min={1}
            max={pageOptions.length}
            value={pageIndex + 1}
            onChange={e => {
              let p = Number(e.target.value) - 1;
              if (isNaN(p) || p < 0) p = 0;
              if (p >= pageCount) p = pageCount - 1;
              gotoPage(p);
            }}
            style={{ width: '60px' }}
          />
        </span>
        <Form.Select
          value={pageSize}
          onChange={e => setPageSize(Number(e.target.value))}
          style={{ width: '120px' }}
        >
          {pageSizeOptions.map(size => (
            <option key={size} value={size}>Mostrar {size}</option>
          ))}
        </Form.Select>
      </div>
    </div>
  );
};

export default CommonTable;
