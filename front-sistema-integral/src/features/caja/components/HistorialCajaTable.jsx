import React from 'react';
import { Spinner, Form, Button, Alert } from 'react-bootstrap';

const PAGE_SIZE_OPTIONS = [15, 30, 45, 60];

function HistorialCajaTable({
  data, loading, pageIndex, pageSize, pageCount,
  gotoPage, previousPage, nextPage, setPageSize,
  canPreviousPage, canNextPage, columns
}) {
  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" /></div>;
  }
  if (!loading && data.length === 0) {
    return <Alert variant="info" className="mt-3">No hay registros para mostrar.</Alert>;
  }
  return (
    <div className="common-table">
      <div className="table-responsive">
        <table className="table table-striped table-bordered table-hover">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.accessor || col.Header}>{col.Header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={row.id || idx}
                style={{ cursor: 'pointer' }}
              >
                {columns.map(col => (
                  <td key={col.accessor}>
                    {col.Cell
                      ? col.Cell({ value: row[col.accessor], row: { original: row } })
                      : row[col.accessor]
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination d-flex justify-content-between align-items-center mt-3">
        <div>
          <Button onClick={() => gotoPage(0)} disabled={!canPreviousPage} className="me-2">{'<<'}</Button>
          <Button onClick={previousPage} disabled={!canPreviousPage} className="me-2">{'<'}</Button>
          <Button onClick={nextPage} disabled={!canNextPage} className="me-2">{'>'}</Button>
          <Button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>{'>>'}</Button>
        </div>
        <span>
          Página <strong>{pageIndex + 1} de {pageCount}</strong>
        </span>
        <span>
          | Ir a la página: {' '}
          <input
            type="number"
            min={1}
            max={pageCount}
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
          {PAGE_SIZE_OPTIONS.map(size => (
            <option key={size} value={size}>Mostrar {size}</option>
          ))}
        </Form.Select>
      </div>
    </div>
  );
}
export default HistorialCajaTable;
