// import React, { useEffect, useRef, useState } from "react";
// import * as d3 from "d3";
// import Tooltip from "./Tooltip";

// interface DataPoint {
//   id: number;
//   description: string;
//   pca: [x: number, y: number];
// }

// interface PCAPlotProps {
//   data: DataPoint[];
//   onSelect?: (id: number) => void;
//   selectedFeature?: DataPoint;
//   features: any[];
// }

// const PCAPlot: React.FC<PCAPlotProps> = ({
//   data,
//   onSelect,
//   selectedFeature,
//   features,
// }) => {
//   const svgRef = useRef<SVGSVGElement | null>(null);
//   const [tooltip, setTooltip] = useState<{
//     pca: [x: number, y: number];
//     id: number;
//     description: string;
//     visible: boolean;
//   }>({
//     pca: [0, 0],
//     id: 0,
//     description: "",
//     visible: false,
//   });

//   const width = 600;
//   const height = 400;

//   useEffect(() => {
//     const svg = d3
//       .select(svgRef.current)
//       .attr("width", width)
//       .attr("height", height)
//       .style("background", "#f0f0f0")
//       .style("overflow", "visible");

//     svg.selectAll("*").remove();

//     const xScale = d3.scaleLinear().domain([-5, 5]).range([0, width]);

//     const yScale = d3.scaleLinear().domain([-5, 5]).range([height, 0]);

//     const xAxis = d3
//       .axisBottom(xScale)
//       .ticks(10)
//       .tickSize(-height)
//       .tickFormat(() => "");

//     const yAxis = d3
//       .axisLeft(yScale)
//       .ticks(10)
//       .tickSize(-width)
//       .tickFormat(() => "");

//     svg
//       .append("g")
//       .call(xAxis)
//       .attr("transform", `translate(0, ${height})`)
//       .call((g) => g.select(".domain").remove())
//       .selectAll(".tick line")
//       .attr("stroke", "white");

//     svg
//       .append("g")
//       .call(yAxis)
//       .call((g) => g.select(".domain").remove())
//       .selectAll(".tick line")
//       .attr("stroke", "white");

//     const dotGroups = svg
//       .selectAll(".dot-group")
//       .data(features)
//       .enter()
//       .append("g")
//       .attr("class", "dot-group")
//       .attr(
//         "transform",
//         (d) => `translate(${xScale(d.pca[0])}, ${yScale(d.pca[1])})`
//       )
//       .style("cursor", "pointer");

//     // Add padding circle with border
//     dotGroups
//       .append("circle")
//       .attr("class", "padding-circle")
//       .attr("r", 6)
//       .attr("fill", "transparent")
//       .attr("opacity", 0.5)
//       .attr("stroke", (d) => (d.id === selectedFeature?.id ? "black" : "none"))
//       .attr("stroke-width", (d) => (d.id === selectedFeature?.id ? 1 : 0));

//     // Add main dot
//     dotGroups
//       .append("circle")
//       .attr("class", "main-dot")
//       .attr("r", 3)
//       .attr("fill", "brown");

//     dotGroups
//       .on("mouseover", function (event, d) {
//         d3.select(this)
//           .select(".padding-circle")
//           .attr("stroke", "black")
//           .attr("stroke-width", 1);
//         setTooltip({
//           pca: [xScale(d.pca[0]), yScale(d.pca[1])],
//           id: d.id,
//           description: d.description,
//           visible: true,
//         });
//         if (onSelect) {
//           onSelect(d.id);
//         }
//       })
//       .on("mousemove", (event, d) => {
//         const [x, y] = d3.pointer(event);
//         if (onSelect) {
//           onSelect(d.id);
//         }
//         setTooltip({
//           pca: [xScale(d.pca[0]), yScale(d.pca[1])],
//           id: d.id,
//           description: d.description,
//           visible: true,
//         });
//       })
//       .on("mouseout", function (event, d) {
//         d3.select(this)
//           .select(".padding-circle")
//           .attr("stroke", d.id === selectedFeature?.id ? "black" : "none")
//           .attr("stroke-width", d.id === selectedFeature?.id ? 1 : 0);
//         setTooltip({
//           pca: [0, 0],
//           id: 0,
//           description: "",
//           visible: false,
//         });
//       })
//       .on("click", (event, d) => {
//         if (onSelect) {
//           onSelect(d.id);
//         }
//       });

//     svg
//       .selectAll(".label")
//       .data(features)
//       .enter()
//       .append("text")
//       .text((d) => `#${d.id}`)
//       .attr("x", (d) => xScale(d.pca[0]))
//       .attr("y", (d) => yScale(d.pca[1]) - 8)
//       .attr("font-size", "10px")
//       .attr("text-anchor", "middle");
//   }, [data, height, width, onSelect, selectedFeature, features]);

//   return (
//     <div className="relative">
//       <svg ref={svgRef}></svg>
//       {tooltip.visible && (
//         <Tooltip
//           x={tooltip.pca[0]}
//           y={tooltip.pca[1]}
//           id={tooltip.id}
//           name={tooltip.description}
//           visible={tooltip.visible}
//         />
//       )}
//     </div>
//   );
// };

// export default PCAPlot;

// import React, { useEffect, useRef } from "react";
// import * as d3 from "d3";

// interface DataPoint {
//   id: number;
//   description: string;
//   pca: [x: number, y: number, z?: number];
// }

// interface PCAPlotProps {
//   dat_a: DataPoint[];
//   onSelect?: (id: number) => void;
//   selectedFeature?: DataPoint;
//   features: any[];
// }

// const PCAPlot: React.FC<PCAPlotProps> = ({
//   dat_a,
//   onSelect,
//   selectedFeature,
//   features,
// }) => {
//   const svgRef = useRef<SVGSVGElement | null>(null);

//   let width = 800;
//   let height = 600;
//   const k = height / width;

//   // const data = dat_a.map((d) => ({ ...d, pca: [...d.pca, 0] })); // Append z value of 0

//   const data = Array.from({ length: 300 }, (_, i) => {
//     const random = d3.randomNormal(0, 0.2);
//     const sqrt3 = Math.sqrt(3);
//     return i < 300
//       ? [random() + sqrt3, random() + 1, 0, random()]
//       : i < 600
//       ? [random() - sqrt3, random() + 1, 1, random()]
//       : [random(), random() - 1, 2, random()];
//   });

//   useEffect(() => {
//     const x = d3.scaleLinear().domain([-4.5, 4.5]).range([0, width]);
//     const y = d3
//       .scaleLinear()
//       .domain([-4.5 * k, 4.5 * k])
//       .range([height, 0]);

//     const svg = d3
//       .select(svgRef.current)
//       .attr("viewBox", `0 0 ${width} ${height}`);

//     const gGrid = svg.append("g");
//     const gDot = svg
//       .append("g")
//       .attr("fill", "none")
//       .attr("stroke-linecap", "round");
//     const gx = svg.append("g");
//     const gy = svg.append("g");

//     gDot
//       .selectAll("circle")
//       .data(data)
//       .join("circle")
//       .attr("cx", (d) => x(d[0]))
//       .attr("cy", (d) => y(d[1]))
//       .attr("r", 3)
//       .attr("fill", "brown")
//       .attr("stroke", "none")
//       .on("mouseover", function (event, d) {
//         d3.select(this).attr("r", 3);
//         gDot
//           .append("circle")
//           .attr("cx", x(d[0]))
//           .attr("cy", y(d[1]))
//           .attr("r", 5)
//           .attr("fill", "none")
//           .attr("stroke", "black")
//           .attr("stroke-width", 1)
//           .attr("class", "hover-dot");
//       })
//       .on("mouseout", function (event, d) {
//         d3.select(this).attr("stroke", "none");
//         gDot.selectAll(".hover-dot").remove();
//       })
//       .on("click", (event, d) => {
//         if (onSelect) {
//           onSelect(d[3]);
//         }
//       });

//     gx.call(xAxis, x);
//     gy.call(yAxis, y);
//     gGrid.call(grid, x, y);

//     function zoomed({ transform }: any) {
//       const zx = transform.rescaleX(x).interpolate(d3.interpolateRound);
//       const zy = transform.rescaleY(y).interpolate(d3.interpolateRound);
//       gDot.attr("transform", transform).attr("stroke-width", 5 / transform.k);
//       gx.call(xAxis, zx);
//       gy.call(yAxis, zy);
//       gGrid.call(grid, zx, zy);
//     }

//     const zoom = d3.zoom().scaleExtent([0.5, 32]).on("zoom", zoomed);
//     svg.call(zoom).call(zoom.transform, d3.zoomIdentity);

//     return () => {
//       svg.selectAll("*").remove();
//     };
//   }, [width, height, selectedFeature]);

//   const xAxis = (g: any, x: any) =>
//     g
//       .attr("transform", `translate(0,${height})`)
//       .call(d3.axisTop(x).ticks(12))
//       .call((g: any) => g.select(".domain").attr("display", "none"));

//   const yAxis = (g: any, y: any) =>
//     g
//       .call(d3.axisRight(y).ticks(12 * k))
//       .call((g: any) => g.select(".domain").attr("display", "none"));

//   const grid = (g: any, x: any, y: any) =>
//     g
//       .attr("stroke", "currentColor")
//       .attr("stroke-opacity", 0.1)
//       .call((g: any) =>
//         g
//           .selectAll(".x")
//           .data(x.ticks(12))
//           .join(
//             (enter: any) =>
//               enter.append("line").attr("class", "x").attr("y2", height),
//             (update: any) => update,
//             (exit: any) => exit.remove()
//           )
//           .attr("x1", (d: any) => 0.5 + x(d))
//           .attr("x2", (d: any) => 0.5 + x(d))
//       )
//       .call((g: any) =>
//         g
//           .selectAll(".y")
//           .data(y.ticks(12 * k))
//           .join(
//             (enter: any) =>
//               enter.append("line").attr("class", "y").attr("x2", width),
//             (update: any) => update,
//             (exit: any) => exit.remove()
//           )
//           .attr("y1", (d: any) => 0.5 + y(d))
//           .attr("y2", (d: any) => 0.5 + y(d))
//       );

//   return (
//     <div className="relative flex justify-center items-center h-full">
//       <svg ref={svgRef} className="w-full h-full"></svg>
//     </div>
//   );
// };

// export default PCAPlot;

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface DataPoint {
  id: number;
  description: string;
  pca: [x: number, y: number, z?: number];
}

interface PCAPlotProps {
  dat_a: DataPoint[];
  onSelect?: (id: number) => void;
  selectedFeature?: DataPoint;
  features: any[];
}

const PCAPlot: React.FC<PCAPlotProps> = ({
  dat_a,
  onSelect,
  selectedFeature,
  features,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const width = 600;
  const height = 400;
  const k = height / width;

  // const data = generateRandomDataPoints(3);
  // const data = [
  //   {
  //     id: 0,
  //     description: "Point 0",
  //     pca: [1.755430860225565, 1.193346928684992, 0],
  //   },
  //   {
  //     id: 1,
  //     description: "Point 1",
  //     pca: [-2.0290714871552975, 1.01988306439322, 0],
  //   },
  //   {
  //     id: 2,
  //     description: "Point 2",
  //     pca: [-0.057147088422618564, -1.0861874468726493, 0],
  //   },
  // ];
  // const data = dat_a.map((d) => ({ ...d, pca: [...d.pca, 0] })); // Append z value of 0
  const data = [
    {
      id: 1,
      description: "zombie-hand-shaped head",
      pca: [0.6152710318565369, -0.6961963176727295, 0],
    },
    {
      id: 3,
      description: "pickle-shaped head",
      pca: [3.1978063583374023, 4.590380668640137, 0],
    },
  ];
  console.log(data);

  useEffect(() => {
    const x = d3.scaleLinear().domain([-6, 6]).range([0, width]);
    const y = d3
      .scaleLinear()
      .domain([-6 * k, 6 * k])
      .range([height, 0]);

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`);

    const gGrid = svg.append("g");
    const gDot = svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke-linecap", "round");
    const gx = svg.append("g");
    const gy = svg.append("g");

    gDot
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", (d) => x(d.pca[0]))
      .attr("cy", (d) => y(d.pca[1]))
      .attr("r", 3)
      .attr("fill", "brown")
      .attr("stroke", "none")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("r", 3);
        gDot
          .append("circle")
          .attr("cx", x(d.pca[0]))
          .attr("cy", y(d.pca[1]))
          .attr("r", 5)
          .attr("fill", "none")
          .attr("stroke", "black")
          .attr("stroke-width", 1)
          .attr("class", "hover-dot");
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("stroke", "none");
        gDot.selectAll(".hover-dot").remove();
      })
      .on("click", (event, d) => {
        if (onSelect) {
          onSelect(d.id);
        }
      });

    gx.call(xAxis, x);
    gy.call(yAxis, y);
    gGrid.call(grid, x, y);

    function zoomed({ transform }: any) {
      const zx = transform.rescaleX(x).interpolate(d3.interpolateRound);
      const zy = transform.rescaleY(y).interpolate(d3.interpolateRound);
      gDot.attr("transform", transform).attr("stroke-width", 5 / transform.k);
      gx.call(xAxis, zx);
      gy.call(yAxis, zy);
      gGrid.call(grid, zx, zy);
    }

    const zoom = d3.zoom().scaleExtent([0.5, 32]).on("zoom", zoomed);
    svg.call(zoom).call(zoom.transform, d3.zoomIdentity);

    return () => {
      svg.selectAll("*").remove();
    };
  }, [width, height, selectedFeature]);

  const xAxis = (g: any, x: any) =>
    g
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisTop(x).ticks(12))
      .call((g: any) => g.select(".domain").attr("display", "none"));

  const yAxis = (g: any, y: any) =>
    g
      .call(d3.axisRight(y).ticks(12 * k))
      .call((g: any) => g.select(".domain").attr("display", "none"));

  const grid = (g: any, x: any, y: any) =>
    g
      .attr("stroke", "currentColor")
      .attr("stroke-opacity", 0.1)
      .call((g: any) =>
        g
          .selectAll(".x")
          .data(x.ticks(12))
          .join(
            (enter: any) =>
              enter.append("line").attr("class", "x").attr("y2", height),
            (update: any) => update,
            (exit: any) => exit.remove()
          )
          .attr("x1", (d: any) => 0.5 + x(d))
          .attr("x2", (d: any) => 0.5 + x(d))
      )
      .call((g: any) =>
        g
          .selectAll(".y")
          .data(y.ticks(12 * k))
          .join(
            (enter: any) =>
              enter.append("line").attr("class", "y").attr("x2", width),
            (update: any) => update,
            (exit: any) => exit.remove()
          )
          .attr("y1", (d: any) => 0.5 + y(d))
          .attr("y2", (d: any) => 0.5 + y(d))
      );

  return (
    <div className="relative flex justify-center items-center h-full">
      <svg ref={svgRef} className="w-[600px] h-[400px]"></svg>
    </div>
  );
};

function generateRandomDataPoints(numPoints: number): DataPoint[] {
  const random = d3.randomNormal(0, 0.2);
  const sqrt3 = Math.sqrt(3);

  return Array.from({ length: numPoints }, (_, i) => ({
    id: i,
    description: `Point ${i}`,
    pca:
      i < numPoints / 3
        ? [random() + sqrt3, random() + 1, 0]
        : i < (2 * numPoints) / 3
        ? [random() - sqrt3, random() + 1, 0]
        : [random(), random() - 1, 0],
  }));
}

export default PCAPlot;
