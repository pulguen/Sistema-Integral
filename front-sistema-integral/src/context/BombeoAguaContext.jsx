// src/context/BombeoAguaContext.jsx
import React, { createContext, useState, useCallback, useEffect, useMemo, useContext } from 'react';
import customFetch from './CustomFetch';
import { FacturacionContext } from './../context/FacturacionContext'

export const BombeoAguaContext = createContext();

export const BombeoAguaProvider = ({ children }) => {
  const [periodos, setPeriodos] = useState([]);
  const [recibos, setRecibos] = useState([]);
  const [homePeriodos, setHomePeriodos] = useState([]);
  const [loadingHomePeriodos, setLoadingHomePeriodos] = useState(false);
  const [servicios, setServicios] = useState([]);
  const [loadingServicios, setLoadingServicios] = useState(true);

  const { registerModule } = useContext(FacturacionContext); // Conectar al contexto global

  // Fetch de servicios
  const fetchServicios = useCallback(async () => {
    try {
      const data = await customFetch('/tributos/1');
      setServicios(data.servicios || []);
    } catch (error) {
      console.error('Error al obtener los servicios:', error);
    } finally {
      setLoadingServicios(false);
    }
  }, []);

  useEffect(() => {
    fetchServicios();
  }, [fetchServicios]);

  // Fetch de periodos
  const fetchHomePeriodos = useCallback(async () => {
    setLoadingHomePeriodos(true);
    try {
      // Desestructuramos el array para obtener los datos y el código de estado
      const [data] = await customFetch('/cuentas');
      
      if (Array.isArray(data)) {
        // Filtrar periodos que tienen cliente y persona
        const validPeriodos = data.filter(
          (periodo) => periodo.cliente && periodo.cliente.persona
        );

        const sortedPeriodos = validPeriodos.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setHomePeriodos(sortedPeriodos);

        // Verificar si algún periodo tiene created_at inválido
        sortedPeriodos.forEach((periodo) => {
          const fecha = new Date(periodo.created_at);
          if (isNaN(fecha.getTime())) {
            console.warn(`Periodo ID ${periodo.id} tiene created_at inválido:`, periodo.created_at);
          }
        });
      } else {
        console.error('No se encontraron datos de periodos.');
      }
    } catch (error) {
      console.error('Error al obtener los periodos:', error);
    } finally {
      setLoadingHomePeriodos(false);
    }
  }, []);

  useEffect(() => {
    fetchHomePeriodos();
  }, [fetchHomePeriodos]);

  useEffect(() => {
    // Registrar este módulo en FacturacionContext
    registerModule("bombeo", { servicios, periodos, fetchHomePeriodos });
  }, [registerModule, servicios, periodos, fetchHomePeriodos]);

  // Crear período
  const handleCreatePeriodo = useCallback((newPeriodo) => {
    if (
      !newPeriodo ||
      typeof newPeriodo !== 'object' ||
      !newPeriodo.clientName
    ) {
      console.warn('Error: el periodo proporcionado no es válido.');
      return;
    }
    setPeriodos((prevPeriodos) => [...prevPeriodos, newPeriodo]);
    console.log('Periodo creado:', newPeriodo);
  }, []);

  // Confirmar período
  const handleConfirmPeriodo = useCallback((periodo) => {
    if (!periodo || !periodos.includes(periodo)) {
      console.warn('Error: el periodo no es válido o no existe.');
      return;
    }
    setPeriodos((prevPeriodos) => prevPeriodos.filter((p) => p !== periodo));
  }, [periodos]);

  // Eliminar período
  const handleDeletePeriodo = useCallback((periodo) => {
    if (!periodo || !periodos.includes(periodo)) {
      console.warn('Error: el periodo no es válido o no existe.');
      return;
    }
    setPeriodos((prevPeriodos) => prevPeriodos.filter((p) => p !== periodo));
    console.log('Periodo eliminado:', periodo);
  }, [periodos]);

  // Crear recibo
  const handleCreateRecibo = useCallback((newRecibo) => {
    if (
      !newRecibo ||
      typeof newRecibo !== 'object' ||
      typeof newRecibo.totalAmount !== 'number'
    ) {
      console.warn('Error: el recibo proporcionado no es válido.');
      return;
    }
    setRecibos((prevRecibos) => [
      ...prevRecibos,
      { ...newRecibo, agente_emisor: newRecibo.cajero_nombre },
    ]);
    console.log('Recibo creado:', {
      ...newRecibo,
      agente_emisor: newRecibo.cajero_nombre,
    });
  }, []);

  // Confirmar recibo
  const handleConfirmRecibo = useCallback((recibo) => {
    if (!recibo || !recibos.some((r) => r.id === recibo.id)) {
      console.warn('Error: el recibo no es válido o no existe.');
      return;
    }
    setRecibos((prevRecibos) =>
      prevRecibos.filter((r) => r.id !== recibo.id)
    );
    console.log('Recibo confirmado:', recibo);
  }, [recibos]);

  // Eliminar recibo
  const handleDeleteRecibo = useCallback((recibo) => {
    if (!recibo || !recibos.includes(recibo)) {
      console.warn('Error: el recibo no es válido o no existe.');
      return;
    }
    setRecibos((prevRecibos) =>
      prevRecibos.filter((r) => r !== recibo)
    );
    console.log('Recibo eliminado:', recibo);
  }, [recibos]);

  // Función para obtener datos del gráfico de servicio
  const getPeriodosByServicio = useCallback(() => {
    const particularesCount = homePeriodos.filter(
      (periodo) => periodo.servicio_id === 2
    ).length;
    const organismosCount = homePeriodos.filter(
      (periodo) => periodo.servicio_id === 1
    ).length;
    return {
      series: [particularesCount, organismosCount],
      labels: ['Particulares', 'Organismos'], // Cambiado de 'categories' a 'labels'
    };
  }, [homePeriodos]);

  // Función para obtener datos del gráfico por mes
  const getPeriodosByMonth = useCallback(() => {
    const meses = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];

    // Inicializar contadores
    const particularesPorMes = Array(12).fill(0);
    const organismosPorMes = Array(12).fill(0);

    homePeriodos.forEach((periodo) => {
      const mesIndex = new Date(periodo.created_at).getMonth(); // 0-11
      if (periodo.servicio_id === 1) {
        organismosPorMes[mesIndex] += 1;
      } else if (periodo.servicio_id === 2) {
        particularesPorMes[mesIndex] += 1;
      }
      // Si servicio_id no es 1 ni 2, lo ignoramos
    });

    return {
      series: [
        {
          name: 'Particulares',
          data: particularesPorMes,
        },
        {
          name: 'Organismos',
          data: organismosPorMes,
        },
      ],
      categories: meses,
    };
  }, [homePeriodos]);

  // Función para obtener datos de tendencias de periodos
  const getTrendPeriodos = useCallback(() => {
    if (homePeriodos.length === 0) {
      return {
        series: [],
        categories: [],
      };
    }

    // Determinar el rango de fechas (últimos 12 meses)
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth() - 11, 1); // Hace 11 meses
    const endDate = new Date(today.getFullYear(), today.getMonth(), 1); // Mes actual

    // Generar una lista de meses en formato 'YYYY-MM'
    const meses = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const mesAnio = `${currentDate.getFullYear()}-${('0' + (currentDate.getMonth() + 1)).slice(-2)}`; // Formato 'YYYY-MM'
      meses.push(mesAnio);
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Inicializar conteo por mes con cero
    const countsPorMes = {};
    meses.forEach((mes) => {
      countsPorMes[mes] = 0;
    });

    // Contar periodos por mes
    homePeriodos.forEach((periodo) => {
      const fecha = new Date(periodo.created_at);
      if (isNaN(fecha.getTime())) {
        console.warn(`Fecha inválida para periodo ID ${periodo.id}:`, periodo.created_at);
        return; // Saltar este periodo si la fecha es inválida
      }
      const mesAnio = `${fecha.getFullYear()}-${('0' + (fecha.getMonth() + 1)).slice(-2)}`; // Formato 'YYYY-MM'
      if (countsPorMes.hasOwnProperty(mesAnio)) {
        countsPorMes[mesAnio] += 1;
      }
    });

    const conteosOrdenados = meses.map((mes) => countsPorMes[mes]);

    // Verificar que no hay NaN en conteosOrdenados
    const hasNaN = conteosOrdenados.some((count) => isNaN(count));

    if (hasNaN) {
      console.error('getTrendPeriodos: Hay valores NaN en conteosOrdenados.');
      return {
        series: [],
        categories: [],
      };
    }

    // Verificar que hay al menos dos puntos de datos
    if (conteosOrdenados.length < 2) {
      console.warn('getTrendPeriodos: Menos de dos puntos de datos disponibles.');
      // Opcional: Puedes decidir no renderizar el gráfico o mostrar una advertencia
    }

    console.log('getTrendPeriodos:', {
      series: [
        {
          name: 'Periodos Generados',
          data: conteosOrdenados,
        },
      ],
      categories: meses,
    });

    return {
      series: [
        {
          name: 'Periodos Generados',
          data: conteosOrdenados,
        },
      ],
      categories: meses,
    };
  }, [homePeriodos]);

  // Función para obtener datos de ingresos por servicio
const getRevenueByService = useCallback(() => {
  if (loadingServicios) {
    // console.warn('getRevenueByService: Servicios aún están cargando.');
    return { series: [], labels: [] };
  }

  const ingresosPorServicio = {};

  homePeriodos.forEach((periodo) => {
    const servicioId = periodo.servicio_id;
    const ingreso = parseFloat(periodo.i_debito) || 0;
    if (ingresosPorServicio[servicioId]) {
      ingresosPorServicio[servicioId] += ingreso;
    } else {
      ingresosPorServicio[servicioId] = ingreso;
    }
  });

  const labels = [];
  const series = [];

  // Asegurar que todos los servicios estén representados, incluso si tienen ingresos de cero
  servicios.forEach((servicio) => {
    const ingreso = ingresosPorServicio[servicio.id] || 0;
    labels.push(servicio.nombre);
    series.push(parseFloat(ingreso.toFixed(2)));
  });

  const data = {
    series,
    labels,
  };

  console.log('getRevenueByService:', data);

  // Manejar caso con datos vacíos
  if (series.length === 0) {
    console.warn('getRevenueByService: No hay ingresos por servicio.');
  }

  return data;
}, [homePeriodos, servicios, loadingServicios]);


  // Función para obtener datos del histograma de ingresos
  const getIncomeDistribution = useCallback(() => {
    const ingresos = homePeriodos.map(
      (periodo) => parseFloat(periodo.i_debito) || 0
    );

    // Definir los rangos de ingresos (por ejemplo, intervalos de 100 AR$)
    const bucketSize = 100;
    const maxIngreso = Math.max(...ingresos, 0);
    const numberOfBuckets = Math.ceil(maxIngreso / bucketSize);

    const buckets = [];
    const counts = [];

    for (let i = 0; i < numberOfBuckets; i++) {
      const rangeStart = i * bucketSize;
      const rangeEnd = (i + 1) * bucketSize;
      buckets.push(`${rangeStart}-${rangeEnd}`);
      counts.push(0);
    }

    ingresos.forEach((ingreso) => {
      const bucketIndex = Math.min(
        Math.floor(ingreso / bucketSize),
        numberOfBuckets - 1
      );
      counts[bucketIndex] += 1;
    });

    return {
      buckets,
      counts,
    };
  }, [homePeriodos]);

  // Función para obtener datos del heatmap de periodos
  const getHeatmapData = useCallback(() => {
    const years = [
      ...new Set(homePeriodos.map((p) => new Date(p.created_at).getFullYear())),
    ].sort();
    const meses = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];

    const series = years.map((year) => {
      const data = meses.map((mes, index) => {
        const count = homePeriodos.filter((p) => {
          const fecha = new Date(p.created_at);
          return (
            fecha.getFullYear() === year && fecha.getMonth() === index
          );
        }).length;
        return { x: mes, y: count };
      });

      return { name: year.toString(), data };
    });

    return {
      series,
      categories: meses,
      yCategories: years.map((y) => y.toString()),
    };
  }, [homePeriodos]);

  // Función para calcular KPIs
  const getKpis = useCallback(() => {
    const totalPeriodos = homePeriodos.length;

    const totalIngresos = homePeriodos.reduce((acc, periodo) => {
      return acc + (parseFloat(periodo.i_debito) || 0);
    }, 0);

    // Calcular el promedio mensual
    const today = new Date();
    const firstPeriodoDate = homePeriodos[homePeriodos.length - 1]
      ? new Date(homePeriodos[homePeriodos.length - 1].created_at)
      : today;
    const monthsDifference =
      (today.getFullYear() - firstPeriodoDate.getFullYear()) * 12 +
      (today.getMonth() - firstPeriodoDate.getMonth()) +
      1; // +1 para incluir el mes actual

    const promedioMensual =
      monthsDifference > 0 ? totalPeriodos / monthsDifference : totalPeriodos;

    return {
      totalPeriodos,
      totalIngresos,
      promedioMensual,
    };
  }, [homePeriodos]);

  // Memoizar el objeto value para evitar re-renderizados innecesarios
  const value = useMemo(() => ({
    periodos,
    setPeriodos,
    recibos,
    setRecibos,
    homePeriodos,
    setHomePeriodos,
    loadingHomePeriodos,
    setLoadingHomePeriodos,
    servicios,
    setServicios,
    getPeriodosByServicio,
    getPeriodosByMonth,
    getTrendPeriodos,
    getRevenueByService,
    getIncomeDistribution,
    getHeatmapData,
    getKpis,
    fetchHomePeriodos,
    handleCreatePeriodo,
    handleConfirmPeriodo,
    handleDeletePeriodo,
    handleCreateRecibo,
    handleConfirmRecibo,
    handleDeleteRecibo,
  }), [
    periodos,
    recibos,
    homePeriodos,
    loadingHomePeriodos,
    servicios,
    getPeriodosByServicio,
    getPeriodosByMonth,
    getTrendPeriodos,
    getRevenueByService,
    getIncomeDistribution,
    getHeatmapData,
    getKpis,
    fetchHomePeriodos,
    handleCreatePeriodo,
    handleConfirmPeriodo,
    handleDeletePeriodo,
    handleCreateRecibo,
    handleConfirmRecibo,
    handleDeleteRecibo,
  ]);

  return (
    <BombeoAguaContext.Provider value={value}>
      {children}
    </BombeoAguaContext.Provider>
  );
};