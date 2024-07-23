import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Tooltip from "./Tooltip";

interface DataPoint {
  id: number;
  description: string;
  pca: [x: number, y: number];
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
  // const features: any[] = [
  //   {
  //     id: 1,
  //     description: "zombie-hand-shaped head",
  //     pca: [0.6152710318565369, -0.6961963176727295],
  //   },
  //   {
  //     id: 3,
  //     description: "pickle-shaped head",
  //     pca: [3.1978063583374023, 4.590380668640137],
  //   },
  //   {
  //     id: 4,
  //     description: "triangle-shaped head",
  //     pca: [-2.154123306274414, 1.673564910888672],
  //   },
  //   {
  //     id: 5,
  //     description: "starfish-shaped head",
  //     pca: [1.9827160835266113, -3.2751803398132324],
  //   },
  //   {
  //     id: 6,
  //     description: "cloud-shaped head",
  //     pca: [4.012364387512207, 0.5243813991546631],
  //   },
  //   {
  //     id: 7,
  //     description: "diamond-shaped head",
  //     pca: [-1.5682933330535889, 2.8765721321105957],
  //   },
  //   {
  //     id: 8,
  //     description: "heart-shaped head",
  //     pca: [0.34512317180633545, -2.9871625900268555],
  //   },
  //   {
  //     id: 9,
  //     description: "crescent-moon-shaped head",
  //     pca: [3.7158737182617188, -0.8542673587799072],
  //   },
  //   {
  //     id: 10,
  //     description: "pyramid-shaped head",
  //     pca: [-4.112345218658447, 1.234567642211914],
  //   },
  //   {
  //     id: 11,
  //     description: "flower-shaped head",
  //     pca: [1.6783924102783203, -1.234987497329712],
  //   },
  //   {
  //     id: 12,
  //     description: "hexagon-shaped head",
  //     pca: [2.875916004180908, 1.987325668334961],
  //   },
  //   {
  //     id: 13,
  //     description: "arrow-shaped head",
  //     pca: [-0.4561324110031128, 3.6742091178894043],
  //   },
  // ];

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [tooltip, setTooltip] = useState<{
    pca: [x: number, y: number];
    id: number;
    description: string;
    visible: boolean;
  }>({
    pca: [0, 0],
    id: 0,
    description: "",
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

    const xScale = d3.scaleLinear().domain([-5, 5]).range([0, width]);

    const yScale = d3.scaleLinear().domain([-5, 5]).range([height, 0]);

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
      .enter()
      .append("g")
      .attr("class", "dot-group")
      .attr(
        "transform",
        (d) => `translate(${xScale(d.pca[0])}, ${yScale(d.pca[1])})`
      )
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
          pca: [xScale(d.pca[0]), yScale(d.pca[1])],
          id: d.id,
          description: d.description,
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
          pca: [xScale(d.pca[0]), yScale(d.pca[1])],
          id: d.id,
          description: d.description,
          visible: true,
        });
      })
      .on("mouseout", function (event, d) {
        d3.select(this)
          .select(".padding-circle")
          .attr("stroke", d.id === selectedFeature?.id ? "black" : "none")
          .attr("stroke-width", d.id === selectedFeature?.id ? 1 : 0);
        setTooltip({
          pca: [0, 0],
          id: 0,
          description: "",
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
      .enter()
      .append("text")
      .text((d) => `#${d.id}`)
      .attr("x", (d) => xScale(d.pca[0]))
      .attr("y", (d) => yScale(d.pca[1]) - 8)
      .attr("font-size", "10px")
      .attr("text-anchor", "middle");
  }, [data, height, width, onSelect, selectedFeature, features]);

  return (
    <div className="relative">
      <svg ref={svgRef}></svg>
      {tooltip.visible && (
        <Tooltip
          x={tooltip.pca[0]}
          y={tooltip.pca[1]}
          id={tooltip.id}
          name={tooltip.description}
          visible={tooltip.visible}
        />
      )}
    </div>
  );
};

export default PCAPlot;
