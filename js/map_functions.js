let mapDrawPopDensity = function (first_load, selectedField, scaleMulti, dataset, svg, cities, zoom, div, legendAxis) {
    if (selectedField == "population") {
        colorMap = "YlGnBu"

    } else if (selectedField == "density") {
        colorMap = "RdPu"
        scaleMulti = 1
    }
    svg.attr("class", colorMap)
    console.log("after modif =", selectedField, colorMap, scaleMulti)
    drawMap(selectedField, scaleMulti, dataset, svg, cities, zoom, div, legendAxis)
}

function drawMap(selectedField, scaleMulti, dataset, svg, cities, zoom, div, legendAxis) {
    quantile = d3.scaleQuantile()
        .domain([0, d3.mean(dataset, (row) => row[selectedField]) * scaleMulti])
        .range(d3.range(9));

    legendScale = d3.scaleLinear()
        // .domain([0, d3.median(rows, (row) => row.population) + 5000])
        .domain([0, d3.mean(dataset, (row) => row[selectedField]) * scaleMulti])
        .range([0, 9 * 20]);
    if (first_load == 0) {
        x = d3.scaleLinear()
            .domain(d3.extent(dataset, (row) => row.longitude))
            .range([0, w]);

        y = d3.scaleLinear()
            .domain(d3.extent(dataset, (row) => row.latitude))
            .range([h, 0]);

        cities.selectAll("rect")
            .data(dataset)
            .enter()
            .append("rect")
            .attr("width", 1)
            .attr("height", 1)
            .attr("x", (d) => x(d.longitude))
            .attr("y", (d) => y(d.latitude))
            // .attr("fill", (d) => myColor(d.population))
            .attr("id", (d) => "code_" + d.codePostal)
            // .attr("class", d => "code_post q" + quantile(+d.population) + "-9")
            .attr("class", d => "code_post q" + quantile(+d[selectedField]) + "-9")
            .on("mouseover", function (d) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html("<b>City : </b>" + d.place + "<br>"
                    + "<b>Population : </b>" + d.population + "<br>"
                    + "<b>Density : </b>" + d.density + "<br>"
                    + "<b>Postal Code : </b>" + d.codePostal + "<br>")
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY) + "px")
                    .style("width", 180)
                    .style("hight", 70)
            })
            .on("mouseout", function (d) {
                div.transition()
                    .duration(50)
                    .style("opacity", 0);
                div.html("")
                    .style("left", "-500px")
                    .style("top", "-500px");
            });

    } else {
        console.log("in modified data")
        dataset.forEach(function (e, i) {
            console.log("#code_" + e.codePostal)
            d3.select("#code_" + e.codePostal)
                .attr("class", e => "code_post q" + quantile(+e[selectedField]) + "-9")
        })
    }

    legendAxis.call(d3.axisRight(legendScale).ticks(6));

    svg.call(zoom)
};
