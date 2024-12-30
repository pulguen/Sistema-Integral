// src/components/common/charts/BaseChart.jsx
import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { Spinner } from 'react-bootstrap';
import chartConfig from './ChartConfig';

const BaseChart = React.memo(({ type, series, options = {}, height = 350, loading = false }) => {
  // 1. Memoizar las opciones del gráfico siempre
  const mergedOptions = useMemo(() => ({
    ...chartConfig,
    ...options,
    chart: {
      ...chartConfig.chart,
      type: type,
    },
  }), [type, options]);

  // 2. Validar los datos utilizando useMemo
  const isDataValid = useMemo(() => {
    if (!series || series.length === 0) {
      return false;
    }
    // Dependiendo del tipo de gráfico, podrías agregar más validaciones
    return true;
  }, [series]);

  // 3. Renderizar condicionalmente
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando gráfico...</span>
        </Spinner>
      </div>
    );
  }

  if (!isDataValid) {
    return <div className="text-center text-muted">Datos inválidos para el gráfico.</div>;
  }

  return (
    <Chart
      options={mergedOptions}
      series={series}
      type={type}
      height={height}
    />
  );
});

export default BaseChart;
