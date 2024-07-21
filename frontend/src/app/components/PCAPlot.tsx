import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Tooltip from "./Tooltip";

interface DataPoint {
  id: number;
  name: string;
  x: number;
  y: number;
}

interface PCAPlotProps {
  data: DataPoint[];
  onSelect?: (id: number) => void;
  selectedFeature?: DataPoint;
  features: any[];
}

const PCAPlot: React.FC<PCAPlotProps> = ({
  data,
  onSelect,
  selectedFeature,
  features,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    id: number;
    name: string;
    visible: boolean;
  }>({
    x: 0,
    y: 0,
    id: 0,
    name: "",
    visible: false,
  });

  const width = 600;
  const height = 400;

  useEffect(() => {
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background", "#f0f0f0")
      .style("overflow", "visible");

    svg.selectAll("*").remove();

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(features, (f) => f.pca[0]) as number])
      // .domain([0, d3.max(data, (d) => d.x) as number])
      // .range([0, width]);
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(features, (f) => f.pca[1]) as number])
      // .domain([0, d3.max(data, (d) => d.y) as number])
      .range([height, -5]);

    const xAxis = d3
      .axisBottom(xScale)
      .ticks(10)
      .tickSize(-height)
      .tickFormat(() => "");

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(10)
      .tickSize(-width)
      .tickFormat(() => "");

    svg
      .append("g")
      .call(xAxis)
      .attr("transform", `translate(0, ${height})`)
      .call((g) => g.select(".domain").remove())
      .selectAll(".tick line")
      .attr("stroke", "white");

    svg
      .append("g")
      .call(yAxis)
      .call((g) => g.select(".domain").remove())
      .selectAll(".tick line")
      .attr("stroke", "white");

    const dotGroups = svg
      .selectAll(".dot-group")
      .data(features)
      // .data(data)
      .enter()
      .append("g")
      .attr("class", "dot-group")
      .attr(
        "transform",
        (d) => `translate(${xScale(d.pca[0])}, ${yScale(d.pca[1])})`
      )
      // .attr("transform", (d) => `translate(${xScale(d.x)}, ${yScale(d.y)})`)
      .style("cursor", "pointer");

    // Add padding circle with border
    dotGroups
      .append("circle")
      .attr("class", "padding-circle")
      .attr("r", 6)
      .attr("fill", "transparent")
      .attr("opacity", 0.5)
      .attr("stroke", (d) => (d.id === selectedFeature?.id ? "black" : "none"))
      .attr("stroke-width", (d) => (d.id === selectedFeature?.id ? 1 : 0));

    // Add main dot
    dotGroups
      .append("circle")
      .attr("class", "main-dot")
      .attr("r", 3)
      .attr("fill", "brown");

    dotGroups
      .on("mouseover", function (event, d) {
        d3.select(this)
          .select(".padding-circle")
          .attr("stroke", "black")
          .attr("stroke-width", 1);
        setTooltip({
          x: xScale(d.pca[0]),
          y: yScale(d.pca[1]),
          // x: xScale(d.x),
          // y: yScale(d.y),
          id: d.id,
          name: d.name,
          // name: d.name,
          visible: true,
        });
        if (onSelect) {
          onSelect(d.id);
        }
      })
      .on("mousemove", (event, d) => {
        const [x, y] = d3.pointer(event);
        if (onSelect) {
          onSelect(d.id);
        }
        setTooltip({
          x: xScale(d.pca[0]),
          y: xScale(d.pca[1]),
          // x: xScale(d.x),
          // y: yScale(d.y),
          id: d.id,
          name: d.name,
          visible: true,
        });
      })
      .on("mouseout", function (event, d) {
        d3.select(this)
          .select(".padding-circle")
          .attr("stroke", d.id === selectedFeature?.id ? "black" : "none")
          .attr("stroke-width", d.id === selectedFeature?.id ? 1 : 0);
        setTooltip({
          x: 0,
          y: 0,
          id: 0,
          name: "",
          visible: false,
        });
      })
      .on("click", (event, d) => {
        if (onSelect) {
          onSelect(d.id);
        }
      });

    svg
      .selectAll(".label")
      .data(features)
      // .data(data)
      .enter()
      .append("text")
      .text((d) => `#${d.id}`)
      .attr("x", (d) => xScale(d.pca[0]))
      // .attr("x", (d) => xScale(d.x))
      .attr("y", (d) => yScale(d.pca[1]) - 8)
      // .attr("y", (d) => yScale(d.y) - 8)
      .attr("font-size", "10px")
      .attr("text-anchor", "middle");
  }, [data, height, width, onSelect, selectedFeature, features]);

  return (
    <div className="relative">
      <svg ref={svgRef}></svg>
      {tooltip.visible && (
        <Tooltip
          x={tooltip.x}
          y={tooltip.y}
          id={tooltip.id}
          name={tooltip.name}
          visible={tooltip.visible}
        />
      )}
    </div>
  );
};

export default PCAPlot;
