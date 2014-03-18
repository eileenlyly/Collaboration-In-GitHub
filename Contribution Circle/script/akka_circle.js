
var pj = "data/homebrew/";
var maxWidth=screen.width-120;

var outerRadius = screen.height/2 - 100,
    innerRadius = outerRadius - 40,
    bubbleRadius=innerRadius - 100,
    linkRadius=innerRadius-20,
    nodesTranslate=(outerRadius-bubbleRadius) +50,
    chordsTranslate=outerRadius+50;

d3.select(document.getElementById("akka_circle_mainDiv"))
    .style("width",(maxWidth) + "px");

d3.select(document.getElementById("akka_circle_bpg"))
    .style("width",(maxWidth) + "px");

var akka_circle_svg = d3.select(document.getElementById("akka_circle_svgDiv"))
    .append("svg")
    .attr("id","svg")
    .style("float", "left")
    .style("margin-left", "20px")
    .style("width", (outerRadius*2) + 100 + "px")
    .style("height", (outerRadius*2) + 100 + "px");



var chordsSvg=akka_circle_svg.append("g")
    .attr("class","chords")
    .attr("transform", "translate(" + chordsTranslate + "," + chordsTranslate + ")");


var linksSvg=akka_circle_svg.append("g")
    .attr("class","links")
    .attr("transform", "translate(" + chordsTranslate + "," + chordsTranslate + ")")


var highlightSvg=akka_circle_svg.append("g")
    .attr("transform", "translate(" + chordsTranslate + "," + chordsTranslate + ")")
    .style("opacity",0);


var nodesSvg=akka_circle_svg.append("g")
    .attr("class","nodes")
    .attr("transform", "translate(" + nodesTranslate + "," + nodesTranslate + ")");

function comparator(a, b) {
    if(a.Year != b.Year){
        return a.Year - b.Year;
    }
    else{
        return a.Month - b.Month;
    }
}

 var bubble = d3.layout.pack()
    .sort(comparator)
    .size([bubbleRadius*2, bubbleRadius*2])
    .padding(1.5);

var chord = d3.layout.chord()
    .padding(.05)
    .sortSubgroups(d3.descending)
    .sortChords(d3.descending);

var diagonal = d3.svg.diagonal.radial();

var arc = d3.svg.arc()
    .innerRadius(innerRadius)
    .outerRadius(innerRadius + 10);


var toolTip = d3.select(document.getElementById("toolTip"));
var header = d3.select(document.getElementById("head"));
var header1 = d3.select(document.getElementById("header1"));
var header2 = d3.select(document.getElementById("header2"));
var total = d3.select(document.getElementById("akka_circle_totalDiv"));
var demColor="#33CC66";
var repColor="#CC99FF";

var fills= d3.scale.ordinal().range(["#00AC6B","#20815D","#007046","#35D699","#60D6A9"]);

var linkGroup;

var cns=[],
    users=[],
    commits=[];
    pulls=[],
    contr=[],
    pullreqs=[],
    total_outs=0,
    total_ins=0,
    userByID={},
    chordsById={},
    nodesById={},
    chordCount=20,
    pText=null,
    pChords=null,
    nodes=[],
    renderLinks=[],
    colorByName={},
    userCommits=0,
    delay=2;

var buf_indexByName={},
    indexByName = {},
    nameByIndex = {},
    labels = [],
    chords = [];

//initialize
function initialize() {

    userCommits=0;
    renderLinks=[];
    pulls=[];
    contr=[];

    var root={};
    var r={};
    r.value=total_ins+total_outs;
    r.children=pullreqs;

    root.children=[r];
    root.CAT="root";

    nodes=bubble.nodes(root);

    var totalPullAmount=0;
    nodes.forEach (function (d) {
        if (d.depth==2) {
            nodesById[d.PQID]=d;
            d.relatedLinks=[];
            d.CMT=Number(d.CMT);
            d.currentCMT= d.CMT;
            pulls.push(d);
            totalPullAmount+= d.CMT;
        }
    })

    commits.forEach(function (d) {
        contr.push(d);
    });

    buildChords();

    var totalContr=0;
    contr.forEach(function (d) {
        nodesById[d.PQID].relatedLinks.push(d);
        chordsById[d.UID].relatedLinks.push(d);
        totalContr+= Number(d.CMT_AMT);
    })

}

//events



function node_onMouseOver(d,type) {
    if (type=="PULL") {
        if(d.depth < 2) return;
        toolTip.transition()
            .duration(200)
            .style("opacity", ".8");

        if(d.CAT == "M"){
            header1.text("On "+ d.Month + '/'+d.Year);
        }
        else{
            header1.text("Pull Requested by");
        }
        header.text(d.UNM);
        header2.text("Total Commits: " + Number(d.CMT));
        toolTip.style("right",  "100px")
            .style("top", 200 + "px")
            .style("height","80px");

        highlightLinks(d,true);
    }
    else if (type=="CMT") {

        /*
         Highlight chord stroke
         */
        toolTip.transition()
            .duration(200)
            .style("opacity", ".8");

        header1.text(userByID[d.UID].UNM);
        if(d.CAT == "M"){
            header.text(Number(d.CMT_AMT) + " direct commits");
        }
        else{
            header.text(Number(d.CMT_AMT) + " commits to pull requests");
        }
        header2.text("on " + d.Month +"/" + d.Year);
        toolTip.style("right", "100px")
            .style("top", 200 + "px")
            .style("height","100px");
        highlightLink(d,true);
    }
    else if (type=="USER") {
        /*
         highlight all commits and all pulls
         */
        toolTip.transition()
            .duration(200)
            .style("opacity", ".8");

        header1.text("User");
        header.text(userByID[d.label].UNM);
        header2.text("Total Commits: " + userByID[d.label].CMT);
        toolTip.style("right", "100px")
            .style("top", 200 + "px")
            .style("height","110px");
        highlightLinks(chordsById[d.label],true);
    }
}

function node_onMouseOut(d,type) {
    if (type=="PULL") {
        highlightLinks(d,false);
    }
    else if (type=="CMT") {
        highlightLink(d,false);
    }
    else if (type=="USER") {
        highlightLinks(chordsById[d.label],false);
    }


    toolTip.transition()									// declare the transition properties to fade-out the div
        .duration(500)									// it shall take 500ms
        .style("opacity", "0");							// and go all the way to an opacity of nil

}

function highlightLink(g,on) {

    var opacity=((on==true) ? 0.4 : .03);

    var link=d3.select(document.getElementById("l_" + g.Key));
    link.transition((on==true) ? 15:55)
        .style("fill-opacity",opacity)
        .style("stroke-opacity",opacity);

    var arc=d3.select(document.getElementById("a_" + g.Key));
    arc.transition().style("fill-opacity",(on==true) ? opacity :.6);

    var circ=d3.select(document.getElementById("c_" + g.PQID));
    circ.transition((on==true) ? 15:55)
        .style("opacity",((on==true) ?1 :0));

    var text=d3.select(document.getElementById("t_" + g.UID));
    text.transition((on==true) ? 0:30)
        .style("fill",(on==true) ? "#ffdd00" : "#cccccc")
        .style("font-size",(on==true) ? "12px" : "8px")
        .style("stroke-width",((on==true) ? 2 : 0));


}

function highlightLinks(d,on) {

    d.relatedLinks.forEach(function (d) {
        highlightLink(d,on);
    })

}

//data
var dataCalls=[];
var numCalls=0;

function fetchData() {
    dataCalls=[];
    addStream(pj+"pullreqs.csv", onFetchPullreqs);
    addStream(pj+"commits.csv", onFetchCommits);
    addStream(pj+"users.csv", onFetchUsers);
    startFetch();
}


function onFetchPullreqs(csv) {
    for (var i=0; i < csv.length; i++) {
        var r=csv[i];
        r.value=Number(r.CMT);
        cns[r.PQID]=r;
        pullreqs.unshift(r);
        if(r.CAT=="O")
            total_outs+= r.value;
        else
            total_ins+= r.value;
    }
    endFetch();
}

function onFetchCommits(csv) {
    var i=0;
    csv.forEach(function (d) {
        d.Key=i++;
        commits.unshift(d);
    });

    endFetch();

}

function onFetchUsers(csv) {

    users=csv;
    for (var i=0; i < users.length; i++) {
        userByID[users[i].UID]=users[i];
    }

    endFetch();

}

function addStream(file,func) {
    var o={};
    o.file=file;
    o.function=func;
    dataCalls.push(o);
}

function startFetch() {
    numCalls=dataCalls.length;
    dataCalls.forEach(function (d) {
        d3.csv(d.file, d.function);
    })
}

function endFetch() {
    numCalls--;
    if (numCalls==0) {
        // dataDispatch.end();
        main();
    }
}

//buildchords

function buildChords() {

    var  matrix = [];


    labels=[];
    chords=[];

    for (var i=0; i < users.length; i++) {
        var l={};
        l.index=i;
        l.label="null";
        l.angle=0;
        labels.push(l);

        var c={}
        c.label="null";
        c.source={};
        c.target={};
        chords.push(c);

    }


    buf_indexByName=indexByName;

    indexByName=[];
    nameByIndex=[];
    n = 0;

    var totalPacAmount=0;

    // Compute a unique index for each package name
    users.forEach(function(d) {
        d = d.UID;
        if (!(d in indexByName)) {
            nameByIndex[n] = d;
            indexByName[d] = n++;
        }
    });

    users.forEach(function(d) {
        var source = indexByName[d.UID],
            row = matrix[source];
        if (!row) {
            row = matrix[source] = [];
            for (var i = -1; ++i < n;) row[i] = 0;
        }
        row[indexByName[d.UID]]= Number(d.CMT);
        totalPacAmount+= Number(d.CMT);
    });

    console.log("totalPacAmount=" + totalPacAmount)

    chord.matrix(matrix);

    var tempLabels=[];
    var tempChords=[];


    chords=chord.chords();

    var i=0;
    chords.forEach(function (d) {
        d.label=nameByIndex[i];
        d.angle=(d.source.startAngle + d.source.endAngle) / 2
        var o={};
        o.startAngle= d.source.startAngle;
        o.endAngle= d.source.endAngle;
        o.index= d.source.index;
        o.value= d.source.value;
        o.currentAngle= d.source.startAngle;
        o.currentLinkAngle= d.source.startAngle;
        o.Amount= d.source.value;
        o.source= d.source;
        o.relatedLinks=[];
        chordsById[d.label]= o;
        i++;
    });


    function getFirstIndex(index,indexes) {
        for (var i=0; i < chordCount; i++) {
            var found=false;
            for (var y=index; y < indexes.length; y++) {
                if (i==indexes[y]) {
                    found=true;
                }
            }
            if (found==false) {
                return i;
                //  break;
            }
        }
        //      console.log("no available indexes");
    }

    function getLabelIndex(name) {
        for (var i=0; i < chordCount; i++) {
            if (buffer[i].label==name) {
                return i;
                //   break;
            }
        }
        return -1;
    }
}

//update

function updateLinks(links) {

    linkGroup=linksSvg.selectAll("g.links")
        .data(links, function (d,i) {
            return d.Key;
        });

    //   linkGroup.selectAll("g.links").transition(500).style("opacity",1);

    var enter=linkGroup.enter().append("g").attr("class","links");
    var update=linkGroup.transition();


    /*  ARC SEGMENTS */
    enter.append("g")
        .attr("class", "arc")
        .append("path")
        .attr("id",function (d) { return "a_" + d.Key;})
        .style("fill", function(d) { return (d.CAT=="M") ? demColor : (d.CAT=="O") ? repColor : otherColor; })
        .style("fill-opacity",.6)
        .attr("d", function (d,i) {
            var newArc={};
            var relatedChord=chordsById[d.UID];
            newArc.startAngle=relatedChord.currentAngle;
            relatedChord.currentAngle=relatedChord.currentAngle+(Number(d.CMT_AMT)/relatedChord.value)*(relatedChord.endAngle-relatedChord.startAngle);
            newArc.endAngle=relatedChord.currentAngle;
            newArc.value= Number(d.CMT_AMT);
            var arc=d3.svg.arc(d,i).innerRadius(linkRadius).outerRadius(innerRadius);
            userCommits+=newArc.value;
            total.text(userCommits + " commits");

            return arc(newArc,i);
        })
        .on("mouseover", function (d) { node_onMouseOver(d,"CMT");})
        .on("mouseout", function (d) {node_onMouseOut(d,"CMT"); });

    /* LINKS */
    enter.append("path")
        .attr("class","link")
        .attr("id",function (d) { return "l_" + d.Key;})
        .attr("d", function (d,i) {
            d.links=createLinks(d);
            var diag = diagonal(d.links[0],i);
            diag += "L" + String(diagonal(d.links[1],i)).substr(1);
            diag += "A" + (linkRadius) + "," + (linkRadius) + " 0 0,0 " +  d.links[0].source.x + "," + d.links[0].source.y;

            return diag;
        })
        .style("stroke",function(d) { return (d.CAT=="M") ? demColor : (d.CAT=="O") ? repColor : otherColor; })
        .style("stroke-opacity",.03)
        .style("fill-opacity",0.02)
        .style("fill",function(d) { return (d.CAT=="M") ? demColor : (d.CAT=="O") ? repColor : otherColor; })
        .on("mouseover", function (d) { node_onMouseOver(d,"CMT");})
        .on("mouseout", function (d) {node_onMouseOut(d,"CMT"); });


    /* NODES */
    enter.append("g")
        .attr("class","node")
        .append("circle")
        .style("fill",function(d) { return (d.CAT=="M") ? demColor : (d.CAT=="O") ? repColor : otherColor; })
        .style("fill-opacity",0.3)
        .style("stroke-opacity",0.5)
        .attr("r", function (d) {
            var relatedNode=nodesById[d.PQID];
            //Decrement Related Node
            relatedNode.currentCMT=relatedNode.currentCMT-Number(d.CMT_AMT);
            var ratio=((relatedNode.CMT-relatedNode.currentCMT)/relatedNode.CMT);
            return relatedNode.r*ratio;
        })
        .attr("transform", function (d,i) {
            return "translate(" + (d.links[0].target.x) + "," + (d.links[0].target.y) + ")";
        })


    linkGroup.exit().remove();


    function createLinks(d) {
        var target={};
        var source={};
        var link={};
        var link2={};
        var source2={};

        var relatedChord=chordsById[d.UID];
        var relatedNode=nodesById[d.PQID];
        var r=linkRadius;
        var currX=(r * Math.cos(relatedChord.currentLinkAngle-1.57079633));
        var currY=(r * Math.sin(relatedChord.currentLinkAngle-1.57079633));

        var a=relatedChord.currentLinkAngle-1.57079633; //-90 degrees
        relatedChord.currentLinkAngle=relatedChord.currentLinkAngle+(Number(d.CMT_AMT)/relatedChord.value)*(relatedChord.endAngle-relatedChord.startAngle);
        var a1=relatedChord.currentLinkAngle-1.57079633;

        source.x=(r * Math.cos(a));
        source.y=(r * Math.sin(a));
        target.x=relatedNode.x-(chordsTranslate-nodesTranslate);
        target.y=relatedNode.y-(chordsTranslate-nodesTranslate);
        source2.x=(r * Math.cos(a1));
        source2.y=(r * Math.sin(a1));
        link.source=source;
        link.target=target;
        link2.source=target;
        link2.target=source2;

        return [link,link2];

    }


    //   console.log("updateLinks()");


}

function updateNodes() {

    var node = nodesSvg.selectAll("g.node")
        .data(pulls, function (d,i) {
            return d.PQID;
        });


    var enter=node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

    enter.append("circle")
        .attr("r", function(d) { return d.r; })
        .style("fill-opacity", function (d) { return (d.depth < 2) ? 0 : 0.05})
        .style("stroke",function(d) {
            return ((d.CAT=='M') ? demColor : repColor);
        })
        .style("stroke-opacity", function (d) { return (d.depth < 2) ? 0 : 0.2})
        .style("fill", function(d) {
            return ((d.CAT=='M') ? demColor : repColor);
        });



    var g=enter.append("g")
        .attr("id", function(d) { return "c_" + d.PQID; })
        .style("opacity",0);

    g.append("circle")
        .attr("r", function(d) { return d.r+2; })
        .style("fill-opacity", 0)
        .style("stroke", "#FFF")
        .style("stroke-width",1)
        .style("stroke-opacity",.1);

    g.append("circle")
        .attr("r", function(d) { return d.r; })
        .style("fill-opacity", 0)
        .style("stroke", "#ffdd00")
        .style("stroke-width",1.5)
        .style("stroke-opacity",0.7)
        .on("mouseover", function (d) { node_onMouseOver(d,"PULL"); })
        .on("mouseout", function (d) {node_onMouseOut(d,"PULL"); });


    node.exit().remove().transition(500).style("opacity",0);
}

function updateChords() {


    var arcGroup = chordsSvg.selectAll("g.arc")
        .data(chords, function (d) {
            return d.label;
        });

    var enter =arcGroup.enter().append("g").attr("class","arc");

    enter.append("text")
        .attr("class","chord")
        .attr("dy", ".35em")
        .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
        .attr("transform", function(d) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                + "translate(" + (innerRadius + 6) + ")"
                + (d.angle > Math.PI ? "rotate(180)" : "");
        })
        .text(function(d) { return trimLabel(userByID[d.label].UNM); })
        .on("mouseover", function (d) { node_onMouseOver(d,"USER");})
        .on("mouseout", function (d) {node_onMouseOut(d,"USER"); });

    arcGroup.transition()
        .select("text")
        .attr("id",function (d) { return "t_"+ d.label;})
        .attr("dy", ".35em")
        .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
        .attr("transform", function(d) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                + "translate(" + (innerRadius + 6) + ")"
                + (d.angle > Math.PI ? "rotate(180)" : "");
        })
        .style("fill", "#cccccc")
        .style("font-size", "8px")
        .text(function(d) { return trimLabel(userByID[d.label].UNM); });



    enter.append("path")
        .style("fill-opacity",0)
        .style("stroke", "#555")
        .style("stroke-opacity",0.4)
        .attr("d", function (d,i) {
            var arc=d3.svg.arc(d,i).innerRadius(innerRadius-20).outerRadius(innerRadius);
            return arc(d.source,i);
        });

    arcGroup.transition()
        .select("path")
        .attr("d", function (d,i) {
            var arc=d3.svg.arc(d,i).innerRadius(innerRadius-20).outerRadius(innerRadius);
            return arc(d.source,i);
        });


    arcGroup.exit().remove();
}

function trimLabel(label) {
    if (label.length > 25) {
        return String(label).substr(0,25) + "...";
    }
    else {
        return label;
    }
}

function getChordColor(i) {
    var country=nameByIndex[i];
    if (colorByName[country]==undefined) {
        colorByName[country]=fills(i);
    }

    return colorByName[country];
}

//main

fetchData();

var intervalId;
var counter=2;
var renderLinks=[];

function main() {
    initialize();
    updateNodes();
    updateChords();
    console.log("contr.length=" + contr.length)
    //  updateLinks(contr);
    intervalId=setInterval(onInterval,1);
}

function onInterval() {
    if(contr.length==0) {
        clearInterval(intervalId);
    }
    else {
        // renderLinks=[];
        for (var i=0; i < counter; i++) {
            if (contr.length > 0) {
                renderLinks.push(contr.pop());
            }
        }
        counter=30;
        //counter++;
        updateLinks(renderLinks);
    }
}


