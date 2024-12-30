// src/components/common/charts/PieChart.jsx

import React from 'react';
import PropTypes from 'prop-types';
import Chart from 'react-apexcharts';

const PieChart = ({ data, height = 300 }) => {
  const options = {
    labels: data.labels,
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  const series = data.series;

  return (
    <Chart options={options} series={series} type="pie" height={height} />
  );
};

PieChart.propTypes = {
  data: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.string).isRequired,
    series: PropTypes.arrayOf(PropTypes.number).isRequired,
  }).isRequired,
  height: PropTypes.number,
};

export default PieChart;
