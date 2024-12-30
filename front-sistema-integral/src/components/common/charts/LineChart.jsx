// src/components/common/charts/LineChart.jsx
import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { Spinner } from 'react-bootstrap';
import chartConfig from './ChartConfig';

const LineChart = React.memo(({ data, height = 350, loading = false }) => {
  // 1. Memoizar las opciones del gráfico siempre
  const mergedOptions = useMemo(() => ({
    ...chartConfig,
    chart: {
      ...chartConfig.chart,
      type: 'line',
    },
    xaxis: {
      categories: data?.categories || [],
      title: {
        text: 'Meses',
      },
    },
    yaxis: {
      title: {
        text: 'Cantidad de Periodos',
      },
    },
    title: {
      text: 'Tendencia de Periodos Generados',
      align: 'center',
    },
    tooltip: {
      y: {
        formatter: (val) => val,
      },
    },
    stroke: {
      curve: 'straight',
    },
  }), [data?.categories]);

  // 2. Validar los datos utilizando useMemo
  const isDataValid = useMemo(() => {
    if (
      !data ||
      !Array.isArray(data.series) ||
      data.series.length === 0 ||
      !Array.isArray(data.series[0].data) ||
      !Array.isArray(data.categories)
    ) {
      return false;
    }
    const hasNaN = data.series.some(serie =>
      Array.isArray(serie.data) && serie.data.some(value => isNaN(value))
    );
    return !hasNaN;
  }, [data]);

  // 3. Verificar que hay al menos dos puntos de datos
  const hasSufficientData = useMemo(() => {
    if (!data || !data.series) return false;
    const totalDataPoints = data.series.reduce((acc, serie) => acc + serie.data.length, 0);
    return totalDataPoints >= 2;
  }, [data]);

  // 4. Renderizar condicionalmente
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando gráfico de línea...</span>
        </Spinner>
      </div>
    );
  }

  if (!isDataValid) {
    return <div className="text-center text-muted">Datos inválidos para el gráfico de tendencia.</div>;
  }

  if (!hasSufficientData) {
    return <div className="text-center text-muted">No hay suficientes datos para mostrar la tendencia.</div>;
  }

  return (
    <Chart
      options={mergedOptions}
      series={data.series}
      type="line"
      height={height}
    />
  );
});

export default LineChart;
