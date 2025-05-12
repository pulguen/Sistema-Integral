// src/features/facturacion/components/BombeoAgua/PeriodosHistory.jsx
import React from "react";
import CommonTable from "../../../../components/common/table/table.jsx";
import { Spinner } from "react-bootstrap";

export default function PeriodosHistory({ periodos, loading, columns }) {
  return (
    <section className="form-section mb-4">
      <h4 className="mb-3 text-secondary">Historial de Períodos</h4>
      {loading ? (
        <div className="text-center py-3">
          <Spinner animation="border" />
        </div>
      ) : (
        <CommonTable
          columns={columns}
          data={periodos}
          loading={false}
          initialPageSize={10}
          pageSizeOptions={[5, 10, 20]}
        />
      )}
    </section>
  );
}