// src/components/common/charts/HistogramChart.jsx
import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { Spinner } from 'react-bootstrap';
import chartConfig from './ChartConfig';

const HistogramChart = React.memo(({ data, height = 350, loading = false }) => {
  // 1. Memoizar las opciones del gráfico siempre
  const mergedOptions = useMemo(() => ({
    ...chartConfig,
    chart: {
      ...chartConfig.chart,
      type: 'bar',
    },
    xaxis: {
      categories: data?.buckets || [],
      title: {
        text: 'Rangos de Ingresos (AR$)',
      },
    },
    yaxis: {
      title: {
        text: 'Frecuencia',
      },
    },
    title: {
      text: 'Distribución de Ingresos',
      align: 'center',
    },
    tooltip: {
      y: {
        formatter: (val) => val,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded',
      },
    },
    legend: {
      show: false,
    },
  }), [data?.buckets]);

  // 2. Memoizar las series del gráfico siempre
  const series = useMemo(() => [
    {
      name: 'Frecuencia',
      data: data?.counts || [],
    },
  ], [data?.counts]);

  // 3. Validar los datos utilizando useMemo
  const isDataValid = useMemo(() => {
    if (
      !data ||
      !Array.isArray(data.buckets) ||
      !Array.isArray(data.counts) ||
      data.buckets.length !== data.counts.length
    ) {
      return false;
    }
    const hasNaN = data.counts.some(count => isNaN(count));
    return !hasNaN;
  }, [data]);

  // 4. Renderizar condicionalmente
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando histograma...</span>
        </Spinner>
      </div>
    );
  }

  if (!isDataValid) {
    return <div className="text-center text-muted">Datos inválidos para el histograma.</div>;
  }

  return (
    <Chart
      options={mergedOptions}
      series={series}
      type="bar"
      height={height}
    />
  );
});

export default HistogramChart;
