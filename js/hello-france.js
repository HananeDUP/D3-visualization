const w = 500;
const h = 500;
let dataset = [];
const scalePop = 3000;
const scaleDensity = 300;
let maxPopRayon = 100000

//Create SVG element
hsvg = h - 20
let svg = d3.select("#map").append("svg").attr("width", w).attr("height", hsvg);

var zoomMapStandard = d3.zoom()
    .on("zoom", function () {
        svg.attr("transform", d3.event.transform)
    })

var div = d3.select("#map").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);



d3.tsv("data/france.tsv")
    .row((d, i) => {
        return {
            codePostal: +d["Postal Code"],
            inseeCode: +d.inseecode,
            place: d.place,
            longitude: +d.x,
            latitude: +d.y,
            population: +d.population,
            density: +d.density
        };
    })
    .get((error, rows) => {
        // console.log("loaded " + rows.length + " rows");
        if (rows.length > 0) {
            console.log("First row: ", rows[0]);
            console.log("Last row: ", rows[rows.length - 1]);
            x = d3.scaleLinear()
                .domain(d3.extent(rows, (row) => row.longitude))
                // .domain([0, d3.max(rows, (row) => row.longitude)])
                .range([0, w]);

            y = d3.scaleLinear()
                .domain(d3.extent(rows, (row) => row.latitude))
                // .domain([0, d3.max(rows, (row) => row.latitude)])
                .range([hsvg, 0]);

            myColor = d3.scaleSequential()
                // myColor = d3.scaleLinear()
                .domain([1, scalePop])
                .interpolator(d3.interpolatePuBuGn);

            rayon = d3.scaleQuantile()
                // .domain([0, d3.median(rows, (row) => row.population) + 5000])
                .domain([0, maxPopRayon])
                .range([1, 2, 3, 6]);

            dataset = rows;
            drawMapStandardMap()
        };
    });

function drawMapStandardMap() {
    svg.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        // .attr("width", 1)
        // .attr("height", 1)
        // .attr("x", (d) => x(d.longitude))
        // .attr("y", (d) => y(d.latitude))
        // .attr("id", (d) => "code_" + d.codePostal)

        .attr("cx", (d) => x(d.longitude))
        .attr("cy", (d) => y(d.latitude))
        .attr("r", (d) => rayon(d.population))
        .attr("fill", (d) => myColor(d.population))
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

    xAxis = d3.axisTop(x).ticks(20);
    // xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(10);
    hx = hsvg - 2
    svg.append("g") //A modifier
        .attr("class", "x axis")
        .attr("transform", "translate(0," + hx + ")")
        // .call(xAxis)
        .call(d3.axisTop(x))
    // text label for the x axis
    svg.append("text")
        .attr("transform", "translate(" + (w / 2) + " ," + (hsvg - 30) + ")")
        // .style("text-anchor", "middle")
        .attr("fill", "darksalmon")
        .attr("font-weight", "bold")
        .text("Longitude");

    svg.append("g") //A modifier
        .attr("class", "y axis")
        // .attr("transform", "translate(" + w - 10 + ",0)")
        // .call(d3.axisLeft(y))
        .call(d3.axisRight(y))

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 25)
        .attr("x", 0 - (hsvg / 2))
        .attr("dy", "1em")
        .attr("fill", "darksalmon")
        .attr("font-weight", "bold")
        .text("Latitude");

    svg.call(zoomMapStandard)
};