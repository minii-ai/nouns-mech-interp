import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface HistogramData {
  activation: number;
  count: number;
}

interface DensityHistogramProps {
  data: HistogramData[];
}

const DensityHistogram: React.FC<DensityHistogramProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const width = 500;
  const height = 160;

  useEffect(() => {
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background", "#f0f0f0")
      .style("overflow", "visible");

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.activation.toString()))
      .range([0, width])
      .padding(0); // Remove padding to eliminate the space between the y-axis and the first tick

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.count) as number])
      .range([height, 0]);

    const xAxis = d3
      .axisBottom(xScale)
      .ticks(8) // Set the number of ticks for the x-axis
      .tickSize(-height) // Extend ticks as grid lines
      .tickFormat((d) => d); // Show tick labels

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(4) // Specify number of ticks for the y-axis
      .tickSize(-width) // Extend ticks as grid lines
      .tickFormat(d3.format(".0f")); // Format the ticks as integers

    // Add X grid lines
    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis)
      .selectAll(".tick line")
      .attr("stroke", "#ccc");

    // Add Y grid lines
    svg
      .append("g")
      .attr("class", "grid")
      .call(yAxis)
      .selectAll(".tick line")
      .attr("stroke", "#ccc");

    // Remove the axis lines
    svg.selectAll(".domain").remove();

    // Add bars
    svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr(
        "x",
        (d) =>
          (xScale(d.activation.toString()) as number) + xScale.bandwidth() / 2
      )
      .attr("y", (d) => yScale(d.count))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => height - yScale(d.count))
      .attr("fill", "brown");

    // Add gray text labels for the X axis
    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .selectAll("text")
      .attr("fill", "gray");

    // Add gray text labels for the Y axis
    svg
      .append("g")
      .call(d3.axisLeft(yScale).ticks(4).tickSize(0))
      .selectAll("text")
      .attr("fill", "gray");
  }, [data, height, width]);

  return <svg ref={svgRef}></svg>;
};

export default DensityHistogram;
