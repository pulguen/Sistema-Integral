// src/components/common/charts/StackedBarChart.jsx
import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { Spinner } from 'react-bootstrap';
import chartConfig from './ChartConfig';

const StackedBarChart = React.memo(({ data, height = 350, loading = false }) => {
  // 1. Memoizar las opciones del gráfico siempre
  const mergedOptions = useMemo(() => ({
    ...chartConfig,
    chart: {
      ...chartConfig.chart,
      type: 'bar',
      stacked: true,
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
      text: 'Periodos Generados por Mes y Servicio',
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
      position: 'top',
      horizontalAlign: 'center',
    },
  }), [data?.categories]);

  // 2. Validar los datos utilizando useMemo
  const isDataValid = useMemo(() => {
    if (
      !data ||
      !Array.isArray(data.series) ||
      data.series.length === 0 ||
      !Array.isArray(data.categories)
    ) {
      return false;
    }
    const hasNaN = data.series.some(serie =>
      Array.isArray(serie.data) && serie.data.some(value => isNaN(value))
    );
    return !hasNaN;
  }, [data]);

  // 3. Renderizar condicionalmente
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando gráfico apilado...</span>
        </Spinner>
      </div>
    );
  }

  if (!isDataValid) {
    return <div className="text-center text-muted">Datos inválidos para el gráfico apilado.</div>;
  }

  return (
    <Chart
      options={mergedOptions}
      series={data.series}
      type="bar"
      height={height}
    />
  );
});

export default StackedBarChart;
