// src/components/common/charts/HeatmapChart.jsx
import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { Spinner } from 'react-bootstrap';
import chartConfig from './ChartConfig';

const HeatmapChart = React.memo(({ data, height = 350, loading = false }) => {
  // 1. Memoizar las opciones del gráfico siempre
  const mergedOptions = useMemo(() => ({
    ...chartConfig,
    chart: {
      ...chartConfig.chart,
      type: 'heatmap',
    },
    xaxis: {
      categories: data?.categories || [],
      title: {
        text: 'Meses',
      },
    },
    yaxis: {
      categories: data?.yCategories || [],
      title: {
        text: 'Años',
      },
    },
    title: {
      text: 'Mapa de Calor de Periodos Generados',
      align: 'center',
    },
    colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560'],
    legend: {
      position: 'top',
      horizontalAlign: 'center',
    },
  }), [data?.categories, data?.yCategories]);

  // 2. Validar los datos utilizando useMemo
  const isDataValid = useMemo(() => {
    if (
      !data ||
      !Array.isArray(data.series) ||
      data.series.length === 0 ||
      !Array.isArray(data.categories) ||
      !Array.isArray(data.yCategories)
    ) {
      return false;
    }
    const hasNaN = data.series.some(serie =>
      Array.isArray(serie.data) && serie.data.some(value => isNaN(value.y))
    );
    return !hasNaN;
  }, [data]);

  // 3. Renderizar condicionalmente
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando mapa de calor...</span>
        </Spinner>
      </div>
    );
  }

  if (!isDataValid) {
    return <div className="text-center text-muted">Datos inválidos para el mapa de calor.</div>;
  }

  return (
    <Chart
      options={mergedOptions}
      series={data.series}
      type="heatmap"
      height={height}
    />
  );
});

export default HeatmapChart;
