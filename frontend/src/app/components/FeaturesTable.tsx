import { useEffect, useRef, useState } from "react";

interface DataPoint {
  id: number;
  name: string;
  x: number;
  y: number;
}

interface FeaturesTableProps {
  features: any[];
  selectedFeatureId?: number | null;
  onClick?: any;
}

const FeaturesTable: React.FC<FeaturesTableProps> = ({
  features,
  selectedFeatureId,
  onClick,
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
    <div className="h-full w-1/2 pl-2">
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
              {filteredFeatures.map((feature: DataPoint) => (
                <tr
                  key={feature.id}
                  ref={(el) => {
                    featureRefs.current[feature.id] = el;
                  }}
                  onClick={() => onClick(feature.id)}
                  onMouseEnter={() => setHoveredId(feature.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`hover:bg-[var(--accent-color)] transition-colors cursor-pointer duration-100 w-full flex ${
                    hoveredId === feature.id || selectedFeatureId === feature.id
                      ? "bg-[var(--accent-color)]"
                      : "bg-white"
                  }`}
                >
                  <td className="py-2 whitespace-nowrap text-sm text-gray-500 flex flex-row items-center w-[64px]">
                    <div className="bg-[var(--primary-color)] px-1.5 rounded-lg">
                      <span className="text-white text-xs"># {feature.id}</span>
                    </div>
                  </td>
                  <td className="py-2 whitespace-nowrap text-sm w-full">
                    <div className="flex flex-row items-center justify-between w-full">
                      <div>{feature.description}</div>
                      {(hoveredId === feature.id ||
                        selectedFeatureId === feature.id) && (
                        <button
                          onClick={() => onClick(feature.id)}
                          className="transition-opacity duration-200 ml-4 underline text-[var(--primary-color)] pr-2"
                        >
                          More Info
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FeaturesTable;
