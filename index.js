let year = [];
let data = [];
let populationData = [];
let selectedYear;

// Formating Numbers
const formatNum = n => {
  if (n < 1e3) return n;
  if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + "K";
  if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + "Mn";
  if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + "Bn";
  if (n >= 1e12) return +(n / 1e12).toFixed(1) + "Tl";
};

$(window).resize(function () {
  location.reload();
})

$(document).ready(function () {
  populate();
})

function populate() {

  // Data Formation
  d3.csv("population.csv", function (d) {
    data = d;
    let dataArr = data.filter(function (el) {
      populationData.push({ "year": el.Year, "population": parseInt(el.Population) });
      year.push(el.Year);
    });

    year = Array.from(new Set(year));
    let options = year.map(e => { return `<option value="${e}">Year: ${e}</option>` })
    document.getElementById("year").innerHTML = options

    populationData = Array.from(populationData.reduce(
      (m, { year, population }) => m.set(year, (m.get(year) || 0) + population), new Map
    ), ([year, population]) => ({ year, population }));

    areaChart();
    populateData();

  })
}

// Bubble Chart
function populateData() {
  selectedYear = document.getElementById("year").value;
  $("#bubbleChart").empty();

  populationData.filter(obj => {
    if (obj.year === selectedYear) {
      $('#worldPopulationYear').empty();
      $('#worldPopulationCount').empty();
      $('#worldPopulationYear').append('(' + selectedYear + ')');
      $('#worldPopulationCount').append(formatNum(obj.population));
    }

  })

  let Populatedata = data.filter(
    element => element.Year == selectedYear);

  // set the dimensions and margins of the graph
  let margin = { top: 50, right: 100, bottom: 100, left: 50 },
    width = $('.dataCard').width() - margin.left - margin.right,
    height = 380;

  // append the svg object to the div
  let svg = d3.select("#bubbleChart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  // Add X axis
  let x = d3.scaleLinear()
    .domain([d3.min(Populatedata, function (d) {
      return parseInt(d.Population_Density);
    }), d3.max(Populatedata, function (d) {
      return parseInt(d.Population_Density);
    })])
    .range([0, width]);

  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSize(0));

  // Add X axis label
  svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", (width / 2) + 30)
    .attr("y", height + 40)
    .text("Population Density");


  // Add Y axis
  let y = d3.scaleLinear()
    .domain([d3.min(Populatedata, function (d) {
      return parseInt(d.Population_Growth_Rate);
    }), d3.max(Populatedata, function (d) {
      return parseInt(d.Population_Growth_Rate);
    })])
    .range([height, 0]);

  svg.append("g")
    .call(d3.axisLeft(y).tickSize(0))

  // Add Y axis label
  svg.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("x", -135)
    .attr("y", -30)
    .text("Population Growth (%)")

  // Add a scale for bubble size
  let z = d3.scaleSqrt()
    .domain([d3.min(Populatedata, function (d) {
      return parseInt(d.Population);
    }), d3.max(Populatedata, function (d) {
      return parseInt(d.Population);
    })])
    .range([4, 40]);

  // Add a scale for bubble color
  let color = d3.scaleOrdinal()
    .domain(function (d) { return d.Country })
    .range(d3.schemeSet2);

  // Add the tooltip to graph
  let tooltip = d3.select("#bubbleChart")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "black")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("color", "white")

  let showTooltip = function (d) {
    tooltip
      .transition()
      .duration(1000)
    tooltip
      .style("opacity", 1)
      .html("Country: " + d.Country + "<br>Population: " + d.Population)
      .style("left", (d3.mouse(this)[0] + 30) + "px")
      .style("top", (d3.mouse(this)[1] + 30) + "px")
  }
  let moveTooltip = function (d) {
    tooltip
      .style("left", (d3.mouse(this)[0] + 30) + "px")
      .style("top", (d3.mouse(this)[1] + 30) + "px")
  }
  let hideTooltip = function (d) {
    tooltip
      .transition()
      .duration(200)
      .style("opacity", 0)
  }

  // Add dots
  svg.append('g')
    .selectAll("dot")
    .data(Populatedata)
    .enter()
    .append("circle")
    .attr("class", function (d) { return "bubbles " + d.Country })
    .attr("cx", function (d) { return x(parseInt(d.Population_Density)); })
    .attr("cy", function (d) { return y(parseInt(d.Population_Growth_Rate)); })
    .attr("r", function (d) { return z(parseInt(d.Population)); })
    .style("fill", function (d) { return color(d.Country); })

    // Add the tooltip
    .on("mouseover", showTooltip)
    .on("mousemove", moveTooltip)
    .on("mouseleave", hideTooltip)

}