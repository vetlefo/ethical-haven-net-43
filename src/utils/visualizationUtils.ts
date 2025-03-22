
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
  const levels = 5;
  const circles = svg.selectAll(".level")
    .data(d3.range(1, levels + 1).reverse())
    .enter()
    .append("circle")
    .attr("class", "level")
    .attr("r", d => radius * d / levels)
    .style("fill", "none")
    .style("stroke", "rgba(255, 255, 255, 0.1)")
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
    .style("stroke", "rgba(255, 255, 255, 0.3)")
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
  
  // Add radar path
  svg.append("path")
    .datum(data)
    .attr("class", "radar")
    .attr("d", line)
    .style("fill", `${colorPrimary}40`) // With transparency
    .style("stroke", colorPrimary)
    .style("stroke-width", 2)
    .style("filter", "url(#glow)"); // Add glow effect
  
  // Add points at each vertex
  svg.selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", (d, i) => radiusScale(d.value) * Math.cos(angleScale(i) - Math.PI/2))
    .attr("cy", (d, i) => radiusScale(d.value) * Math.sin(angleScale(i) - Math.PI/2))
    .attr("r", 5)
    .style("fill", colorPrimary)
    .style("stroke", "#FFFFFF")
    .style("stroke-width", 2);
  
  // Add glow filter
  const defs = svg.append("defs");
  const filter = defs.append("filter")
    .attr("id", "glow");
  
  filter.append("feGaussianBlur")
    .attr("stdDeviation", "2.5")
    .attr("result", "coloredBlur");
  
  const feMerge = filter.append("feMerge");
  feMerge.append("feMergeNode")
    .attr("in", "coloredBlur");
  feMerge.append("feMergeNode")
    .attr("in", "SourceGraphic");
  
  // Add interactive tooltips
  svg.selectAll(".dot")
    .append("title")
    .text(d => `${d.name}: ${d.value}%\n${d.description}`);
}
