const ctx = document.getElementById('myChart').getContext('2d');
function mostrarPanel(seccion) {
    const panel = document.getElementById('panelConfig');
    const contenido = document.getElementById('contenidoPanel');

    panel.classList.remove('oculto');

    switch (seccion) {
        case 'usuario':
            contenido.innerHTML = "<h2>Datos de Usuario</h2><p>Sección de login / perfil</p>";
            break;
        case 'mapa':
            contenido.innerHTML = "<h2>Mapa</h2><p>Contenido relacionado al mapa</p>";
            break;
        case 'builder':
            contenido.innerHTML = "<h2>Builder</h2><p>Zona de construcción</p>";
            break;
        case 'reportes':
            contenido.innerHTML = "<h2>Reportes</h2><p>Informes y estadísticas</p>";
            break;
        default:
            contenido.innerHTML = "<p>Seleccioná una sección</p>";
    }
}




const chartTypeSelect = document.getElementById('chartType');
const monthFilterSelect = document.getElementById('monthFilter');

const originalLabels = ['January', 'February', 'March', 'April', 'May', 'June'];
const originalData = [12, 19, 3, 5, 2, 3];

const chartData = {
    labels: [...originalLabels],
    datasets: [{
        label: 'Sample Data',
        data: [...originalData],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        tension: 0.1,
        fill: true
    }]
};

const config = {
    type: 'line',
    data: chartData,
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
};


const myChart = new Chart(ctx, config);

function updateChart() {
    const selectedMonth = monthFilterSelect.value;
    const selectedType = chartTypeSelect.value;
    
    let filteredLabels = [...originalLabels];
    let filteredData = [...originalData];

    if (selectedMonth !== 'all') {
        const monthIndex = originalLabels.indexOf(selectedMonth);
        if (monthIndex !== -1) {
            filteredLabels = [originalLabels[monthIndex]];
            filteredData = [originalData[monthIndex]];
        }
    }

    myChart.config.type = selectedType;
    myChart.data.labels = filteredLabels;
    myChart.data.datasets[0].data = filteredData;
    myChart.update();
}

chartTypeSelect.addEventListener('change', updateChart);
monthFilterSelect.addEventListener('change', updateChart);



new Chart(document.getElementById('histogramaChart'), {
    type: 'bar',
    data: {
        labels: ['0-10', '10-20', '20-30', '30-40', '40+'],
        datasets: [{
            label: 'Cantidad',
            data: [5, 15, 25, 10, 3],
            backgroundColor: '#f28e2c'
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: false }
        }
    }
});


new Chart(document.getElementById('lineChart'), {
    type: 'line',
    data: {
        labels: ['6 AM', '9 AM', '12 PM', '3 PM', '6 PM'],
        datasets: [{
            label: 'Voltaje (kV)',
            data: [220, 230, 225, 215, 210],
            borderColor: '#e15759',
            tension: 0.4,
            fill: false
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { position: 'top' }
        }
    }
});

new Chart(document.getElementById('doughnutChart'), {
    type: 'doughnut',
    data: {
        labels: ['Excavadoras', 'Camiones', 'Trituradoras'],
        datasets: [{
            data: [40, 30, 30],
            backgroundColor: ['#76b7b2', '#59a14f', '#edc948']
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { position: 'right' }
        }
    }
});
new Chart(document.getElementById('barChart'), {
    type: 'bar',
    data: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
        datasets: [{
            label: 'Toneladas',
            data: [120, 150, 180, 100, 200],
            backgroundColor: '#4e79a7'
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: false }
        }
    }
});
