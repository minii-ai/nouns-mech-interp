import { useEffect, useRef, useState } from "react";

interface DataPoint {
  id: number;
  name: string;
  x: number;
  y: number;
}

interface FeaturesTableProps {
  // features: DataPoint[];
  features: any[];
  selectedFeature?: DataPoint;
  onClick?: any;
}

const FeaturesTable: React.FC<FeaturesTableProps> = ({
  features,
  selectedFeature,
  onClick,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const featureRefs = useRef<{ [key: number]: HTMLTableRowElement | null }>({});

  const filteredFeatures = features.filter((feature: any) =>
    // feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feature.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (selectedFeature) {
      const ref = featureRefs.current[selectedFeature.id];
      console.log(selectedFeature.id);
      if (ref) {
        ref.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [selectedFeature]);

  return (
    <div className="w-full max-h-[400px]">
      <div className="bg-[#f9fafb] px-6 py-2">
        <input
          type="text"
          placeholder="Search features..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className=" bg-white rounded-full px-5 py-2.5 border border-gray-100 focus:outline-none w-full"
        />
        <div className="overflow-y-scroll max-h-[312px]">
          <table className="min-w-full divide-y">
            <thead className="h-1">
              <tr className="h-1">
                <th className="px-6 text-left text-[1px] font-medium text-gray-500 max-w-[100px]">
                  {/* Feature */}
                </th>
                <th className="px-6 text-left text-[1px] font-medium text-gray-500 w-full"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y border-none">
              {filteredFeatures.map((feature: DataPoint) => (
                <tr
                  key={feature.id}
                  ref={(el) => {
                    featureRefs.current[feature.id] = el;
                  }}
                  onClick={() => onClick(feature.id)}
                  onMouseEnter={() => setHoveredId(feature.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`hover:bg-white transition-colors cursor-pointer duration-200 ${
                    hoveredId === feature.id ||
                    selectedFeature?.id === feature.id
                      ? "bg-white"
                      : "bg-[#f9fafb]"
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex flex-row items-center max-w-[100px]">
                    <div className="h-2 w-2 rounded-full bg-orange-800 mr-2" />
                    <div># {feature.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex flex-row items-center justify-between">
                      <div>{feature.description}</div>
                      {(hoveredId === feature.id ||
                        selectedFeature?.id === feature.id) && (
                        <button
                          onClick={() => onClick(feature.id)}
                          className="transition-opacity duration-200 ml-4 underline text-orange-800"
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
