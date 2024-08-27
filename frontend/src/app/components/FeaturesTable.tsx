import { useEffect, useRef, useState } from "react";
import { FeatureRow } from "./FeatureRow";

interface DataPoint {
  id: number;
  name: string;
  x: number;
  y: number;
}

interface FeaturesTableProps {
  features: any[];
  selectedFeatureId?: number | null;
  onSelectFeature: (id: number) => any;
}

const FeaturesTable: React.FC<FeaturesTableProps> = ({
  features,
  selectedFeatureId,
  onSelectFeature,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const featureRefs = useRef<{ [key: number]: HTMLTableRowElement | null }>({});

  const filteredFeatures = features.filter((feature: any) =>
    feature.description?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  useEffect(() => {
    if (selectedFeatureId) {
      const ref = featureRefs.current[selectedFeatureId];

      if (ref) {
        ref.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [selectedFeatureId]);

  return (
    <div className="h-full w-[600px] pl-2 shadow-xl border-l border-l-gray-200">
      <div className="h-full w-full flex flex-col">
        <input
          type="text"
          placeholder="Search features..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className=" bg-white pr-5 py-2.5 text-sm border-none focus:outline-none w-full"
        />
        <div className="overflow-y-scroll w-full overflow-x-hidden">
          <table className="inline-block w-full">
            <tbody className="bg-white divide-y border-none w-full inline-block">
              {filteredFeatures.map((feature: DataPoint) => {
                const isHovered = hoveredId === feature.id;
                const isSelected = selectedFeatureId === feature.id;

                return (
                  <FeatureRow
                    key={feature.id}
                    feature={feature}
                    isSelected={isSelected}
                    isHovered={isHovered}
                    onClick={() => {
                      if (isSelected) {
                        onSelectFeature(null);
                      } else {
                        onSelectFeature(feature.id);
                      }
                    }}
                    onMouseEnter={() => setHoveredId(feature.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    rowRef={(el) => {
                      featureRefs.current[feature.id] = el;
                    }}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FeaturesTable;
