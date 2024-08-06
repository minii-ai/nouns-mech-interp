import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Tooltip from "./Tooltip";
import { ResponsiveScatterPlot } from "@nivo/scatterplot";

interface PCAPlotProps {
  onSelect?: (id: number) => void;
  features: any[];
}

const PCAPlot: React.FC<PCAPlotProps> = ({ onSelect, features }) => {
  const featuresData = [
    {
      id: "Features",
      data: features.map((feature) => {
        const x = feature.pca[0];
        const y = feature.pca[1];

        return {
          x,
          y,
          data: feature,
        };
      }),
    },
  ];

  return (
    <div className="h-full w-1/2">
      <ResponsiveScatterPlot
        data={featuresData}
        margin={{ top: 48, right: 48, bottom: 48, left: 48 }}
        xScale={{ type: "linear", min: "auto", max: "auto" }}
        xFormat=">-.2f"
        yScale={{ type: "linear", min: "auto", max: "auto" }}
        yFormat=">-.2f"
        colors={{ scheme: "category10" }}
        blendMode="multiply"
        enableGridX={false}
        enableGridY={false}
        gridXValues={[]}
        gridYValues={[]}
        axisTop={null}
        axisRight={null}
        axisBottom={null}
        axisLeft={null}
        onClick={(node) => onSelect(node.data.data.id)}
        tooltip={({ node }) => {
          return (
            <div className="bg-white p-2 rounded drop-shadow-lg flex flex-col">
              <span className="text-black text-sm">
                #{node?.data?.data?.id}
              </span>
              <span className="text-black text-sm">
                {node?.data?.data?.description}
              </span>
            </div>
          );
        }}
      />
    </div>
  );
};

export default PCAPlot;
