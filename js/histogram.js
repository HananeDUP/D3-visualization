let datasetHisto = []
let fieldChoice = ""
let maxField = 100
let nBin = 10

var margin = { top: 10, right: 30, bottom: 30, left: 40 },
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom

//Create SVG element
let svgHisto = d3.select("#histo")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom + 20)
    .append("g")
    .attr("transform", "translate(50," + margin.top + ")");
// "translate(" + margin.left + 10 + "," + margin.top + ")");

var zoom = d3.zoom()
    .on("zoom", function () {
        svgHisto.attr("transform", d3.event.transform)
    })

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

            var xAxis = svgHisto.append("g")
                .attr("transform", "translate(0," + height + ")")

            var titleX = svgHisto.append("text")
                .attr("transform", "translate(" + (width / 2) + " ," + (height + 30) + ")")
                // .style("text-anchor", "middle")
                .attr("fill", "blue")

            var y = d3.scaleLinear()
                // .domain([0, d3.max(bins, (d) => d.length)])
                .range([height, 0]);

            var yAxis = svgHisto.append("g")

            svgHisto.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", -55)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .attr("fill", "blue")
                // .style("text-anchor", "middle")
                // .style("color", "blue")
                .text("# of cities");

            function update(nBin) {
                // set the parameters for the histogram
                var histogram = d3.histogram()
                    .value((d) => d[fieldChoice])   // I need to give the vector of value
                    // .domain(x.domain())  // then the domain of the graphic
                    .domain(d3.extent(rows, (row) => row[fieldChoice]))
                    .thresholds(x.ticks(nBin)); // then the numbers of bins

                // And apply this function to data to get the bins
                var bins = histogram(rows);
                console.log("binnnnnns", bins)
                console.log("fieldChoice", fieldChoice)

                // Y axis: update now that we know the domain
                y.domain([0, d3.max(bins, (d) => d.length)]);   // d3.hist has to be called before the Y axis obviously
                yAxis
                    .transition()
                    .duration(1000)
                    .call(d3.axisLeft(y));

                // Join the rect with the bins data
                var u = svgHisto.selectAll("rect")
                    .data(bins)
                // console.log("fucn", (d) => "translate(" + x(d.x0) + "," + y(d.length) + ")")

                // Manage the existing bars and eventually the new ones:
                u
                    .enter()
                    .append("rect") // Add a new rect for each new elements
                    .merge(u) // get the already existing elements as well
                    .transition() // and apply changes to all of them
                    .duration(1000)
                    .attr("x", 1)
                    .attr("transform", (d) => "translate(" + x(d.x0) + "," + y(d.length) + ")")
                    .attr("width", (d) => (x(d.x1) - x(d.x0)))
                    .attr("height", (d) => (height - y(d.length)))
                    .style("fill", "#69b3a2")

                // If less bar in the new histogram, I delete the ones not in use anymore
                u
                    .exit()
                    .remove()
            }

            function updateField(selectField) {
                console.log("in updateField", selectField)

                if (selectField == 'population') {
                    maxField = 5000
                    nBin = 40
                    document.getElementById("nBin").value = nBin
                } else if (selectField == 'density') {
                    maxField = 500
                    nBin = 10
                    document.getElementById("nBin").value = nBin
                    console.log("in density and nBin =", nBin)
                }

                fieldChoice = selectField

                x.domain([0, maxField])
                xAxis.call(d3.axisBottom(x));
                titleX.text(selectField);

                update(nBin)
            }

            // Initialize with "population"
            updateField("population");

            // Listen to the button -> update if user change it
            d3.select("#nBin").on("input", function () {
                update(this.value);
            });

            // Listen to the button -> update if user change it
            d3.select("#histo_select_field").on("change", function () {
                console.log("this.value", this.value)
                updateField(this.value);
            });

        };

    });