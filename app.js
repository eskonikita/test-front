const data = {
  range: ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"],
  metrics: [
    { id:"revenue", name:"Выручка, руб", unit:"руб", current:500521, yesterday:480521, weekday:4805121, series:[0,220000,320000,360000,280000,260000,390000] },
    { id:"cash", name:"Наличные", unit:"руб", current:300000, yesterday:300000, weekday:300000, series:[280000,290000,300000,305000,295000,300000,300000] },
    { id:"bank", name:"Безналичный расчет", unit:"руб", current:100000, yesterday:100000, weekday:100000, series:[90000,95000,100000,102000,98000,100000,100000] },
    { id:"cards", name:"Кредитные карты", unit:"руб", current:100521, yesterday:100521, weekday:100521, series:[85000,90000,95000,98000,97000,99000,100521] },
    { id:"avgCheck", name:"Средний чек, руб", unit:"руб", current:1300, yesterday:900, weekday:900, series:[800,900,950,1100,1200,1250,1300] },
    { id:"avgGuest", name:"Средний гость, руб", unit:"руб", current:1200, yesterday:800, weekday:800, series:[700,800,820,900,1000,1100,1200] },
    { id:"delAfter", name:"Удаления из чека (после оплаты), руб", unit:"руб", current:1000, yesterday:1100, weekday:900, series:[900,1000,950,980,1100,1050,1000] },
    { id:"delBefore", name:"Удаления из чека (до оплаты), руб", unit:"руб", current:1300, yesterday:1300, weekday:900, series:[900,1000,1100,1200,1300,1300,1300] },
    { id:"checks", name:"Количество чеков", unit:"шт", current:34, yesterday:36, weekday:34, series:[28,30,32,35,36,34,34] },
    { id:"guests", name:"Количество гостей", unit:"чел", current:34, yesterday:36, weekday:32, series:[26,28,30,33,36,34,34] }
  ]
};

const tableEl = document.getElementById("table");
let picked = data.metrics[0].id;
let chart = null;

const nf = new Intl.NumberFormat("ru-RU");

function fmt(v) {
  if (v === null || v === undefined) return "—";
  return nf.format(v);
}

function deltaPct(cur, prev) {
  if (!prev) return 0;
  return Math.round(((cur - prev) / prev) * 100);
}

function deltaClass(p) {
  if (p > 0) return "pos";
  if (p < 0) return "neg";
  return "neu";
}

function cell(text, cls) {
  const d = document.createElement("div");
  d.className = "cell " + (cls || "");
  d.textContent = text;
  return d;
}

function render() {
  tableEl.innerHTML = "";

  const head = document.createElement("div");
  head.className = "row head";
  head.append(
    cell("Показатель"),
    cell("Текущий день", "bg-cur num"),
    cell("Вчера", "bg-yes num"),
    cell("%", "delta neu"),
    cell("Этот день недели", "bg-wk num")
  );
  tableEl.append(head);

  const m = data.metrics.find(x => x.id === picked) || data.metrics[0];

  const top = document.createElement("div");
  top.className = "row pick click";
  top.dataset.id = m.id;

  const pTop = deltaPct(m.current, m.yesterday);
  top.append(
    cell(m.name, "name pickMark"),
    cell(fmt(m.current), "bg-cur num"),
    cell(fmt(m.yesterday), "bg-yes num"),
    cell((pTop > 0 ? "+" : "") + pTop + "%", "delta " + deltaClass(pTop)),
    cell(fmt(m.weekday), "bg-wk num")
  );
  tableEl.append(top);

  const chartRow = document.createElement("div");
  chartRow.className = "chartRow";
  const chartBox = document.createElement("div");
  chartBox.id = "chart";
  chartBox.className = "chartBox";
  chartRow.append(chartBox);
  tableEl.append(chartRow);

  data.metrics
    .filter(x => x.id !== m.id)
    .forEach(x => {
      const row = document.createElement("div");
      row.className = "row listRow click" + (x.id === picked ? " active" : "");
      row.dataset.id = x.id;

      const p = deltaPct(x.current, x.yesterday);
      row.append(
        cell(x.name, "name"),
        cell(fmt(x.current), "bg-cur num"),
        cell(fmt(x.yesterday), "bg-yes num"),
        cell((p > 0 ? "+" : "") + p + "%", "delta " + deltaClass(p)),
        cell(fmt(x.weekday), "bg-wk num")
      );
      tableEl.append(row);
    });

  const note = document.createElement("div");
  note.className = "footerNote";
  tableEl.append(note);

  if (chart) {
    chart.destroy();
    chart = null;
  }

  drawChart(m);
}

function drawChart(metric) {
  chart = Highcharts.chart("chart", {
    accessibility: { enabled: false },
    title: { text: "" },
    credits: { enabled: false },
    legend: { enabled: false },
    xAxis: { categories: data.range },
    yAxis: { title: { text: "" } },
    tooltip: {
      pointFormatter: function () {
        return `<span style="font-weight:700">${fmt(this.y)}</span>`;
      }
    },
    series: [{
      type: "line",
      name: metric.name,
      data: metric.series
    }]
  });

  setTimeout(() => {
    if (chart) chart.reflow();
  }, 0);
}

function pickById(id) {
  if (!id || id === picked) return;
  picked = id;
  render();
}

tableEl.addEventListener("pointerup", (e) => {
  const el = e.target.closest(".click");
  if (!el) return;
  pickById(el.dataset.id);
});

tableEl.addEventListener("click", (e) => {
  const el = e.target.closest(".click");
  if (!el) return;
  pickById(el.dataset.id);
});

render();
