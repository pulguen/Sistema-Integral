import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  Card,
  Spinner,
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
} from '../../../../components/common/charts';
import CommonTable from '../../../../components/common/table/table.jsx';
const HomeBombeoAgua = () => {
  const {
    homePeriodos,
    loadingHomePeriodos,
    getPeriodosByServicio,
    getPeriodosByMonth,
    getRevenueByService,
    getHeatmapData,
    getKpis,
    servicios,
    loadingServicios,
  } = useContext(BombeoAguaContext);

  const [chartDataServicio, setChartDataServicio] = useState(null);
  const [chartDataMes, setChartDataMes] = useState(null);
  const [chartDataRevenue, setChartDataRevenue] = useState(null);
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

        const revenueData = await getRevenueByService();
        setChartDataRevenue(revenueData);

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
    getRevenueByService, 
    getHeatmapData,
    getKpis,
  ]);

  // Memorizar la función para evitar que se vuelva a crear y evitar warnings en useMemo
  const getServiceNameById = useCallback((serviceId) => {
    const service = servicios.find(
      (servicio) => servicio.id === serviceId
    );
    return service ? service.nombre : 'Servicio desconocido';
  }, [servicios]);

  // Definición de columnas para el CommonTable
  const columns = useMemo(() => [
    {
      Header: '#',
      id: 'rowIndex',
      Cell: ({ row }) => row.index + 1,
    },
    {
      Header: 'Cliente',
      accessor: 'cliente',
      Cell: ({ cell: { value } }) =>
        value && value.persona
          ? `${value.persona.nombre || ''} ${value.persona.apellido || ''}`.trim()
          : 'Cliente desconocido',
    },
    {
      Header: 'DNI',
      id: 'dni',
      accessor: (row) => row.cliente?.persona?.dni,
      Cell: ({ cell: { value } }) => value || 'N/A',
    },
    {
      Header: 'Servicio',
      accessor: 'servicio_id',
      Cell: ({ cell: { value } }) => getServiceNameById(value),
    },
    {
      Header: 'Mes',
      accessor: 'mes',
    },
    {
      Header: 'Año',
      accessor: 'año',
    },
    {
      Header: 'Cuota',
      accessor: 'cuota',
    },
    {
      Header: 'Importe AR$',
      accessor: 'i_debito',
      Cell: ({ cell: { value } }) => parseFloat(value).toFixed(2),
    },
    {
      Header: 'Vencimiento',
      accessor: 'f_vencimiento',
      Cell: ({ cell: { value } }) =>
        value ? new Date(value).toLocaleDateString() : 'N/A',
    },
    {
      Header: 'Fecha Creación',
      accessor: 'created_at',
      Cell: ({ cell: { value } }) =>
        value ? new Date(value).toLocaleDateString() : 'N/A',
    },
  ], [getServiceNameById]);

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
                          <StackedBarChart
                            data={{
                              categories: chartDataMes.categories,
                              series: [
                                {
                                  name: 'Ingresos por Servicio',
                                  data: chartDataServicio.series,
                                },
                              ],
                            }}
                            height={250}
                          />
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

            {/* Tabla de Períodos Generados usando CommonTable */}
            <h2 className="text-center mb-4">Últimos Períodos Generados</h2>
            <CommonTable columns={columns} data={homePeriodos} />
          </>
        )}
      </Card>
    </div>
  );
};

export default HomeBombeoAgua;
