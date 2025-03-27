import * as d3 from 'd3';
import { VisualizationDataPoint, MarketEntryDataPoint } from './visualizationData';

export const createVisualization = (
  containerId: string, 
  visualizationType: string, 
  data: VisualizationDataPoint[] | MarketEntryDataPoint[]
) => {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Clear existing content
  container.innerHTML = '';
  
  if (visualizationType === 'radar') {
    createPainPointsRadarChart(containerId, data as VisualizationDataPoint[]);
  } else if (visualizationType === 'heatmap') {
    createMarketEntryHeatmap(containerId, data as MarketEntryDataPoint[]);
  }
};

function createPainPointsRadarChart(containerId: string, data: VisualizationDataPoint[]) {
  // Configuration
  const width = 500;
  const height = 500;
  const margin = 60;
  const colorPrimary = "#3498db"; // Blue accent color
  const colorSecondary = "#2c3e50"; // Dark background color
  const colorHighlight = "#e74c3c"; // Highlight color for emphasis
  
  // Create SVG
  const svg = d3.select(`#${containerId}`)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("style", "width: 100%; height: auto; max-height: 500px;")
    .append("g")
    .attr("transform", `translate(${width/2},${height/2})`);

  // Scales
  const radius = Math.min(width, height) / 2 - margin;
  const angleScale = d3.scaleLinear()
    .domain([0, data.length])
    .range([0, 2 * Math.PI]);
  
  const radiusScale = d3.scaleLinear()
    .domain([0, 100])
    .range([0, radius]);
    
  // Draw background circles
  const circles = svg.selectAll(".level")
    .data(d3.range(1, 6))
    .enter()
    .append("circle")
    .attr("class", "level")
    .attr("r", d => radius * d / 5)
    .style("fill", "none")
    .style("stroke", "rgba(255, 255, 255, 0.2)")
    .style("stroke-width", 1);
  
  // Draw axis for each pain point
  const axes = svg.selectAll(".axis")
    .data(data)
    .enter()
    .append("line")
    .attr("class", "axis")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", (d, i) => radius * Math.cos(angleScale(i) - Math.PI/2))
    .attr("y2", (d, i) => radius * Math.sin(angleScale(i) - Math.PI/2))
    .style("stroke", "rgba(255, 255, 255, 0.5)")
    .style("stroke-width", 1);
  
  // Draw the pain point labels
  const labels = svg.selectAll(".label")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "label")
    .attr("x", (d, i) => (radius + 20) * Math.cos(angleScale(i) - Math.PI/2))
    .attr("y", (d, i) => (radius + 20) * Math.sin(angleScale(i) - Math.PI/2))
    .text(d => d.name)
    .style("fill", "#FFFFFF")
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("text-anchor", (d, i) => {
      const angle = angleScale(i);
      if (angle < Math.PI/2 || angle > 3*Math.PI/2) return "start";
      else if (angle === Math.PI/2 || angle === 3*Math.PI/2) return "middle";
      else return "end";
    })
    .style("dominant-baseline", (d, i) => {
      const angle = angleScale(i);
      if (angle === 0 || angle === Math.PI) return "middle";
      else if (angle < Math.PI) return "hanging";
      else return "auto";
    });
  
  // Draw the radar chart
  const line = d3.lineRadial<VisualizationDataPoint>()
    .angle((d, i) => angleScale(i))
    .radius(d => radiusScale(d.value))
    .curve(d3.curveLinearClosed);
  
  // Add radar path with animation
  const path = svg.append("path")
    .datum(data)
    .attr("class", "radar")
    .style("fill", "rgba(52, 152, 219, 0.5)") // More vibrant blue with transparency
    .style("stroke", "#3498db")
    .style("stroke-width", 2.5);
  
  // Animate the path
  const pathLength = path.node()?.getTotalLength() || 0;
  path
    .attr("stroke-dasharray", pathLength + " " + pathLength)
    .attr("stroke-dashoffset", pathLength)
    .attr("d", line)
    .transition()
    .duration(1500)
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0);

  // Add percentage markers on each axis
  svg.selectAll(".percent-marker")
    .data(d3.range(0, 101, 20).slice(1))
    .enter()
    .append("text")
    .attr("class", "percent-marker")
    .attr("x", (d) => radiusScale(d) * Math.cos(0 - Math.PI/2) + 4)
    .attr("y", (d) => radiusScale(d) * Math.sin(0 - Math.PI/2) - 4)
    .text(d => d + "%")
    .style("fill", "rgba(255, 255, 255, 0.7)")
    .style("font-size", "9px");
  
  // Add points at each vertex with animation
  svg.selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", (d, i) => radiusScale(d.value) * Math.cos(angleScale(i) - Math.PI/2))
    .attr("cy", (d, i) => radiusScale(d.value) * Math.sin(angleScale(i) - Math.PI/2))
    .attr("r", 0)
    .style("fill", "#3498db")
    .style("stroke", "#FFFFFF")
    .style("stroke-width", 2)
    .transition()
    .delay((d, i) => 1000 + i * 200)
    .duration(500)
    .attr("r", 6);
  
  // Add value labels at each point
  svg.selectAll(".value-label")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "value-label")
    .attr("x", (d, i) => (radiusScale(d.value) + 10) * Math.cos(angleScale(i) - Math.PI/2))
    .attr("y", (d, i) => (radiusScale(d.value) + 10) * Math.sin(angleScale(i) - Math.PI/2))
    .text(d => d.value + "%")
    .style("fill", "#FFFFFF")
    .style("font-size", "11px")
    .style("font-weight", "bold")
    .style("text-anchor", "middle")
    .style("opacity", 0)
    .transition()
    .delay((d, i) => 1200 + i * 200)
    .duration(500)
    .style("opacity", 1);
  
  // Add interactive tooltips
  svg.selectAll(".dot")
    .append("title")
    .text(d => `${d.name}: ${d.value}%\n${d.description}`);
}

function createMarketEntryHeatmap(containerId: string, data: MarketEntryDataPoint[]) {
  // Define the container and dimensions
  const container = document.getElementById(containerId);
  const containerWidth = container?.clientWidth || 800;
  const containerHeight = container?.clientHeight || 500;
  
  // Define ratings order for color scale domain
  const ratings = ["Low", "Medium", "High", "Very High"];
  
  // Define cyber-themed colors with higher contrast
  const colors = ["#1A1F2C", "#3498db", "#8B5CF6", "#F97316"]; // Dark blue, blue, purple, orange

  // Setup SVG dimensions and margins
  const margin = { top: 60, right: 120, bottom: 150, left: 120 };
  const width = containerWidth - margin.left - margin.right;
  const height = containerHeight - margin.top - margin.bottom;

  // Create SVG
  const svg = d3.select(`#${containerId}`)
    .append("svg")
    .attr("width", containerWidth)
    .attr("height", containerHeight)
    .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
    .attr("style", "width: 100%; height: auto;")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Extract unique markets and criteria
  const markets = Array.from(new Set(data.map(d => d.market)));
  const criteria = Array.from(new Set(data.map(d => d.criterion)));

  // X Scale (Criteria)
  const xScale = d3.scaleBand()
    .domain(criteria)
    .range([0, width])
    .padding(0.05);

  // Y Scale (Markets)
  const yScale = d3.scaleBand()
    .domain(markets)
    .range([0, height])
    .padding(0.05);

  // Color Scale
  const colorScale = d3.scaleOrdinal<string>()
    .domain(ratings)
    .range(colors);

  // Create tooltip
  const tooltip = d3.select(`#${containerId}`)
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "rgba(12, 20, 39, 0.95)")
    .style("border", "2px solid #3498db")
    .style("border-radius", "4px")
    .style("padding", "10px")
    .style("color", "#ffffff")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("font-family", "monospace")
    .style("box-shadow", "0 4px 10px rgba(0, 0, 0, 0.5)")
    .style("z-index", "100");

  // X Axis (Criteria)
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .attr("transform", "translate(-10,5)rotate(-45)")
    .style("text-anchor", "end")
    .style("font-size", "10px")
    .style("fill", "#e0e0e0")
    .style("font-family", "monospace");
  
  // Remove x-axis path and ticks
  svg.selectAll(".domain, .tick line").style("stroke", "rgba(52, 152, 219, 0.3)");

  // Y Axis (Markets)
  svg.append("g")
    .call(d3.axisLeft(yScale))
    .selectAll("text")
    .style("font-size", "11px")
    .style("fill", "#e0e0e0")
    .style("font-family", "monospace");

  // Draw heatmap cells with animation
  svg.selectAll(".cell")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("x", d => xScale(d.criterion) || 0)
    .attr("y", d => yScale(d.market) || 0)
    .attr("width", xScale.bandwidth())
    .attr("height", yScale.bandwidth())
    .attr("fill", "rgba(0, 0, 0, 0)") // Start transparent
    .attr("stroke", "#0c1427")
    .attr("stroke-width", 1)
    .attr("rx", 2) // Rounded corners
    .attr("ry", 2)
    .on("mouseover", function(event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("stroke", "#F97316") // Orange stroke on hover
        .attr("stroke-width", 3);
      
      tooltip.transition()
        .duration(200)
        .style("opacity", 1);
      
      tooltip.html(`
        <div style="border-bottom: 2px solid #3498db; padding-bottom: 4px; margin-bottom: 6px;">
          <span style="color: #3498db; font-weight: bold;">Market: </span>${d.market}
        </div>
        <div>
          <span style="color: #3498db; font-weight: bold;">Criterion: </span>${d.criterion}
        </div>
        <div>
          <span style="color: #3498db; font-weight: bold;">Rating: </span><span style="color: ${colorScale(d.rating)}; font-weight: bold;">${d.rating}</span>
        </div>
      `)
      .style("left", (event.pageX + 15) + "px")
      .style("top", (event.pageY - 28) + "px");
    })
    .on("mousemove", function(event) {
      tooltip
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("stroke", "#0c1427")
        .attr("stroke-width", 1);
      
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    })
    .transition()
    .duration(1000)
    .delay((d, i) => i * 10)
    .attr("fill", d => colorScale(d.rating) as string);

  // Add title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -30)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("fill", "#3498db")
    .style("font-family", "monospace")
    .style("font-weight", "bold")
    .text("Market Entry Strategy Analysis");

  // Add legend with improved contrast
  const legendWidth = 15;
  const legendHeight = 15;
  const legendSpacing = 5;

  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width + 20}, 0)`);

  // Legend title
  legend.append("text")
    .attr("x", 0)
    .attr("y", -10)
    .style("font-size", "12px")
    .style("fill", "#e0e0e0")
    .style("font-family", "monospace")
    .text("Rating");

  // Legend items with more prominent indicators
  ratings.forEach((rating, i) => {
    const legendItem = legend.append("g")
      .attr("transform", `translate(0, ${i * (legendHeight + 10) + 10})`);
    
    legendItem.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .attr("rx", 2)
      .attr("ry", 2)
      .style("fill", colorScale(rating) as string)
      .style("stroke", "#3498db")
      .style("stroke-width", 1);
    
    legendItem.append("text")
      .attr("x", legendWidth + legendSpacing + 5)
      .attr("y", legendHeight / 2)
      .attr("dy", "0.35em")
      .style("font-size", "11px")
      .style("fill", "#e0e0e0")
      .style("font-family", "monospace")
      .text(rating);
  });

  // Add grid effect (cyber theme)
  svg.append("g")
    .attr("class", "grid-lines")
    .selectAll("line.horizontal")
    .data(markets)
    .enter()
    .append("line")
    .attr("class", "horizontal")
    .attr("x1", 0)
    .attr("y1", d => (yScale(d) || 0) + yScale.bandwidth())
    .attr("x2", width)
    .attr("y2", d => (yScale(d) || 0) + yScale.bandwidth())
    .style("stroke", "rgba(52, 152, 219, 0.15)")
    .style("stroke-width", 1);

  svg.append("g")
    .attr("class", "grid-lines")
    .selectAll("line.vertical")
    .data(criteria)
    .enter()
    .append("line")
    .attr("class", "vertical")
    .attr("x1", d => (xScale(d) || 0) + xScale.bandwidth())
    .attr("y1", 0)
    .attr("x2", d => (xScale(d) || 0) + xScale.bandwidth())
    .attr("y2", height)
    .style("stroke", "rgba(52, 152, 219, 0.15)")
    .style("stroke-width", 1);

  // Add cyber effect glows
  const defs = svg.append("defs");
  
  // Create glow filter with stronger effect
  const filter = defs.append("filter")
    .attr("id", "glow")
    .attr("x", "-50%")
    .attr("y", "-50%")
    .attr("width", "200%")
    .attr("height", "200%");
  
  filter.append("feGaussianBlur")
    .attr("stdDeviation", "4")
    .attr("result", "coloredBlur");
  
  const feMerge = filter.append("feMerge");
  feMerge.append("feMergeNode")
    .attr("in", "coloredBlur");
  feMerge.append("feMergeNode")
    .attr("in", "SourceGraphic");

  // Add subtle animations for cyber effect
  function pulseAnimation() {
    svg.selectAll(".cell")
      .transition()
      .duration(2000)
      .style("filter", "url(#glow)")
      .transition()
      .duration(2000)
      .style("filter", "none")
      .on("end", pulseAnimation);
  }
  
  // Start the pulse animation
  setTimeout(pulseAnimation, 2000);
}
