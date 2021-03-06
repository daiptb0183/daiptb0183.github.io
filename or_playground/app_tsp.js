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
var secondXAxis = d3.svg.axis().tickValues([]).scale(xScale).orient("bottom");
var secondYAxis = d3.svg.axis().tickValues([]).scale(yScale).orient("right");

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

    if (newData.x <= 100 && newData.x >= 0 && 
        newData.y <= 100 && newData.y >= 0 ) {
            dataset.push(newData);   // Push data to our array
            svg.selectAll("circle")  // For new circle, go through the update process
            .data(dataset)
            .enter()
            .append("circle")
            .attr(circleAttrs)  // Get attributes from circleAttrs var
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut);
        }
   
    //drawConnection()
    stopFlag = true;
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

function toCsv() {
    exportToCsv('dataset', dataset)
}

function exportToCsv(filename, rows) {
    
    var processRow = function (row) {
        var finalVal = '';
        for (var j = 0; j < row.length; j++) {
            var innerValue = row[j] === null ? '' : row[j].toString();
            if (row[j] instanceof Date) {
                innerValue = row[j].toLocaleString();
            };
            var result = innerValue.replace(/"/g, '""');
            if (result.search(/("|,|\n)/g) >= 0)
                result = '"' + result + '"';
            if (j > 0)
                finalVal += ',';
            finalVal += result;
        }
        return finalVal + '\n';
    };

    var csvFile = '';
    csvFile += processRow(['x','y']);
    for (var i = 0; i < rows.length; i++) {
        csvFile += processRow([rows[i].x,rows[i].y]);
    }

    var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

function clearRoute() {
    svg.selectAll('line').remove();

    
    svg.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr(circleAttrs)  // Get attributes from circleAttrs var
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);

    //drawConnection()
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
        //drawConnection()

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

async function randomExchange(numberOfExchange) {
    stopFlag = false
    while (stopFlag == false) {
        svg.selectAll('line').remove();
        //drawConnection()

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



//SIMULATED ANNEALING

function randomFloat(n)
{
	return (Math.random()*n);
}

function randomInt(n)
{
	return Math.floor(Math.random()*(n));
}

function randomInteger(a,b)
{
	return Math.floor(Math.random()*(b-a)+a);
}

function deep_copy(array, to)
{
	var i = array.length;
	while(i--)
	{
		to[i] = [array[i].x,array[i].y];
	}
}

function mutate2Opt(current_route, i, j)
{
	var neighbor = [];
	neighbor = [...current_route];
	while(i != j)
	{
		var t = neighbor[j];
		neighbor[j] = neighbor[i];
		neighbor[i] = t;

		i = (i+1) % current_route.length;
		if (i == j)
			break;
		j = (j-1+current_route.length) % current_route.length;
	}
	return neighbor;
}

function acceptanceProbability(current_cost, neighbor_cost, temperature)
{
	if(neighbor_cost < current_cost)
		return 1;
	return Math.exp((current_cost - neighbor_cost)/temperature);
}

async function simulatedAnnealing()
{

    temperature = 0.9;
    COOLING_RATE = 0.99;

	if (bestRoute.length == 0 && dataset.length > 0) {
        bestRoute = [...dataset]
    } else if (dataset.length == 0) {return}
    
    current_route = [...bestRoute]

    bestRouteLength = 1000000;
    
    
    stopFlag = false;
    while (stopFlag==false) {
        solve(temperature, COOLING_RATE);
        await sleep(50);
    }
    
}

function solve(temperature, COOLING_RATE)
{   
	if(temperature>0)
	{     
		var current_cost = calculateRouteLength(current_route);
		var k = randomInt(current_route.length);
		var l = (k+1+ randomInt(current_route.length - 2)) % current_route.length;
		if(k > l)
		{
			var tmp = k;
			k = l;
			l = tmp;
		}
		var neighbor = mutate2Opt(current_route, k, l);
        var neighbor_cost = calculateRouteLength(neighbor);
		if(Math.random() < acceptanceProbability(current_cost, neighbor_cost, temperature))
		{
			current_route = [...neighbor];
            current_cost = calculateRouteLength(current_route);
		}
		if(current_cost < bestRouteLength)
		{
            bestRoute = [...current_route]
			bestRouteLength = current_cost;
        }
        temperature *= COOLING_RATE;
        svg.selectAll('line').remove();
        drawRoute(neighbor, color="orange", opacity=0.3, stroke=2)
        drawRoute(bestRoute, color="black", opacity=0.8, stroke=2)
        document.getElementById("toptext").innerHTML = `Best route length: ${Math.round(bestRouteLength)}`;

	}
}
