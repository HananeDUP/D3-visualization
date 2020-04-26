let datasetHistoBrush = []
let fieldChoiceBrush = ""
let maxFieldBrush = 100
let nBinBrush = 10
let selectField = 'population'

var margin = { top: 10, right: 30, bottom: 30, left: 40 },
    width = 460 - margin.left - margin.right
height = 400 - margin.top - margin.bottom

//Create SVG element
let svgHistoBrush = d3.select("#histo_brush")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom + 20)
    .append("g")
    .attr("transform", "translate(50," + margin.top + ")");
// "translate(" + margin.left + 10 + "," + margin.top + ")");

// var zoom = d3.zoom()
//     .on("zoom", function () {
//         svgHisto.attr("transform", d3.event.transform)
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
                .range([0, width]);

            var xAxis = svgHistoBrush.append("g")
                .attr("transform", "translate(0," + height + ")")

            var titleX = svgHistoBrush.append("text")
                .attr("transform", "translate(" + (width / 2) + " ," + (height + 30) + ")")
                // .style("text-anchor", "middle")
                .attr("fill", "blue")

            var y = d3.scaleLinear()
                // .domain([0, d3.max(bins, (d) => d.length)])
                .range([height, 0]);

            var yAxis = svgHistoBrush.append("g")

            svgHistoBrush.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", -55)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .attr("fill", "blue")
                // .style("text-anchor", "middle")
                // .style("color", "blue")
                .text("# of cities");

            // Add a clipPath: everything out of this area won't be drawn.
            var clip = svgHistoBrush.append("defs").append("svg:clipPath")
                .attr("id", "clip")
                .append("svg:rect")
                .attr("width", 460)
                .attr("height", 400)
                .attr("x", 0)
                .attr("y", 0);

            if (selectField == 'population') {
                maxFieldBrush = 5000
                nBinBrush = 40
                // document.getElementById("nBin_brush").value = nBinBrush
            } else if (selectField == 'density') {
                maxFieldBrush = 500
                nBinBrush = 10
                // document.getElementById("nBin_brush").value = nBinBrush
                console.log("in density and nBinBrush =", nBinBrush)
            }

            fieldChoiceBrush = selectField

            x.domain([0, maxFieldBrush])
            xAxis.call(d3.axisBottom(x));
            titleX.text(selectField);
            var histogram = d3.histogram()
                .value((d) => d[fieldChoiceBrush])   // I need to give the vector of value
                // .domain(x.domain())  // then the domain of the graphic
                .domain(d3.extent(rows, (row) => row[fieldChoiceBrush]))
                .thresholds(x.ticks(nBinBrush)); // then the numbers of bins

            // And apply this function to data to get the bins
            var bins = histogram(rows);
            console.log("binnnnnns", bins)
            console.log("fieldChoiceBrush", fieldChoiceBrush)

            // Y axis: update now that we know the domain
            y.domain([0, d3.max(bins, (d) => d.length)]);   // d3.hist has to be called before the Y axis obviously
            yAxis
                .transition()
                .duration(1000)
                .call(d3.axisLeft(y));

            var brush = d3.brushX()                 // Add the brush feature using the d3.brush function
                // .extent([[0, 0], [width + margin.left + margin.righ, height + margin.top + margin.bottom]]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
                .extent([[0, 0], [460, 400]])
                .on("brush end", updateChart) // Each time the brush selection changes, trigger the 'updateChart' function

            // // Join the rect with the bins data
            var u = svgHistoBrush.append('g')
                .attr("clip-path", "url(#clip)")

            // Manage the existing bars and eventually the new ones:
            u.selectAll("rect")
                .data(bins)
                .enter()
                .append("rect") // Add a new rect for each new elements
                // .merge(u) // get the already existing elements as well
                // .transition() // and apply changes to all of them
                // .duration(1000)
                .attr("x", 1)
                .attr("transform", (d) => "translate(" + x(d.x0) + "," + y(d.length) + ")")
                .attr("width", (d) => (x(d.x1) - x(d.x0)))
                .attr("height", (d) => (height - y(d.length)))
                .style("fill", "#69b3a2")

            // If less bar in the new histogram, I delete the ones not in use anymore
            // u
            //     .exit()
            //     .remove()

            u.append("g")
                .attr("class", "brush")
                .call(brush);

            var idleTimeout
            function idled() { idleTimeout = null; }

            // A function that update the chart for given boundaries
            function updateChart() {
                extent = d3.event.selection


                // If no selection, back to initial coordinate. Otherwise, update X axis domain
                if (!extent) {
                    if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
                    x.domain([0, maxFieldBrush])
                } else {
                    console.log("extent[0]", extent[0])
                    console.log("extent[1]", extent[1])
                    x.domain([x.invert(extent[0]), x.invert(extent[1])])
                    u.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
                }

                // Update axis and circle position
                xAxis.transition().duration(1000).call(d3.axisBottom(x))
                u
                    .selectAll("rect")
                    .transition().duration(1000)
                    .attr("x", 1)
                    // .attr("transform", (d) => "translate(" + x(d.x0) + "," + y(d.length) + ")")
                    .attr("width", (d) => (x(d.x1) - x(d.x0)))
                    .attr("height", (d) => (height - y(d.length)))
            }




        };

    });