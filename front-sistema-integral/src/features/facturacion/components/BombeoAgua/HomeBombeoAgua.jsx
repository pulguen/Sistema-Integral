import React, { useContext, useEffect, useState } from 'react';
import { Card, Table, Spinner, Button } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { BombeoAguaContext } from '../../../../context/BombeoAguaContext';
import customFetch from '../../../../context/CustomFetch.js';

const HomeBombeoAgua = () => {
  const { setHomePeriodos, homePeriodos, loadingHomePeriodos, setLoadingHomePeriodos, servicios, setServicios } = useContext(BombeoAguaContext);
  const [displayLimit, setDisplayLimit] = useState(6);

  // Obtener el nombre del servicio según el ID del servicio en cada periodo
  const getServiceNameById = (serviceId) => {
    const service = servicios.find((servicio) => servicio.id === serviceId);
    return service ? service.nombre : 'Servicio desconocido';
  };

  // Fetch de datos de periodos y servicios
  useEffect(() => {
    const fetchData = async () => {
      setLoadingHomePeriodos(true);
      try {
        const periodosData = await customFetch('http://10.0.0.17/municipalidad/public/api/cuentas');
        if (periodosData && periodosData[0]) {
          const sortedPeriodos = periodosData[0].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setHomePeriodos(sortedPeriodos);
        } else {
          Swal.fire('Error', 'No se encontraron datos de periodos.', 'error');
        }

        // Obtener servicios si aún no están en el contexto
        if (servicios.length === 0) {
          const serviciosData = await customFetch('http://10.0.0.17/municipalidad/public/api/tributos/1');
          setServicios(serviciosData.servicios || []);
        }
      } catch (error) {
        console.error('Error al obtener datos:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al obtener los datos de periodos o servicios.',
        });
      } finally {
        setLoadingHomePeriodos(false);
      }
    };

    fetchData();
  }, [setHomePeriodos, setLoadingHomePeriodos, servicios, setServicios]);

  const toggleDisplayLimit = () => {
    setDisplayLimit(displayLimit === 6 ? homePeriodos.length : 6);
  };

  return (
    <div className="home-bombeo-agua">
      <h2 className="text-center mb-4">Últimos Periodos Generados</h2>
      <Card className="p-3 shadow-sm">
        {loadingHomePeriodos ? (
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Cargando...</span>
            </Spinner>
          </div>
        ) : (
          <>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>DNI</th>
                  <th>Servicio</th>
                  <th>Mes</th>
                  <th>Año</th>
                  <th>Cuota</th>
                  <th>Total a Pagar AR$</th>
                  <th>Vencimiento</th>
                  <th>Fecha creación</th>
                </tr>
              </thead>
              <tbody>
                {homePeriodos.length > 0 ? (
                  homePeriodos.slice(0, displayLimit).map((periodo, index) => (
                    <tr key={periodo.id}>
                      <td>{index + 1}</td>
                      <td>{`${periodo.cliente.persona.nombre} ${periodo.cliente.persona.apellido}`}</td>
                      <td>{periodo.cliente.persona.dni}</td>
                      <td>{getServiceNameById(periodo.servicio_id)}</td>
                      <td>{periodo.mes}</td>
                      <td>{periodo.año}</td>
                      <td>{periodo.cuota}</td>
                      <td>{`${parseFloat(periodo.i_debito).toFixed(2)}`}</td>
                      <td>{new Date(periodo.f_vencimiento).toLocaleDateString()}</td>
                      <td>{new Date(periodo.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center text-muted">
                      No hay periodos disponibles.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
            {homePeriodos.length > 6 && (
              <div className="text-center mt-3">
                <Button variant="outline-primary" onClick={toggleDisplayLimit}>
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
