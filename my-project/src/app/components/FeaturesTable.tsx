import { useEffect, useRef, useState } from "react";

interface DataPoint {
  id: number;
  name: string;
  x: number;
  y: number;
}

interface FeaturesTableProps {
  features: DataPoint[];
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

  const filteredFeatures = features.filter(
    (feature: any) =>
      feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feature.id.toString().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (selectedFeature) {
      const ref = featureRefs.current[selectedFeature.id];
      if (ref) {
        ref.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [selectedFeature]);

  return (
    <div className="w-full max-h-[400px]">
      <div className="bg-white p-6">
        <input
          type="text"
          placeholder="Search features..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4 active:border-none focus:border-none"
        />
        <div className="overflow-y-scroll max-h-[312px]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feature
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFeatures.map((feature: DataPoint) => (
                <tr
                  key={feature.id}
                  ref={(el) => {
                    featureRefs.current[feature.id] = el;
                  }}
                  onMouseEnter={() => setHoveredId(feature.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`hover:bg-gray-50 transition-colors duration-200 ${
                    selectedFeature?.id === feature.id ? "bg-yellow-100" : ""
                  }`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    # {feature.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {feature.name}
                  </td>
                  <td className="py-2 whitespace-nowrap text-sm text-gray-500 min-w-[150px]">
                    {(hoveredId === feature.id ||
                      selectedFeature?.id === feature.id) && (
                      <button
                        onClick={() => onClick(feature.id)}
                        className="transition-opacity duration-200">
                        More Info
                      </button>
                    )}
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
