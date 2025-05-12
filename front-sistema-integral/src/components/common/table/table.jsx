// src/components/common/table/table.jsx
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

const CommonTable = ({
  columns,
  data,
  loading = false,
  fetchData,             // si lo pasas, modo servidor
  controlledPageCount,
  initialPageIndex = 0,
  initialPageSize = 15,
  pageSizeOptions = [15, 30, 45, 60],
  onRowClick,
  className = '',
  ...rest
}) => {
  const isServerSide = typeof fetchData === 'function';

  const defaultColumn = React.useMemo(() => ({ Filter: DefaultColumnFilter }), []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,               // filas de la página actual
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
    {
      columns,
      data,
      defaultColumn,
      manualPagination: isServerSide,
      pageCount: isServerSide ? controlledPageCount : undefined,
      autoResetPage: false,
      initialState: { pageIndex: initialPageIndex, pageSize: initialPageSize }
    },
    useSortBy,
    usePagination
  );

  // si estamos en remoto, cada vez que cambie pageIndex o pageSize...
  React.useEffect(() => {
    if (isServerSide) {
      fetchData({ page: pageIndex + 1, per_page: pageSize });
    }
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
                  key={row.id}
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
      <div className="pagination d-flex justify-content-between align-items-center">
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
            value={pageIndex + 1}
            onChange={e => {
              const p = e.target.value ? Number(e.target.value) - 1 : 0;
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
