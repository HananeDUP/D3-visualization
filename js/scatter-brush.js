let maxPop = 100000
let maxDensity = 20000
let selectField = 'population'

var margin = { top: 10, right: 30, bottom: 30, left: 40 },
    wScatter = w - 100 - margin.left - margin.right,
    hScatter = h - 160 - margin.top - margin.bottom

//Create SVG element
let svgScatterBrush = d3.select("#scatter_brush")
    .append("svg")
    .attr("width", wScatter + margin.left + margin.right)
    .attr("height", hScatter + margin.top + margin.bottom + 20)
    .append("g")
    .attr("transform", "translate(50," + margin.top + ")");

var divScatter = d3.select("#scatter_brush").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// var zoom = d3.zoom()
//     .on("zoom", function () {
//         svgScatterBrush.attr("transform", d3.event.transform)
//     })

d3.tsv("data/france.tsv")
    .row((d, i) => {
        return {
            codePostal: +d["Postal Code"],
            // inseeCode: +d.inseecode,
            place: d.place,
            // longitude: +d.x,
            // latitude: +d.y,
            population: +d.population,
            density: +d.density
        };
    })
    .get((error, rows) => {
        console.log("loaded " + rows.length + " rows");
        if (rows.length > 0) {
            var x = d3.scaleLinear()
                // .domain(d3.extent(rows, (row) => row.population))
                .domain([0, maxPop])
                .range([0, wScatter]);
            // var heightX = height + 5
            var xAxis = svgScatterBrush.append("g")
                .attr("transform", "translate(0," + hScatter + ")")

            xAxis.call(d3.axisBottom(x));

            var titleX = svgScatterBrush.append("text")
                .attr("transform", "translate(" + (wScatter / 2) + " ," + (hScatter + 30) + ")")
                // .style("text-anchor", "middle")
                .attr("fill", "darksalmon")


            titleX.text("Population")
                .attr("font-weight", "bold");

            var y = d3.scaleLinear()
                // .domain(d3.extent(rows, (row) => row.density))
                .domain([0, maxDensity])
                .range([hScatter, 0]);

            var yAxis = svgScatterBrush.append("g")

            yAxis.call(d3.axisLeft(y));

            svgScatterBrush.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", -55)
                .attr("x", 0 - (hScatter / 2))
                .attr("dy", "1em")
                .attr("fill", "darksalmon")
                .attr("font-weight", "bold")
                .style("text-anchor", "middle")
                .text("Density");

            // Add a clipPath: everything out of this area won't be drawn.
            var clip = svgScatterBrush.append("defs").append("svg:clipPath")
                .attr("id", "clip")
                .append("svg:rect")
                .attr("width", wScatter) //460
                .attr("height", hScatter) //360
                .attr("x", 0)
                .attr("y", 0);

            var color = d3.scaleSequential()
                .domain([1, maxPop])
                .interpolator(d3.interpolateYlGnBu);
            // .interpolator(d3.interpolatePuBu);
            // .interpolator(d3.interpolateRgb("yellow", "green"));
            // .interpolator(d3.interpolatePuRd)

            quantile = d3.scaleQuantile()
                // .domain([0, d3.median(rows, (row) => row.population) + 5000])
                .domain([0, maxPop])
                .range([2, 3, 4, 5, 6]);

            var scatter = svgScatterBrush.append('g')
                .attr("clip-path", "url(#clip)")

            var brush = d3.brush()
                .extent([[0, 0], [460, 400]])
                .on("end", updateChart)
            scatter.append("g")
                .attr("class", "brush")
                .call(brush)
            // Manage the existing bars and eventually the new ones:
            var plot = scatter.selectAll("circle")
                .data(rows)
                .enter()
                .append("circle") // Add a new rect for each new elements
                .filter((d) => ((d.population < maxPop) & (d.density < maxDensity)))
                .attr("cx", (d) => x(d.population))
                .attr("cy", (d) => y(d.density))
                .attr("r", (d) => quantile(d.population))
                .style("fill", (d) => color(d.population))
                .style("opacity", 0.5)
                .on("mouseover", function (d) {
                    divScatter.transition()
                        .duration(200)
                        .style("opacity", .9);
                    divScatter.html("<b>City : </b>" + d.place + "<br>"
                        + "<b>Population : </b>" + d.population + "<br>"
                        + "<b>Density : </b>" + d.density + "<br>"
                        + "<b>Postal Code : </b>" + d.codePostal + "<br>")
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY) + "px")
                        .style("width", 180)
                        .style("hight", 70)
                })
                .on("mouseout", function (d) {
                    divScatter.transition()
                        .duration(50)
                        .style("opacity", 0);
                    divScatter.html("")
                        .style("left", "-500px")
                        .style("top", "-500px");
                });

            plot
                .on('mousedown', function (e) {
                    const brush_elm = svgScatterBrush.select('.brush > .overlay').node();
                    const brush_selection = svgScatterBrush.select('.brush > .selection').node();
                    const bbox = brush_selection.getBoundingClientRect();
                    if (brush_selection.style.display !== 'none'
                        && d3.event.pageX > bbox.left
                        && d3.event.pageX < (bbox.left + bbox.width)
                        && d3.event.pageY > bbox.top
                        && d3.event.pageY < (bbox.top + bbox.height)) {
                        // Click happened on a dot, inside the current brush selection, so, don't do anything
                        console.log('inside');
                        return;
                    }
                    // Click happened on a dot, with no rectangle selection or outside the rectangle selection
                    // so let's start a new selection :
                    const new_click_event = new MouseEvent('mousedown', {
                        pageX: d3.event.pageX,
                        pageY: d3.event.pageY,
                        clientX: d3.event.clientX,
                        clientY: d3.event.clientY,
                        layerX: d3.event.layerX,
                        layerY: d3.event.layerY,
                        bubbles: true,
                        cancelable: true,
                        view: window
                    });
                    brush_elm.dispatchEvent(new_click_event);
                });



            var idleTimeout
            function idled() { idleTimeout = null; }

            // A function that update the chart for given boundaries
            function updateChart() {
                extent = d3.event.selection
                // If no selection, back to initial coordinate. Otherwise, update X axis domain
                if (!extent) {
                    if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
                    x.domain([0, maxPop])
                    y.domain([0, maxDensity])

                } else {
                    console.log("extent", extent)
                    x.domain([x.invert(extent[0][0]), x.invert(extent[1][0])])
                    y.domain([y.invert(extent[1][1]), y.invert(extent[0][1])])
                    // var startColor = x.invert(extent[0][0]) + 20000
                    var startColor = 1
                    // plot.classed("selected", (d) => isBrushed(extent, x(d.population), y(d.density)))
                    color.domain([startColor, x.invert(extent[1][0])]).interpolator(d3.interpolatePuRd);
                    scatter.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
                }

                // Update axis and circle position
                xAxis.transition().duration(1000).call(d3.axisBottom(x).ticks(8))

                yAxis.transition().duration(1000).call(d3.axisLeft(y))

                scatter
                    .selectAll("circle")
                    .transition().duration(1000)
                    .attr("cx", (d) => x(d.population))
                    .attr("cy", (d) => y(d.density))
                    .style("fill", (d) => color(d.population))
                color.domain([1, maxPop]).interpolator(d3.interpolateYlGnBu);
            }

            xAxis.call(d3.axisBottom(x))
                .selectAll("text")
                .attr("transform", "rotate(0)")
            // A function that return TRUE or FALSE according if a dot is in the selection or not
            function isBrushed(brush_coords, cx, cy) {
                var x0 = brush_coords[0][0],
                    x1 = brush_coords[1][0],
                    y0 = brush_coords[0][1],
                    y1 = brush_coords[1][1];
                return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;    // This return TRUE or FALSE depending on if the points is in the selected area
            }

        };

    });