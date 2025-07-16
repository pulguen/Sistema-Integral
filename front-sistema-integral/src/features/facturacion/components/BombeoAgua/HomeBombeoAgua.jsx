import React, { useContext, useMemo, useState, useCallback } from 'react';
import { Card, Spinner, Row, Col, Alert, Button } from 'react-bootstrap';
import { BombeoAguaContext } from '../../../../context/BombeoAguaContext.jsx';
import { BarChart, RevenuePieChart, StackedBarChart, HeatmapChart, KpiCards } from '../../../../components/common/charts';
import CommonTable from '../../../../components/common/table/table.jsx';
import { formatDateOnlyDMY } from '../../../../utils/dateUtils.js';
import formatNumber from '../../../../utils/formatNumber.js';

const HomeBombeoAgua = () => {
  const {
    homePeriodos,
    loadingHomePeriodos,
    servicios,
    loadingServicios,
    fetchHomePeriodos,
    getPeriodosByServicio,
    getPeriodosByMonth,
    getRevenueByService,
    getHeatmapData,
    getKpis,
  } = useContext(BombeoAguaContext);

  // Paginación local
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const pageCount = useMemo(() => Math.ceil(homePeriodos.length / pageSize), [homePeriodos.length, pageSize]);
  const currentData = useMemo(() => {
    const start = pageIndex * pageSize;
    return homePeriodos.slice(start, start + pageSize);
  }, [homePeriodos, pageIndex, pageSize]);
  const fetchData = useCallback(({ page, per_page }) => {
    setPageIndex(page - 1);
    setPageSize(per_page);
  }, []);

  // Helper para nombre del servicio
  const getServiceNameById = useCallback(
    id => servicios.find(s => s.id === id)?.nombre || 'Servicio desconocido',
    [servicios]
  );

  // Columnas memoizadas
  const columns = useMemo(() => [
    {
      Header: '#',
      id: 'rowIndex',
      Cell: ({ row }) => row.index + 1 + pageIndex * pageSize,
    },
    {
      Header: 'Cliente',
      accessor: r => r.cliente?.clientable,
      Cell: ({ cell: { value } }) => {
        if (!value) return 'Cliente desconocido';
        const { nombre, apellido } = value;
        return apellido ? `${nombre} ${apellido}`.trim() : nombre;
      }
    },
    {
      Header: 'DNI/CUIT',
      id: 'identificacion',
      accessor: r => {
        const c = r.cliente?.clientable;
        return c?.dni || c?.cuit || null;
      },
      Cell: ({ cell: { value } }) => value || 'N/A'
    },
    {
      Header: 'Servicio',
      accessor: 'servicio_id',
      Cell: ({ cell: { value } }) => getServiceNameById(value)
    },
    { Header: 'Mes', accessor: 'mes' },
    { Header: 'Año', accessor: 'año' },
    { Header: 'Cuota', accessor: 'cuota' },
    {
      Header: 'Importe',
      accessor: 'i_debito',
      Cell: ({ cell: { value } }) => `$ ${formatNumber(parseFloat(value).toFixed(2))}`
    },
    {
      Header: 'Vencimiento',
      accessor: 'f_vencimiento',
      Cell: ({ cell: { value } }) => formatDateOnlyDMY(value)
    },
    {
      Header: 'Fecha Creación',
      accessor: 'created_at',
      Cell: ({ cell: { value } }) => formatDateOnlyDMY(value.split('T')[0])
    },
  ], [getServiceNameById, pageIndex, pageSize]);

  // Carga/errores
  if (loadingHomePeriodos || loadingServicios) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" />
        <span className="visually-hidden">Cargando...</span>
      </div>
    );
  }

  if (!loadingHomePeriodos && homePeriodos.length === 0) {
    return (
      <Card className="p-4 shadow-sm text-center">
        <Alert variant="info">
          No hay períodos generados aún. Cuando empiece el uso en producción,
          aquí aparecerán los datos.
        </Alert>
        <Button onClick={fetchHomePeriodos}>Reintentar</Button>
      </Card>
    );
  }

  // Render principal: los métodos ya devuelven todo listo
  return (
    <div className="home-bombeo-agua">
      <Card className="p-4 shadow-sm">
        <KpiCards {...getKpis()} />

        <Row className="mb-4">
          <Col xs={12} md={6} lg={4} className="mb-4">
            <Card className="h-100"><Card.Body>
              <h5 className="text-center mb-3">Comparativa de Períodos Generados</h5>
              <RevenuePieChart data={getPeriodosByServicio()} height={250} />
            </Card.Body></Card>
          </Col>
          <Col xs={12} md={6} lg={4} className="mb-4">
            <Card className="h-100"><Card.Body>
              <h5 className="text-center mb-3">Distribución de Ingresos por Servicios</h5>
              <RevenuePieChart data={getRevenueByService()} height={250} />
            </Card.Body></Card>
          </Col>
          <Col xs={12} md={6} lg={4} className="mb-4">
            <Card className="h-100"><Card.Body>
              <h5 className="text-center mb-3">Períodos Generados por Mes</h5>
              <BarChart data={getPeriodosByMonth()} height={250} />
            </Card.Body></Card>
          </Col>
        </Row>
        <Row className="mb-4">
          <Col xs={12} md={6} lg={6} className="mb-4">
            <Card className="h-100"><Card.Body>
              <h5 className="text-center mb-3">Períodos por Mes y Servicio</h5>
              <StackedBarChart
                data={{
                  categories: getPeriodosByMonth().categories,
                  series: [
                    ...getPeriodosByMonth().series,
                  ]
                }}
                height={250}
              />
            </Card.Body></Card>
          </Col>
          <Col xs={12} md={6} lg={6} className="mb-4">
            <Card className="h-100"><Card.Body>
              <h5 className="text-center mb-3">Mapa de Calor de Períodos</h5>
              <HeatmapChart data={getHeatmapData()} height={300} />
            </Card.Body></Card>
          </Col>
        </Row>

        <h2 className="text-center mb-4">Últimos Períodos Generados</h2>
        <CommonTable
          columns={columns}
          data={currentData}
          loading={false}
          fetchData={fetchData}
          controlledPageCount={pageCount}
          initialPageIndex={pageIndex}
          initialPageSize={pageSize}
          pageSizeOptions={[15, 30, 45, 60]}
        />
      </Card>
    </div>
  );
};

export default HomeBombeoAgua;
