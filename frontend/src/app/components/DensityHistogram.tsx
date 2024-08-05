// import React, { useEffect, useRef } from "react";
// import * as d3 from "d3";

// interface HistogramData {
//   activation: number;
//   count: number;
// }

// interface DensityHistogramProps {
//   data: HistogramData[];
// }

// const DensityHistogram: React.FC<DensityHistogramProps> = ({ data }) => {
//   const svgRef = useRef<SVGSVGElement | null>(null);
//   const width = 500;
//   const height = 160;
//   const margin = { top: 10, right: 10, bottom: 30, left: 40 };

//   useEffect(() => {
//     const svg = d3
//       .select(svgRef.current)
//       .attr("width", width + margin.left + margin.right)
//       .attr("height", height + margin.top + margin.bottom)
//       .style("background", "transparent")
//       .style("overflow", "visible");

//     const chart = svg
//       .append("g")
//       .attr("transform", `translate(${margin.left},${margin.top})`);

//     const xScale = d3
//       .scaleBand()
//       .domain(data.map((d) => d.activation.toString()))
//       .range([0, width])
//       .padding(0.1);

//     const yScale = d3
//       .scaleLinear()
//       .domain([0, d3.max(data, (d) => d.count) as number])
//       .range([height, 0]);

//     const xAxis = d3
//       .axisBottom(xScale)
//       .tickSize(-height)
//       .tickValues(
//         xScale.domain().filter((_, i) => i % Math.ceil(data.length / 8) === 0)
//       );

//     const yAxis = d3
//       .axisLeft(yScale)
//       .ticks(3)
//       .tickSize(-width)
//       .tickFormat(d3.format(".0f"));

//     // Add X grid lines and axis
//     chart
//       .append("g")
//       .attr("class", "grid")
//       .attr("transform", `translate(0, ${height})`)
//       .call(xAxis)
//       .call((g) => g.select(".domain").remove()) // Remove the axis line
//       .call((g) => g.selectAll("line").attr("stroke", "#ccc"))
//       .call((g) => g.selectAll("text").attr("fill", "#6b7280"));

//     // Add Y grid lines and axis
//     chart
//       .append("g")
//       .attr("class", "grid")
//       .call(yAxis)
//       .call((g) => g.select(".domain").remove()) // Remove the axis line
//       .call((g) => g.selectAll("line").attr("stroke", "#ccc"))
//       .call((g) => g.selectAll("text").attr("fill", "#6b7280"));

//     // Add bars
//     chart
//       .selectAll(".bar")
//       .data(data)
//       .enter()
//       .append("rect")
//       .attr("class", "bar")
//       .attr("x", (d) => xScale(d.activation.toString()) as number)
//       .attr("y", (d) => yScale(d.count))
//       .attr("width", xScale.bandwidth())
//       .attr("height", (d) => height - yScale(d.count))
//       .attr("fill", "#eaeaea");
//   }, [data]);

//   return <svg ref={svgRef}></svg>;
// };

// export default DensityHistogram;

// import React, { useEffect, useRef } from "react";
// import * as d3 from "d3";

// interface HistogramData {
//   activation: number;
//   count: number;
// }

// interface DensityHistogramProps {
//   data: HistogramData[];
// }

// const DensityHistogram: React.FC<DensityHistogramProps> = ({ data }) => {
//   const svgRef = useRef<SVGSVGElement | null>(null);
//   const width = 500;
//   const height = 160;
//   const margin = { top: 10, right: 10, bottom: 30, left: 40 };

//   useEffect(() => {
//     const svg = d3
//       .select(svgRef.current)
//       .attr("width", width + margin.left + margin.right)
//       .attr("height", height + margin.top + margin.bottom)
//       .style("background", "transparent")
//       .style("overflow", "visible");

//     const chart = svg
//       .append("g")
//       .attr("transform", `translate(${margin.left},${margin.top})`);

//     const xScale = d3
//       .scaleBand()
//       .domain(data.map((d) => d.activation.toString()))
//       .range([0, width])
//       .padding(0.1);

//     const yScale = d3
//       .scaleLinear()
//       .domain([0, d3.max(data, (d) => d.count) as number])
//       .range([height, 0]);

//     const xAxis = d3
//       .axisBottom(xScale)
//       .tickSize(-height)
//       .tickValues(
//         xScale.domain().filter((_, i) => i % Math.ceil(data.length / 8) === 0)
//       );

//     const yAxis = d3
//       .axisLeft(yScale)
//       .ticks(3)
//       .tickSize(-width)
//       .tickFormat(d3.format(".0f"));

//     // Add X grid lines and axis
//     chart
//       .append("g")
//       .attr("class", "grid")
//       .attr("transform", `translate(0, ${height})`)
//       .call(xAxis)
//       .call((g) => g.select(".domain").remove()) // Remove the axis line
//       .call((g) => g.selectAll("line").attr("stroke", "#ccc"))
//       .call((g) => g.selectAll("text").attr("fill", "#6b7280"));

//     // Add Y grid lines and axis
//     chart
//       .append("g")
//       .attr("class", "grid")
//       .call(yAxis)
//       .call((g) => g.select(".domain").remove()) // Remove the axis line
//       .call((g) => g.selectAll("line").attr("stroke", "#ccc"))
//       .call((g) => g.selectAll("text").attr("fill", "#6b7280"));

//     // Add bars
//     chart
//       .selectAll(".bar")
//       .data(data)
//       .enter()
//       .append("rect")
//       .attr("class", "bar")
//       .attr("x", (d) => xScale(d.activation.toString()) as number)
//       .attr("y", (d) => yScale(d.count))
//       .attr("width", xScale.bandwidth())
//       .attr("height", (d) => height - yScale(d.count))
//       .attr("fill", "#eaeaea");
//   }, [data]);

//   return <svg ref={svgRef}></svg>;
// };

// export default DensityHistogram;

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
  const margin = { top: 10, right: 10, bottom: 30, left: 40 };

  useEffect(() => {
    // Round activation values to the nearest tenth and group counts
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
      .attr("fill", "#eaeaea");
  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default DensityHistogram;
