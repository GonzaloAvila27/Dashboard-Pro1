document.addEventListener('DOMContentLoaded', () => {
  // ================================
  // CONFIG
  // ================================
  const MAX_POKES = 300;                    // cuántos pokémon traer (ajustá según gusto)
  const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas
  const CACHE_KEY = `poke_cache_v1_${MAX_POKES}`;
  const palette = [
    "#FF595E","#1982C4","#8AC926","#FFCA3A","#6A4C93",
    "#FF924C","#3A86FF","#8338EC","#FB5607","#FF006E"
  ];

  // helpers
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const rgba = (hex, a) => {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
  };

  // ================================
  // 1) DATA — PokeAPI + cache
  // ================================
  async function loadFromCache() {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    try {
      const { ts, data } = JSON.parse(raw);
      if (Date.now() - ts < CACHE_TTL_MS) return data;
    } catch {}
    return null;
  }

  async function saveToCache(data) {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  }

  async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res.json();
  }

  async function fetchPokemonList(limit) {
    const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=0`;
    const json = await fetchJson(url);
    return json.results; // [{name,url}]
  }

  // concurrencia controlada para detalles
  async function fetchDetailsWithConcurrency(entries, limit = 12, delayMs = 60) {
    const results = [];
    let i = 0;
    async function worker() {
      while (i < entries.length) {
        const idx = i++;
        const url = entries[idx].url;
        try {
          const d = await fetchJson(url);
          results[idx] = d;
        } catch (e) {
          console.warn("Error detalle:", e.message);
          results[idx] = null;
        }
        if (delayMs) await sleep(delayMs);
      }
    }
    const workers = Array.from({ length: Math.min(limit, entries.length) }, worker);
    await Promise.all(workers);
    return results.filter(Boolean);
  }

  function mapStats(rec) {
    const m = {};
    for (const s of rec.stats || []) m[s.stat?.name] = s.base_stat;
    return {
      hp: m["hp"] ?? null,
      attack: m["attack"] ?? null,
      defense: m["defense"] ?? null,
      sp_atk: m["special-attack"] ?? null,
      sp_def: m["special-defense"] ?? null,
      speed: m["speed"] ?? null
    };
  }

  function extractTypes(rec) {
    return (rec.types || []).map(t => t.type?.name).filter(Boolean);
  }

  const avg = (arr) => {
    const v = arr.filter(x => typeof x === "number");
    return v.length ? v.reduce((a,b)=>a+b,0)/v.length : null;
  };

  async function loadPokeData() {
    const cached = await loadFromCache();
    if (cached) return cached;

    const list = await fetchPokemonList(MAX_POKES);
    const details = await fetchDetailsWithConcurrency(list);

    const rows = details.map(d => {
      const types = extractTypes(d);
      const stats = mapStats(d);
      const bexp  = d.base_experience ?? null;
      return { id: d.id, name: d.name, types, base_experience: bexp, ...stats };
    });

    // Agregaciones
    const countByType = {};
    const attackByType = {};
    const statsByType = {};
    const allHP=[],allATK=[],allDEF=[],allSATK=[],allSDEF=[],allSPD=[];

    for (const r of rows) {
      if (r.hp!=null) allHP.push(r.hp);
      if (r.attack!=null) allATK.push(r.attack);
      if (r.defense!=null) allDEF.push(r.defense);
      if (r.sp_atk!=null) allSATK.push(r.sp_atk);
      if (r.sp_def!=null) allSDEF.push(r.sp_def);
      if (r.speed!=null) allSPD.push(r.speed);

      for (const t of r.types) {
        countByType[t] = (countByType[t]||0)+1;

        if (!attackByType[t]) attackByType[t] = [];
        if (r.attack!=null) attackByType[t].push(r.attack);

        if (!statsByType[t]) statsByType[t] = {hp:[],attack:[],defense:[],sp_atk:[],sp_def:[],speed:[]};
        if (r.hp!=null) statsByType[t].hp.push(r.hp);
        if (r.attack!=null) statsByType[t].attack.push(r.attack);
        if (r.defense!=null) statsByType[t].defense.push(r.defense);
        if (r.sp_atk!=null) statsByType[t].sp_atk.push(r.sp_atk);
        if (r.sp_def!=null) statsByType[t].sp_def.push(r.sp_def);
        if (r.speed!=null) statsByType[t].speed.push(r.speed);
      }
    }

    // ordenar y tomar top (para paleta prolija)
    const tiposOrdenados = Object.entries(countByType).sort((a,b)=>b[1]-a[1]).map(([t])=>t);
    const tiposTop = tiposOrdenados.slice(0, Math.min(10, tiposOrdenados.length));

    const cantidadPorTipo = tiposTop.map(t => countByType[t] || 0);
    const promedioAtaque = tiposTop.map(t => avg(attackByType[t] || []) ?? 0);

    const statsPromedio = {
      hp: avg(allHP) ?? 0,
      ataque: avg(allATK) ?? 0,
      defensa: avg(allDEF) ?? 0,
      sp_atk: avg(allSATK) ?? 0,
      sp_def: avg(allSDEF) ?? 0,
      velocidad: avg(allSPD) ?? 0
    };

    const metricas = ["HP","Ataque","Defensa","Sp.Atk","Sp.Def","Velocidad"];
    const valoresPorTipo = {};
    for (const t of tiposTop) {
      const bucket = statsByType[t] || {};
      valoresPorTipo[t] = [
        avg(bucket.hp || []) ?? 0,
        avg(bucket.attack || []) ?? 0,
        avg(bucket.defense || []) ?? 0,
        avg(bucket.sp_atk || []) ?? 0,
        avg(bucket.sp_def || []) ?? 0,
        avg(bucket.speed || []) ?? 0
      ];
    }

    const data = { tipos: tiposTop, cantidadPorTipo, promedioAtaque, statsPromedio, metricas, valoresPorTipo };
    await saveToCache(data);
    return data;
  }

  // ================================
  // 2) CHARTS
  // ================================
  function renderTreemap(tipos, cantidadPorTipo) {
    const el = document.getElementById("chartTipos");
    if (!el) return;
    try {
      new Chart(el, {
        type: "treemap",
        data: {
          datasets: [{
            label: "Pokémon por tipo",
            tree: tipos.map((t, i) => ({ g: t, v: cantidadPorTipo[i] })),
            key: "v",
            groups: ["g"],
            backgroundColor(ctx) {
              const tipo = ctx?.raw?.g ?? "";
              const idx = Math.max(0, tipos.indexOf(tipo));
              return palette[idx % palette.length];
            },
            borderColor: "#fff",
            borderWidth: 1,
            spacing: 0.5,
            captions: {
              display: true,
              color: "white",
              font: { size: 14, weight: "bold" },
              formatter: (ctx) => `${ctx.raw.g}\n${ctx.raw.v} pokémon`,
            },
          }]
        },
        options: {
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: { label: (c) => `${c.raw.g}: ${c.raw.v} pokémon` }
            }
          }
        }
      });
    } catch (e) {
      console.warn("Treemap no disponible. Dona fallback:", e.message);
      new Chart(el, {
        type: "doughnut",
        data: {
          labels: tipos,
          datasets: [{
            data: cantidadPorTipo,
            backgroundColor: tipos.map((_,i)=>palette[i%palette.length]),
            borderColor:"#fff"
          }]
        },
        options: { plugins: { legend: { position: "right" } } }
      });
    }
  }

  function renderBar(tipos, promedioAtaque) {
    const el = document.getElementById("chartAtaque");
    if (!el) return;
    new Chart(el, {
      type: "bar",
      data: {
        labels: tipos,
        datasets: [{ label: "Ataque promedio", data: promedioAtaque, backgroundColor: rgba("#1982C4", 0.9) }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { display: false } }
      }
    });
  }

  let radarChart = null;
  function renderRadarFromArray(label, arr6) {
    const el = document.getElementById("chartRadar");
    if (!el) return;
    if (radarChart) { radarChart.destroy(); radarChart = null; }
    radarChart = new Chart(el, {
      type: "radar",
      data: {
        labels: ["HP","Ataque","Defensa","Sp.Atk","Sp.Def","Velocidad"],
        datasets: [{
          label,
          data: arr6,
          borderColor: "#FF595E",
          backgroundColor: "rgba(255,89,94,0.2)",
          borderWidth: 2,
          pointBackgroundColor: "#FF595E"
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "top" } },
        scales: {
          r: { angleLines:{color:"#eee"}, grid:{color:"#ddd"}, suggestedMin:0, suggestedMax:110 }
        }
      }
    });
  }

  function renderHeatmap(metricas, tipos, valoresPorTipo) {
    const el = document.getElementById("chartHeatmap");
    if (!el) return;

    const alphaFor = (value, min=40, max=110) => {
      const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
      return 0.25 + 0.65 * t; // 0.25..0.9
    };

    const datasets = tipos.map((tipo, idx) => {
      const vals = valoresPorTipo[tipo] || metricas.map(()=>0);
      return {
        label: tipo,
        data: metricas.map(() => 1), // todos iguales; color = intensidad
        backgroundColor: metricas.map((_, i) => rgba(palette[idx % palette.length], alphaFor(vals[i]))),
        stack: "heat",
        borderColor: "rgba(255,255,255,.85)",
        borderWidth: 1,
        _realValues: vals
      };
    });

    new Chart(el, {
      type: "bar",
      data: { labels: metricas, datasets },
      options: {
        responsive: true,
        indexAxis: "y",
        scales: { x: { stacked: true, display: false }, y: { stacked: true } },
        plugins: {
          legend: { position: "right" },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const tipo = ctx.dataset.label;
                const i = ctx.dataIndex;
                const real = ctx.dataset._realValues[i];
                return `${tipo}: ${metricas[i]} = ${real?.toFixed(1)}`;
              }
            }
          }
        }
      }
    });
  }

  // ================================
  // 3) RUN
  // ================================
  (async () => {
    try {
      const { tipos, cantidadPorTipo, promedioAtaque, statsPromedio, metricas, valoresPorTipo } = await loadPokeData();

      // 1) Treemap + Barras
      renderTreemap(tipos, cantidadPorTipo);
      renderBar(tipos, promedioAtaque);

      // 2) Radar con selector de tipo (incluye "Todos")
      const sel = document.getElementById("typeSelector");
      const renderGlobal = () =>
        renderRadarFromArray("Promedio (Todos)", [
          statsPromedio.hp, statsPromedio.ataque, statsPromedio.defensa,
          statsPromedio.sp_atk, statsPromedio.sp_def, statsPromedio.velocidad
        ]);

      if (sel) {
        sel.innerHTML = '<option value="__ALL__">Todos</option>' +
          tipos.map(t => `<option value="${t}">${t}</option>`).join('');

        renderGlobal();

        sel.addEventListener("change", () => {
          const v = sel.value;
          if (v === "__ALL__") return renderGlobal();
          const arr = valoresPorTipo[v] || [0,0,0,0,0,0];
          renderRadarFromArray(`Promedio (${v})`, arr);
        });
      } else {
        renderGlobal();
      }

      // 3) Heatmap
      renderHeatmap(metricas, tipos, valoresPorTipo);

    } catch (e) {
      console.error("Error inicializando dashboard:", e);
      // Fallback mínimo
      const tipos = ["fire","water","grass","electric"];
      renderTreemap(tipos, [10,12,9,7]);
      renderBar(tipos, [75,65,70,80]);
      renderRadarFromArray("Promedio (Todos)", [70,75,65,80,70,90]);
    }
  })();
});
