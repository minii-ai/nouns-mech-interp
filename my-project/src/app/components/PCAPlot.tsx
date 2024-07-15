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
}

const PCAPlot: React.FC<PCAPlotProps> = ({ data, onSelect }) => {
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

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.x) as number])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.y) as number])
      .range([height, 0]);

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

    svg
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 3)
      .attr("fill", "brown")
      .style("cursor", "pointer")
      .on("mouseover", (event, d) => {
        setTooltip({
          x: xScale(d.x),
          y: yScale(d.y),
          id: d.id,
          name: d.name,
          visible: true,
        });
      })
      .on("mousemove", (event, d) => {
        const [x, y] = d3.pointer(event);
        setTooltip({
          x: xScale(d.x),
          y: yScale(d.y),
          id: d.id,
          name: d.name,
          visible: true,
        });
      })
      .on("mouseout", () => {
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
      .data(data)
      .enter()
      .append("text")
      .text((d) => `#${d.id}`)
      .attr("x", (d) => xScale(d.x))
      .attr("y", (d) => yScale(d.y) - 2.5)
      .attr("font-size", "10px")
      .attr("text-anchor", "middle");
  }, [data, height, width, onSelect]);

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
