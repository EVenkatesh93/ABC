function areaChart() {
    var parseTime = d3.timeParse("%Y");
    // set the dimensions and margins of the graph
    var margin = { top: 30, right: 60, bottom: 10, left: 25 },
        width = $('#populationGrowth').width() - margin.left - margin.right,
        height = 100 - margin.top - margin.bottom;

    // append the svg object to the div
    var svg = d3.select("#areaChart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Add X axis
    var x = d3.scaleTime()
        .domain([d3.min(populationData, function (d) {
            return parseTime(d.year);
        }), d3.max(populationData, function (d) {
            return parseTime(d.year);
        })])
        .range([0, width]);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSize(0).tickValues(x.ticks(0).concat(x.domain())))



    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, d3.max(populationData, function (d) { return d.population; })])
        .range([height, 0]);

    // Add the area
    svg.append("path")
        .datum(populationData)
        .attr("fill", "#ffce49")
        .attr("fill-opacity", .8)
        .attr("stroke", "none")
        .attr("d", d3.area()
            .x(function (d) { return x(parseTime(d.year)) })
            .y0(height)
            .y1(function (d) { return y(d.population) })
        )

    // Add the line
    svg.append("path")
        .datum(populationData)
        .attr("fill", "none")
        .attr("stroke", "#fca553")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .x(function (d) { return x(parseTime(d.year)) })
            .y(function (d) { return y(d.population) })
        )

    // Add the values 
    svg.selectAll(".val").data(populationData)
        .enter()
        .append('text')
        .filter(function (d, i) { return i === 0 || i === (populationData.length - 1) })
        .attr("x", d => x(parseTime(d.year)))
        .attr("y", d => y(d.population))
        .attr("dy", "-0.5em")
        .attr("text-anchor", "middle")
        .text(d => formatNum(d.population));

}