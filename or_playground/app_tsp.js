var w = 800,
    h = 800,
    margin = { top: 50, right: 20, bottom: 20, left: 40 },
    radius = 8;

var svg = d3.select("body").append("svg").attr({
width: w,
height: h,
})
.style("display", "block")
.style("margin", "auto");

var dataset = [
];

// We're passing in a function in d3.max to tell it what we're maxing (x value)
var xScale = d3.scale.linear()
    .domain([0, 100])
    .range([margin.left, w - margin.right]);  // Set margins for x specific

// We're passing in a function in d3.max to tell it what we're maxing (y value)
var yScale = d3.scale.linear()
    .domain([100, 0])
    .range([margin.top, h - margin.bottom]);  // Set margins for y specific

// Add a X and Y Axis (Note: orient means the direction that ticks go, not position)
var xAxis = d3.svg.axis().scale(xScale).orient("top");
var yAxis = d3.svg.axis().scale(yScale).orient("left");
var secondXAxis = d3.svg.axis().scale(xScale).orient("bottom");
var secondYAxis = d3.svg.axis().scale(yScale).orient("right");

var circleAttrs = {
    cx: function(d) { return xScale(d.x); },
    cy: function(d) { return yScale(d.y); },
    r: radius
};

let bestRouteLength = 1000000;
let bestRoute = [];

function drawAxis () {
    // Adds X-Axis as a 'g' element
    svg.append("g").attr({
    "class": "axis",  // Give class so we can style it
    transform: "translate(" + [0, margin.top] + ")"  // Translate just moves it down into position (or will be on top)
    }).call(xAxis);  // Call the xAxis function on the group
    
    // Adds Y-Axis as a 'g' element
    svg.append("g").attr({
    "class": "axis",
    transform: "translate(" + [margin.left, 0] + ")"
    }).call(yAxis);  // Call the yAxis function on the group
    
    // Adds second X-Axis as a 'g' element
    svg.append("g").attr({
        "class": "axis",
        transform: "translate(" + [0, h-margin.bottom] + ")"
        }).call(secondXAxis);  // Call the yAxis function on the group
    
    // Adds second Y-Axis as a 'g' element
    svg.append("g").attr({
        "class": "axis",
        transform: "translate(" + [w-margin.right, 0] + ")"
        }).call(secondYAxis);  // Call the yAxis function on the group
    
}

drawAxis()

svg.selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
    .attr(circleAttrs)  // Get attributes from circleAttrs var
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);

// On Click, we want to add data to the array and chart
svg.on("click", function() {
    var coords = d3.mouse(this);

    // Normally we go from data to pixels, but here we're doing pixels to data
    var newData= {
    x: Math.round( xScale.invert(coords[0])),  // Takes the pixel number to convert to number
    y: Math.round( yScale.invert(coords[1]))
    };

    dataset.push(newData);   // Push data to our array

    svg.selectAll("circle")  // For new circle, go through the update process
    .data(dataset)
    .enter()
    .append("circle")
    .attr(circleAttrs)  // Get attributes from circleAttrs var
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);
   
    drawConnection()
    document.getElementById("toptext").innerHTML = `Best route length: ${Math.round(0)}`;
    bestRouteLength = 1000000;
    bestRoute = [];
})

function drawConnection() {
    if (dataset.length  > 1) {
        d3.selectAll("line").remove();
        for (let index1 = 0; index1 < dataset.length; index1++) {
            for (let index2 = 0; index2 < dataset.length; index2++) {
                if (index2 < index1) {
                    svg.append('line')
                        .style("stroke", "grey")
                        .style("stroke-width", 1)
                        .style("stroke-opacity", .1)
                        .attr("x1", Math.round( xScale(dataset[index1].x)))
                        .attr("y1", Math.round( yScale(dataset[index1].y)))
                        .attr("x2", Math.round( xScale(dataset[index2].x)))
                        .attr("y2", Math.round( yScale(dataset[index2].y)));
                }
            }
        }
    }
}

// Create Event Handlers for mouse
function handleMouseOver(d, i) {  // Add interactivity

    // Use D3 to select element, change color and size
    d3.select(this).attr({
        fill: "orange",
        r: radius * 2
    });

    // Specify where to put label of text
    svg.append("text").attr({
        id: "t" + d.x + "-" + d.y + "-" + i,  // Create an id for text so we can select it later for removing on mouseout
        x: function() { return xScale(d.x) - 15; },
        y: function() { return yScale(d.y) - 20; }
    })
    .text(function() {
        return [d.x, d.y];  // Value of the text
    });
    }

function handleMouseOut(d, i) {
    // Use D3 to select element, change color back to normal
    d3.select(this).attr({
        fill: "black",
        r: radius
    });

    // Select text by id and then remove
    d3.select("#t" + d.x + "-" + d.y + "-" + i).remove();  // Remove text location
    }

function clearArray() {
    dataset = []

    svg.selectAll('*').remove();

    drawAxis()
    
    svg.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr(circleAttrs)  // Get attributes from circleAttrs var
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);

    document.getElementById("toptext").innerHTML = `Best route length: ${Math.round(0)}`;
    bestRouteLength = 1000000;
    bestRoute = [];
    stopFlag = true;
}

function calculateRouteLength(route) {
    
    let routeLength=0

    route.forEach(function(item, index) {
        if (index < route.length - 1) {
            a = route[index].x - route[index+1].x;
            b = route[index].y - route[index+1].y;

            routeLength += Math.sqrt( a*a + b*b )
        }
    });

    if (route.length  > 2) {
        a = route[0].x - route[route.length - 1].x;
        b = route[0].y - route[route.length - 1].y;

        routeLength += Math.sqrt( a*a + b*b )
    }

    return routeLength
}

function drawRoute(route, color, opacity, stroke) {
    route.forEach(function(item, index) {
        if (index < route.length - 1) {
            svg.append('line')
                        .style("stroke", color)
                        .style("stroke-width", stroke)
                        .style("stroke-opacity", opacity)
                        .attr("x1", Math.round( xScale(route[index].x)))
                        .attr("y1", Math.round( yScale(route[index].y)))
                        .attr("x2", Math.round( xScale(route[index+1].x)))
                        .attr("y2", Math.round( yScale(route[index+1].y)));
        }
    });

    svg.append('line')
    .style("stroke", color)
    .style("stroke-width", stroke)
    .style("stroke-opacity", opacity)
    .attr("x1", Math.round( xScale(route[0].x)))
    .attr("y1", Math.round( yScale(route[0].y)))
    .attr("x2", Math.round( xScale(route[route.length - 1].x)))
    .attr("y2", Math.round( yScale(route[route.length - 1].y)));
}

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }

var stopFlag = false;

async function initializeRandomRoute() {
    stopFlag = false
    while (stopFlag == false) {
        svg.selectAll('line').remove();
        drawConnection()

        if (dataset.length  > 1) {
            let route = shuffle([...dataset])
            drawRoute(route, color="orange", opacity=0.3, stroke=2)
            routeLength = calculateRouteLength(route)
            if (routeLength < bestRouteLength) {
                bestRouteLength = routeLength
                bestRoute = [...route]
            }
            drawRoute(bestRoute, color="black", opacity=0.8, stroke=2)
            document.getElementById("toptext").innerHTML = `Best route length: ${Math.round(bestRouteLength)}`;
    }
            await sleep(50);
    }
}

async function twoOpt(numberOfExchange) {
    stopFlag = false
    while (stopFlag == false) {
        svg.selectAll('line').remove();
        drawConnection()

        if (dataset.length  > 1) {
            if (bestRoute.length == 0) {
                initializeRandomRoute()
            }
            let route = [...bestRoute]
            
            for (let i = 0; i < numberOfExchange; i++) {
                x = getRandomInt(route.length)
                y = getRandomInt(route.length)
                var b = route[y];
                    route[y] = route[x];
                    route[x] = b;
              }
            

            drawRoute(route, color="orange", opacity=0.3, stroke=2)
            routeLength = calculateRouteLength(route)
            if (routeLength < bestRouteLength) {
                bestRouteLength = routeLength
                bestRoute = [...route]
            }
            drawRoute(bestRoute, color="black", opacity=0.8, stroke=2)
            document.getElementById("toptext").innerHTML = `Best route length: ${Math.round(bestRouteLength)}`;
    }
        await sleep(50);
    }
    
}
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

function stop(){
    stopFlag = true;
}