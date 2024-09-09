"use client";

import { useState } from "react";
import { useGetFeatures } from "@/hooks/features";
import FeaturesTable from "../components/FeaturesTable";
import PCAPlot from "../components/PCAPlot";
import NavigationSelect from "../components/NavigationSelect";

export default function Home() {
  const [hoveredFeaturedId, setHoveredFeaturedId] = useState<number | null>(
    null
  );
  const [selectedFeatureId, setSelectedFeatureId] = useState<number | null>(
    null
  );

  const { data: features = [] } = useGetFeatures();

  const handleSelectFeature = (id: number) => {
    setSelectedFeatureId(id);
  };

  return (
    <div className="min-h-screen h-screen bg-white w-full">
      <div className="flex w-full h-full">
        <div className="p-2 w-full flex items-center gap-1 absolute z-10">
          <h1 className="text-sm font-semibold text-left">Swiggle</h1>
          <NavigationSelect />
        </div>

        <PCAPlot
          hoveredFeatureId={hoveredFeaturedId}
          features={features}
          onHoverFeature={setHoveredFeaturedId}
        />
        <FeaturesTable
          features={features}
          hoveredFeaturedId={hoveredFeaturedId}
          selectedFeatureId={selectedFeatureId}
          onSelectFeature={handleSelectFeature}
          onHoverFeature={setHoveredFeaturedId}
        />
      </div>
    </div>
  );
}
