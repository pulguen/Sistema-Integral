const chartConfig = {
    chart: {
        toolbar: {
            show: true // Mostrar las herramientas de exportación/zoom
        },
        animations: {
            enabled: true, // Activar animaciones
            speed: 800
        },
        fontFamily: 'Roboto, Arial, sans-serif'
    },
    colors: ['#00E396', '#FEB019', '#FF4560', '#775DD0'], // Colores globales
    dataLabels: {
        enabled: false // Deshabilitar etiquetas por defecto
    },
    stroke: {
        curve: 'smooth' // Líneas suaves
    },
    legend: {
        position: 'top',
        horizontalAlign: 'center'
    }
};

export default chartConfig;
