const w = 600;
const h = 600;
const wg = 500;
const hg = 500;

let dataset = [];

const histoWidth = 600;
const histoHeigth = 200;
const scalePop = 3000;
const scaleDensity = 300;

var selectedField = "density"
var colorMap = "YlGnBu"
const scaleMulti = 4

document.getElementById("select_pop_dens").onchange = function (e) {
    selectedField = e.target.value
    console.log("selectedField", selectedField)
}

if (selectedField == "population") {
    colorMap = "YlGnBu"
} else if (selectedField == "density") {
    colorMap = "RdPu"
}

//Create SVG element
let svg = d3.select("#mapDensityPop").append("svg")
    .attr("width", w)
    .attr("height", h)
    // .attr("class", "Blues");
    // .attr("class", "Greens");
    // .attr("class", "YlGnBu"); //Jaune Vert Bleu
    // .attr("class", "GnBu"); //Vert Bleu
    .attr("class", colorMap); //Rouge Violet

let cities = svg.append("g")
    .attr('id', 'citiesmap')
// .attr('transform', 'translate(50, 50)')
// .attr("marginRight", 150);//.attr("width", wg - 200).attr("height", hg - 200);

var zoom = d3.zoom()
    .on("zoom", function () {
        svg.attr("transform", d3.event.transform)
    })

var div = d3.select("#mapDensityPop").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var legend = svg.append('g')
    .attr('transform', 'translate(520, 250)')
    .attr('id', 'legend');

// let svgHisto = d3.select("body").append("svg").attr("width", histoWidth).attr("height", histoHeigth);

function drawMap() {
    cities.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("width", 1)
        .attr("height", 1)
        .attr("x", (d) => x(d.longitude))
        .attr("y", (d) => y(d.latitude))
        // .attr("fill", (d) => myColor(d.population))
        // .attr("id", (d) => "code_" + d.codePostal)
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

    legend.selectAll('.colorbar')
        .data(d3.range(9))
        .enter().append('svg:rect')
        .attr('y', d => d * 20 + 'px')
        .attr('height', '20px')
        .attr('width', '20px')
        .attr('x', '0px')
        .attr("class", d => "q" + d + "-9")

    svg.call(zoom)

};


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
                .range([h, 0]);


            myColor = d3.scaleSequential()
                .domain([1, scalePop])
                .interpolator(d3.interpolatePuRd);

            quantile = d3.scaleQuantile()
                // .domain([0, d3.median(rows, (row) => row.population) + 5000])
                .domain([0, d3.mean(rows, (row) => row[selectedField]) * scaleMulti])
                .range(d3.range(9));

            var legendScale = d3.scaleLinear()
                // .domain(d3.extent(rows, (row) => row.population))
                // .domain([0, d3.median(rows, (row) => row.population) + 5000])
                .domain([0, d3.mean(rows, (row) => row[selectedField]) * scaleMulti])
                // .domain(d3.extent(dataset, (d) => d.population))
                .range([0, 9 * 20]);

            console.log("domain min max", d3.median(rows, (row) => row.population), d3.mean(rows, (row) => row.population), d3.mean(rows, (row) => row.population) * scaleMulti)
            console.log("domain min max", d3.median(rows, (row) => row[selectedField]), d3.mean(rows, (row) => row[selectedField]), d3.mean(rows, (row) => row[selectedField]) * scaleMulti)

            dataset = rows;
            drawMap()
            svg.append("g")
                .attr('transform', 'translate(545, 250)')
                .call(d3.axisRight(legendScale).ticks(6));

        };

    });