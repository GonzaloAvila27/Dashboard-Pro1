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