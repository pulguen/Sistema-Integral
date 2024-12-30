// src/features/facturacion/components/BombeoAgua/HomeBombeoAgua.jsx

import React, { useContext, useEffect, useState } from 'react';
import {
  Card,
  Table,
  Spinner,
  Button,
  Row,
  Col,
} from 'react-bootstrap';
import { BombeoAguaContext } from '../../../../context/BombeoAguaContext';

import { 
  BarChart, 
  RevenuePieChart, 
  StackedBarChart, 
  HeatmapChart, 
  KpiCards 
} from '../../../../components/common/charts'; // Eliminado LineChart y HistogramChart

const HomeBombeoAgua = () => {
  const {
    homePeriodos,
    loadingHomePeriodos,
    getPeriodosByServicio,
    getPeriodosByMonth,
    // getTrendPeriodos, // Eliminado
    getRevenueByService,
    // getIncomeDistribution, // Eliminado
    getHeatmapData,
    getKpis,
    servicios,
    loadingServicios,
  } = useContext(BombeoAguaContext);

  const [chartDataServicio, setChartDataServicio] = useState(null);
  const [chartDataMes, setChartDataMes] = useState(null);
  // const [chartDataTrend, setChartDataTrend] = useState(null); // Eliminado
  const [chartDataRevenue, setChartDataRevenue] = useState(null);
  // const [chartDataHistogram, setChartDataHistogram] = useState(null); // Eliminado
  const [chartDataHeatmap, setChartDataHeatmap] = useState(null);
  const [kpiData, setKpiData] = useState({
    totalPeriodos: 0,
    totalIngresos: 0,
    promedioMensual: 0,
  });

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const servicioData = await getPeriodosByServicio();
        setChartDataServicio(servicioData);

        const mesData = await getPeriodosByMonth();
        setChartDataMes(mesData);

        // Eliminado trendData
        // const trendData = await getTrendPeriodos();
        // setChartDataTrend(trendData);

        const revenueData = await getRevenueByService();
        setChartDataRevenue(revenueData);

        // Eliminado histogramData
        // const histogramData = await getIncomeDistribution();
        // setChartDataHistogram(histogramData);

        const heatmapData = await getHeatmapData();
        setChartDataHeatmap(heatmapData);

        const kpis = getKpis();
        setKpiData(kpis);
      } catch (err) {
        console.error("Error al obtener datos de los gráficos:", err);
      }
    };

    fetchChartData();
  }, [
    getPeriodosByServicio, 
    getPeriodosByMonth, 
    // getTrendPeriodos, // Eliminado
    getRevenueByService, 
    // getIncomeDistribution, // Eliminado
    getHeatmapData,
    getKpis,
  ]);

  const getServiceNameById = (serviceId) => {
    const service = servicios.find(
      (servicio) => servicio.id === serviceId
    );
    return service ? service.nombre : 'Servicio desconocido';
  };

  const toggleDisplayLimit = () => {
    setDisplayLimit(
      displayLimit === 6 ? homePeriodos.length : 6
    );
  };

  const [displayLimit, setDisplayLimit] = useState(6);

  return (
    <div className="home-bombeo-agua">
      <Card className="p-4 shadow-sm">
        {(loadingHomePeriodos || loadingServicios) ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Cargando...</span>
            </Spinner>
          </div>
        ) : (
          <>
            {/* KPIs */}
            {homePeriodos.length > 0 && (
              <KpiCards
                totalPeriodos={kpiData.totalPeriodos}
                totalIngresos={kpiData.totalIngresos}
                promedioMensual={kpiData.promedioMensual}
              />
            )}

            {/* Gráficos */}
            {homePeriodos.length > 0 && (
              <>
                {/* Primera Fila de Gráficos */}
                <Row className="mb-4">
                  {/* Comparativa de Períodos Generados */}
                  <Col xs={12} md={6} lg={4} className="mb-4">
                    <Card className="h-100">
                      <Card.Body>
                        <h5 className="text-center mb-3">Comparativa de Períodos Generados</h5>
                        {chartDataServicio ? (
                          <RevenuePieChart data={chartDataServicio} height={250} />
                        ) : (
                          <div className="text-center py-5">
                            <Spinner animation="border" role="status">
                              <span className="visually-hidden">Cargando...</span>
                            </Spinner>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Distribución de Ingresos por Servicios */}
                  <Col xs={12} md={6} lg={4} className="mb-4">
                    <Card className="h-100">
                      <Card.Body>
                        <h5 className="text-center mb-3">Distribución de Ingresos por Servicios</h5>
                        {chartDataRevenue ? (
                          <RevenuePieChart data={chartDataRevenue} height={250} />
                        ) : (
                          <div className="text-center py-5">
                            <Spinner animation="border" role="status">
                              <span className="visually-hidden">Cargando...</span>
                            </Spinner>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Períodos Generados por Mes */}
                  <Col xs={12} md={6} lg={4} className="mb-4">
                    <Card className="h-100">
                      <Card.Body>
                        <h5 className="text-center mb-3">Períodos Generados por Mes</h5>
                        {chartDataMes ? (
                          <BarChart data={chartDataMes} height={250} />
                        ) : (
                          <div className="text-center py-5">
                            <Spinner animation="border" role="status">
                              <span className="visually-hidden">Cargando...</span>
                            </Spinner>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Segunda Fila de Gráficos */}
                <Row className="mb-4">
                  {/* Períodos Generados por Mes y Servicio */}
                  <Col xs={12} md={6} lg={6} className="mb-4">
                    <Card className="h-100">
                      <Card.Body>
                        <h5 className="text-center mb-3">Períodos Generados por Mes y Servicio</h5>
                        {chartDataMes && chartDataServicio ? (
                          <StackedBarChart data={{
                            categories: chartDataMes.categories,
                            series: [
                              {
                                name: 'Ingresos por Servicio',
                                data: chartDataServicio.series,
                              },
                              // Puedes añadir más series si tienes múltiples servicios
                            ],
                          }} height={250} />
                        ) : (
                          <div className="text-center py-5">
                            <Spinner animation="border" role="status">
                              <span className="visually-hidden">Cargando...</span>
                            </Spinner>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Mapa de Calor de Períodos Generados */}
                  <Col xs={12} md={6} lg={6} className="mb-4">
                    <Card className="h-100">
                      <Card.Body>
                        <h5 className="text-center mb-3">Mapa de Calor de Períodos Generados</h5>
                        {chartDataHeatmap ? (
                          <HeatmapChart data={chartDataHeatmap} height={300} />
                        ) : (
                          <div className="text-center py-5">
                            <Spinner animation="border" role="status">
                              <span className="visually-hidden">Cargando...</span>
                            </Spinner>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </>
            )}

            {/* Tabla de Períodos Generados */}
            <h2 className="text-center mb-4">Últimos Períodos Generados</h2>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>DNI</th>
                  <th>Servicio</th>
                  <th>Mes</th>
                  <th>Año</th>
                  <th>Cuota</th>
                  <th>Importe AR$</th>
                  <th>Vencimiento</th>
                  <th>Fecha Creación</th>
                </tr>
              </thead>
              <tbody>
                {homePeriodos.length > 0 ? (
                  homePeriodos.slice(0, displayLimit).map((periodo, index) => (
                    <tr key={periodo.id}>
                      <td>{index + 1}</td>
                      <td>
                        {periodo.cliente && periodo.cliente.persona
                          ? `${periodo.cliente.persona.nombre} ${periodo.cliente.persona.apellido}`
                          : 'Cliente desconocido'}
                      </td>
                      <td>{periodo.cliente?.persona?.dni ?? 'N/A'}</td>
                      <td>{getServiceNameById(periodo.servicio_id)}</td>
                      <td>{periodo.mes}</td>
                      <td>{periodo.año}</td>
                      <td>{periodo.cuota}</td>
                      <td>{`${parseFloat(periodo.i_debito).toFixed(2)}`}</td>
                      <td>
                        {periodo.f_vencimiento
                          ? new Date(periodo.f_vencimiento).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td>
                        {periodo.created_at
                          ? new Date(periodo.created_at).toLocaleDateString()
                          : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center text-muted">
                      No hay períodos disponibles.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
            {homePeriodos.length > 6 && (
              <div className="text-center mt-3">
                <Button
                  variant="outline-primary"
                  onClick={toggleDisplayLimit}
                >
                  {displayLimit === 6 ? 'Mostrar más' : 'Mostrar menos'}
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default HomeBombeoAgua;
