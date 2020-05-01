const wMap = w;
const hMap = h;

var selectedField = "population"
var colorMap = "YlGnBu"
const scaleMulti = 4

let datasetAdvMap = []

//Create SVG element
let svgMap = d3.select("#mapDensityPop").append("svg")
    .attr("width", wMap)
    .attr("height", hMap)
    .attr("class", colorMap); //Rouge Violet

let cities = svgMap.append("g")
    .attr('id', 'citiesmap')

var zoom = d3.zoom()
    .on("zoom", function () {
        svgMap.attr("transform", d3.event.transform)
    })

var div = d3.select("#mapDensityPop").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
wLegend = w - 60
hLegend = h - 300
var legend = svgMap.append('g')
    // .attr('transform', 'translate(520, 250)')
    .attr("transform", "translate(" + wLegend + ", " + hLegend + ")")
    .attr('id', 'legend');

wLegendAx = wLegend + 25
var legendAxis = svgMap.append("g")
    // .attr('transform', 'translate(545, 250)')
    .attr('transform', "translate(" + wLegendAx + ", " + hLegend + ")")

var first_load = 0

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
            datasetAdvMap = rows;
            legend.selectAll('.colorbar')
                .data(d3.range(9))
                .enter().append('svgMap:rect')
                .attr('y', d => d * 20 + 'px')
                .attr('height', '20px')
                .attr('width', '20px')
                .attr('x', '0px')
                .attr("class", d => "q" + d + "-9")
            mapDrawPopDensity(first_load, selectedField, scaleMulti, datasetAdvMap, svgMap, cities, zoom, div, legendAxis)
        };

    });

document.getElementById("select_pop_dens").onchange = function (e) {
    selectedField = e.target.value
    first_load = 1
    mapDrawPopDensity(first_load, selectedField, scaleMulti, datasetAdvMap, svgMap, cities, zoom, div, legendAxis)

}