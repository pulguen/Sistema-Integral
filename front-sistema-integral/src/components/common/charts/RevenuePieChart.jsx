// src/components/common/charts/RevenuePieChart.jsx
import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { Spinner } from 'react-bootstrap';
import chartConfig from './ChartConfig';

const RevenuePieChart = React.memo(({ data, height = 350, loading = false }) => {
  // 1. Memoizar las opciones del gráfico siempre
  const mergedOptions = useMemo(() => ({
    ...chartConfig,
    labels: data?.labels || [],
    title: {
      text: 'Distribución de Ingresos por Servicio',
      align: 'center',
    },
    legend: {
      position: 'bottom',
    },
  }), [data?.labels]);

  // 2. Validar los datos utilizando useMemo
  const isDataValid = useMemo(() => {
    if (
      !data ||
      !Array.isArray(data.series) ||
      data.series.length === 0 ||
      !Array.isArray(data.labels) ||
      data.labels.length === 0
    ) {
      return false;
    }
    const hasNaN = data.series.some(value => isNaN(value));
    return !hasNaN;
  }, [data]);

  // 3. Renderizar condicionalmente
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando gráfico de ingresos...</span>
        </Spinner>
      </div>
    );
  }

  if (!isDataValid) {
    return <div className="text-center text-muted">Datos inválidos para el gráfico de ingresos por servicio.</div>;
  }

  return (
    <Chart
      options={mergedOptions}
      series={data.series}
      type="pie"
      height={height}
    />
  );
});

export default RevenuePieChart;
