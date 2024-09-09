import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";

interface PCAPlotProps {
  features: any[];
  hoveredFeatureId: number | null;
  onHoverFeature: (id: number | null) => void;
}

const PCAPlot: React.FC<PCAPlotProps> = ({
  features,
  hoveredFeatureId,
  onHoverFeature,
}) => {
  return (
    <div
      className="h-full w-[calc(100% - 600px)]"
      style={{ width: "calc(100% - 500px)" }}
    >
      <Canvas
        camera={{
          zoom: 1,
          position: [5, 6, 10],
        }}
      >
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
          target={[5, 6, 0]}
        />
        <ambientLight intensity={0.1} />
        <directionalLight color="red" position={[0, 0, 5]} />

        <group>
          {features
            .sort((a, b) => a.id - b.id)
            .map((feature) => {
              const x = feature.umap[0];
              const y = feature.umap[1];
              const isHovered = hoveredFeatureId === feature.id;

              return (
                <group
                  key={feature.id}
                  position={[x, y, 0]}
                  onPointerOver={(e) => onHoverFeature(feature.id)}
                  onPointerLeave={() => onHoverFeature(null)}
                >
                  <mesh>
                    <sphereGeometry args={[isHovered ? 0.075 : 0.05, 32, 32]} />
                    <meshBasicMaterial
                      color="#3c82f6"
                      opacity={0.9}
                      transparent
                    />

                    {hoveredFeatureId === feature.id && (
                      <Html className="h-max w-max p-1 absolute top-4 left-4 bg-neutral-950 rounded text-white shadow-md">
                        <p className="text-sm">{feature.id}</p>
                        <p className="text-sm">
                          {feature.description || "Description of Feature"}
                        </p>
                      </Html>
                    )}
                  </mesh>
                </group>
              );
            })}
        </group>
      </Canvas>
    </div>
  );
};

export default PCAPlot;
