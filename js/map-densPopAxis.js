const w = 600;
const h = 600;
let dataset = [];
const histoWidth = 600;
const histoHeigth = 200;
const scalePop = 3000;
const scaleDensity = 300;

//Create SVG element
let svg = d3.select("#mapDensityPop").append("svg").attr("width", w).attr("height", h);

// var zoom = d3.zoom()
//     .on("zoom", function () {
//         svg.attr("transform", d3.event.transform)
//     })

var div = d3.select("#mapDensityPop").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// let svgHisto = d3.select("body").append("svg").attr("width", histoWidth).attr("height", histoHeigth);

function drawMap() {
    svg.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("width", 1)
        .attr("height", 1)
        .attr("x", (d) => x(d.longitude))
        .attr("y", (d) => y(d.latitude))
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


    // svg.call(zoom)
};

// function drawHisto() {
//     svgHisto.selectAll("rect")
//         .data(dataset)
//         .enter()
//         .append("rect")
//         .attr("width", 1)
//         .attr("height", 1)
//         .attr("x", (d) => x(d.longitude))
//         .attr("y", (d) => y(d.latitude))
//     svgG.call(d3.axisBottom(x));
// };


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
        console.log("loaded " + rows.length + " rows");
        if (rows.length > 0) {
            console.log("First row: ", rows[0]);
            console.log("Last row: ", rows[rows.length - 1]);
            x = d3.scaleLinear()
                .domain(d3.extent(rows, (row) => row.longitude))
                // .domain([0, d3.max(rows, (row) => row.longitude)])
                .range([0, w]);

            xinv = d3.scaleLinear()
                .domain(d3.extent(rows, (row) => row.longitude))
                // .domain([0, d3.max(rows, (row) => row.longitude)])
                .range([w, 0]);

            y = d3.scaleLinear()
                .domain(d3.extent(rows, (row) => row.latitude))
                // .domain([0, d3.max(rows, (row) => row.latitude)])
                .range([h, 0]);

            // codePost = d3.scaleLinear()
            // .domain(d3.extent(rows, (row) => row.codePostal))
            // .range([h, 0]);

            myColor = d3.scaleSequential()
                // myColor = d3.scaleLinear()
                .domain([1, scalePop])
                // .domain(d3.extent(rows, (row) => row.population))
                // .domain([1, d3.max(rows, row => +row.density)])
                .interpolator(d3.interpolatePuRd);

            // myColor = d3.scaleOrdinal().domain(rows)
            //     .range(d3.schemeSet3);

            dataset = rows;
            drawMap()

            // xHisto = d3.scaleLinear()
            //     .domain(d3.extent(rows, (row) => row.population))//.nice()
            //     .range([margin.left, width - margin.right])
            // yHisto = d3.scaleLinear()
            //     .domain([0, d3.max(bins, d => d.length)]).nice()
            //     .range([height - margin.bottom, margin.top])
        };




    });