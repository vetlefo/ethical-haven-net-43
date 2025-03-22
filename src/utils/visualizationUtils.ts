
import * as d3 from 'd3';
import { VisualizationData, VisualizationDataPoint } from './visualizationData';

export const createVisualization = (
  containerId: string, 
  visualizationType: string, 
  data: VisualizationDataPoint[]
) => {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Clear existing content
  container.innerHTML = '';
  
  if (visualizationType === 'radar') {
    createPainPointsRadarChart(containerId, data);
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
