// =======================
// Utilidades UI del panel
// =======================
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

// =======================
// Datos de ejemplo
// =======================
const pokemons = [
  { id: 1,  name: "Bulbasaur",  type: "Grass",    stats:{ hp:45, attack:49, defense:49, spAtk:65, spDef:65, speed:45 }, baseExp: 64 },
  { id: 4,  name: "Charmander", type: "Fire",     stats:{ hp:39, attack:52, defense:43, spAtk:60, spDef:50, speed:65 }, baseExp: 62 },
  { id: 7,  name: "Squirtle",   type: "Water",    stats:{ hp:44, attack:48, defense:65, spAtk:50, spDef:64, speed:43 }, baseExp: 63 },
  { id: 10, name: "Caterpie",   type: "Bug",      stats:{ hp:45, attack:30, defense:35, spAtk:20, spDef:20, speed:45 }, baseExp: 39 },
  { id: 13, name: "Weedle",     type: "Bug",      stats:{ hp:40, attack:35, defense:30, spAtk:20, spDef:20, speed:50 }, baseExp: 39 },
  { id: 16, name: "Pidgey",     type: "Flying",   stats:{ hp:40, attack:45, defense:40, spAtk:35, spDef:35, speed:56 }, baseExp: 50 },
  { id: 19, name: "Rattata",    type: "Normal",   stats:{ hp:30, attack:56, defense:35, spAtk:25, spDef:35, speed:72 }, baseExp: 51 },
  { id: 25, name: "Pikachu",    type: "Electric", stats:{ hp:35, attack:55, defense:40, spAtk:50, spDef:50, speed:90 }, baseExp: 112 },
  { id: 27, name: "Sandshrew",  type: "Ground",   stats:{ hp:50, attack:75, defense:85, spAtk:20, spDef:30, speed:40 }, baseExp: 60 },
  { id: 35, name: "Clefairy",   type: "Fairy",    stats:{ hp:70, attack:45, defense:48, spAtk:60, spDef:65, speed:35 }, baseExp: 113 },
  { id: 39, name: "Jigglypuff", type: "Normal",   stats:{ hp:115, attack:45, defense:20, spAtk:45, spDef:25, speed:20 }, baseExp: 95 },
  { id: 52, name: "Meowth",     type: "Normal",   stats:{ hp:40, attack:45, defense:35, spAtk:40, spDef:40, speed:90 }, baseExp: 58 },
];

// Helpers
function groupByType(rows) {
  const map = new Map();
  for (const p of rows) {
    if (!map.has(p.type)) map.set(p.type, []);
    map.get(p.type).push(p);
  }
  return map;
}
const average = arr => arr.length ? arr.reduce((a,b)=>a+b,0) / arr.length : 0;

// =======================
// 1) Torta: Pokémon por Tipo
// =======================
(function renderPieTipos(){
  const byType = groupByType(pokemons);
  const labels = [...byType.keys()];
  const data = labels.map(t => byType.get(t).length);

  new Chart(document.getElementById('chartTipos'), {
    type: 'doughnut',
    data: { labels, datasets: [{ data }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,          
      plugins: {
        legend: { position: 'right' },
        title: { display: true, text: 'Pokémon por Tipo' }
      }
    }
  });
})();

// =======================
// 2) Barras: Ataque promedio por Tipo
// =======================
(function renderBarAtaque(){
  const byType = groupByType(pokemons);
  const labels = [...byType.keys()];
  const data = labels.map(t => average(byType.get(t).map(p => p.stats.attack)));

  new Chart(document.getElementById('chartAtaque'), {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Atk promedio', data }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,          
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Ataque' } },
        x: { title: { display: true, text: 'Tipo' } }
      }
    }
  });
})();

// =======================
// 3) Radar: Comparativa de Stats promedio
// =======================
(function renderRadarPromedios(){
  const statsKeys = ['hp','attack','defense','spAtk','spDef','speed'];
  const labels = ['HP','ATK','DEF','SpA','SpD','SPE'];
  const avgStats = statsKeys.map(k => average(pokemons.map(p => p.stats[k])));

  new Chart(document.getElementById('chartRadar'), {
    type: 'radar',
    data: {
      labels,
      datasets: [{ label: 'Promedio Global', data: avgStats }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,          
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Comparativa de Stats Promedio' }
      },
      scales: { r: { beginAtZero: true } }
    }
  });
})();

// =======================
// 4) Línea: Base EXP por ID
// =======================
(function renderLineaExp(){
  const sorted = [...pokemons].sort((a,b)=>a.id-b.id);
  const labels = sorted.map(p => p.id);
  const data = sorted.map(p => p.baseExp);

  new Chart(document.getElementById('chartLinea'), {
    type: 'line',
    data: { labels, datasets: [{ label: 'Base EXP', data, fill:false, tension:0.3 }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,          
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Experiencia Base por ID' }
      },
      scales: {
        y: { beginAtZero: false, title: { display: true, text: 'Base EXP' } },
        x: { title: { display: true, text: 'ID' } }
      }
    }
  });
})();
