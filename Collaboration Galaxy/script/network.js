/**
 * Created by eileenlyly on 2/20/14.
 */

var width = 1300,
    height = 800;

var force = d3.layout.force()
    .charge( function(d) { return -80 * Math.sqrt(d.count)} )
    .linkDistance(80)
    .gravity(0.9)
    .size([width - 250, height]);

var svg = d3.select(document.getElementById("svgDiv"))
    .append("svg")
    .attr("width", width)
    .attr("height", height);

var toolTip = d3.select(document.getElementById("toolTip"));
var tooltip_header = d3.select(document.getElementById("tooltip_header"));
var tooltip_header1 = d3.select(document.getElementById("tooltip_header1"));
var tooltip_header2 = d3.select(document.getElementById("tooltip_header2"));

d3.json("data/reddit.json", function(error, graph) {

    var kind_to_color = function(d){
        if(d.type == "O") return "#CC99FF";
        return "#33CC66";
    };

    var main = svg.append("g")
        .attr("class", "graph");

    force
        .nodes(graph.nodes)
        .links(graph.links)
        .start();

    var link = main.selectAll(".link")
        .data(graph.links)
        .enter().append("line")
        .attr("class", "link")
        .style("stroke","888888")
        .style("stroke-opacity", 0.2)
        .style("stroke-width", function(d) { return d.count/10; });

    var node = main.selectAll(".node_circle")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("class", "node_circle")
        .attr("r", function(d) {
            if (d.count == 0) return 0;
            return Math.max(Math.pow(d.count,0.45), 2); })
        .style("fill", function(d){ return kind_to_color(d).toString(); } )
        .on("mouseover", function(d) { mouseover_node(d); })
        .on("mouseout", function(d) { mouseout_node(d) })
        .call(force.drag);

    var label = main.selectAll(".node_label")
        .data(graph.nodes)
        .enter().append("text")
        .attr("class", "node_label")
        .attr("dx", function(d) { return 2 + 0.5 * Math.sqrt(d.count); })
        .attr("dy", ".4em")
        .attr("font-family", "Verdana")
        .attr("font-size", 5)
        .style("fill", "#000000")
        .style("fill-opacity", 0)
        .text(function(d) { return d.name; });

    force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });

        label.attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y; });
    });

    var mouseover_node = function(z){

        var neighbors = {};
        neighbors[z.index] = true;
        var countnb = 0;
        link.style("stroke-opacity", 0.1);

        link.filter(function(d){
            if (d.source == z) {
                neighbors[d.target.index] = true
                countnb++
                return true
            } else if (d.target == z) {
                neighbors[d.source.index] = true
                countnb++
                return true
            } else {
                return false
            }
        })
            .style("stroke-opacity", 1);

        node.filter(function(d){ if (d == z) return true})
            .style("fill","0066FF");

        node.filter(function(d){ return neighbors[d.index] })
            .style("stroke-width", 3);

        label.filter(function(d){ return neighbors[d.index] })
            .attr("font-size", 10)
            .style("fill-opacity", 1);

        toolTip.style("right",  "50px")
            .style("top", "200px")
            .style("height","80px");

        toolTip.transition()
            .duration(200)
            .style("opacity", ".8");

        tooltip_header.text(z.name);
        tooltip_header1.text(z.count+" Commits");
        tooltip_header2.text("Collaborate with "+countnb+ " Users");

    };

    var mouseout_node = function(z){
        link
            .style("stroke-opacity", 0.2);

        node
            .style("stroke-width", 1)
            .style("fill", function(d){ return kind_to_color(d).toString(); });

        label
            .attr("font-size", 5)
            .style("fill-opacity", 0)

        toolTip.transition()
            .duration(400)
            .style("opacity", "0");

    };

});