import React, { useCallback, useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface HistogramData {
  activation: number;
  count: number;
}

interface DensityHistogramProps {
  data: HistogramData[];
}

const margin = { top: 0, right: 0, bottom: 16, left: 16 };
const DensityHistogram: React.FC<DensityHistogramProps> = ({
  data,
  height = 100,
}) => {
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height });

  const updateDimensions = useCallback(() => {
    const width = svgRef.current
      ? svgRef.current.clientWidth - margin.left - margin.right
      : 500;
    setDimensions({ width, height: height });
  }, [height]);

  useEffect(() => {
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, [updateDimensions]);

  useEffect(() => {
    const { width, height } = dimensions;

    const roundedData = data.reduce((acc, d) => {
      const roundedActivation = Math.round(d.activation * 10) / 10;
      const existing = acc.find(
        (item) => item.activation === roundedActivation
      );
      if (existing) {
        existing.count += d.count;
      } else {
        acc.push({ activation: roundedActivation, count: d.count });
      }
      return acc;
    }, [] as { activation: number; count: number }[]);

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("background", "transparent")
      .style("overflow", "visible");

    svg.selectAll("*").remove(); // Clear previous content

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleBand()
      .domain(roundedData.map((d) => d.activation.toString()))
      .range([0, width])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(roundedData, (d) => d.count) as number])
      .range([height, 0]);

    const xAxis = d3
      .axisBottom(xScale)
      .tickSize(-height)
      .tickValues(
        xScale
          .domain()
          .filter((_, i) => i % Math.ceil(roundedData.length / 8) === 0)
      );

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(3)
      .tickSize(-width)
      .tickFormat(d3.format(".0f"));

    // Add X grid lines and axis
    chart
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis)
      .call((g) => g.select(".domain").remove()) // Remove the axis line
      .call((g) => g.selectAll("line").attr("stroke", "#ccc"))
      .call((g) => g.selectAll("text").attr("fill", "#6b7280"));

    // Add Y grid lines and axis
    chart
      .append("g")
      .attr("class", "grid")
      .call(yAxis)
      .call((g) => g.select(".domain").remove()) // Remove the axis line
      .call((g) => g.selectAll("line").attr("stroke", "#ccc"))
      .call((g) => g.selectAll("text").attr("fill", "#6b7280"));

    // Add bars
    chart
      .selectAll(".bar")
      .data(roundedData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.activation.toString()) as number)
      .attr("y", (d) => yScale(d.count))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => height - yScale(d.count))
      .attr("fill", "#3c82f6"); // Changed fill color to blue
  }, [data, dimensions]);

  return <svg ref={svgRef} style={{ width: "100%" }}></svg>;
};

export default DensityHistogram;
