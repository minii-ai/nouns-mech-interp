import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Tooltip from "./Tooltip";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";

interface PCAPlotProps {
  onSelect?: (id: number) => void;
  features: any[];
}

const PCAPlot: React.FC<PCAPlotProps> = ({ onSelect, features }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  return (
    <div className="h-full w-1/2">
      <Canvas camera={{ zoom: 1, position: [0, 0, 10] }}>
        <OrbitControls
          enableRotate={false}
          enableZoom={true}
          enablePan={true}
          mouseButtons={{ LEFT: THREE.MOUSE.PAN }}
          touches={{
            ONE: THREE.TOUCH.ROTATE,
          }}
          panSpeed={1.5}
          minZoom={1}
          maxZoom={1}
        />
        <ambientLight intensity={0.1} />
        <directionalLight color="red" position={[0, 0, 5]} />

        <group>
          {features.map((feature) => {
            const x = feature.pca[0];
            const y = feature.pca[1];

            return (
              <mesh
                key={feature.id}
                position={[x, y, 0]}
                onPointerOver={(e) => {
                  console.log("over");
                  setHoveredPoint(feature);
                }}
                onPointerLeave={() => setHoveredPoint(null)}
              >
                <sphereGeometry args={[0.05, 32, 32]} />
                <meshBasicMaterial color="#3c82f6" opacity={0.9} transparent />

                {hoveredPoint?.id === feature.id && (
                  <Html>
                    <div
                      className="w-24 h-12"
                      style={{
                        color: "white",
                        background: "black",
                        padding: "2px",

                        transform: "translate(100%, 100%)",
                      }}
                    >
                      {/* {hoveredPoint.description} */}
                      yo
                    </div>
                  </Html>
                )}
              </mesh>
            );
          })}
        </group>
      </Canvas>

      {/* <ResponsiveScatterPlot
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
      /> */}
    </div>
  );
};

export default PCAPlot;
