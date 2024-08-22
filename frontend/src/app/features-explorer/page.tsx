"use client";
import { useState } from "react";
import FeaturesTable from "../components/FeaturesTable";
import PCAPlot from "../components/PCAPlot";
import { useRouter } from "next/navigation";
import { useGetFeatures } from "@/hooks/features";

interface DataPoint {
  id: number;
  name: string;
  x: number;
  y: number;
}

const featuresPCA: DataPoint[] = [
  { x: 70, y: 80, name: "Burger", id: 101 },
  { x: 90, y: 100, name: "Pizza", id: 102 },
  { x: 110, y: 120, name: "Ice Cream", id: 103 },
  { x: 130, y: 140, name: "Fries", id: 104 },
  { x: 150, y: 160, name: "Taco", id: 105 },
  { x: 170, y: 180, name: "Nachos", id: 106 },
  { x: 190, y: 200, name: "Pasta", id: 107 },
  { x: 210, y: 220, name: "Sushi", id: 108 },
  { x: 230, y: 240, name: "Salad", id: 109 },
  { x: 250, y: 260, name: "Sandwich", id: 110 },
  { x: 270, y: 280, name: "Soup", id: 111 },
  { x: 290, y: 300, name: "Steak", id: 112 },
  { x: 310, y: 320, name: "Chicken", id: 113 },
  { x: 330, y: 340, name: "Fish", id: 114 },
  { x: 350, y: 360, name: "Eggs", id: 115 },
  { x: 370, y: 380, name: "Waffles", id: 116 },
  { x: 390, y: 400, name: "Pancakes", id: 117 },
];

export default function Home() {
  const router = useRouter();
  const [selectedFeatureId, setSelectedFeatureId] = useState<number | null>(
    null
  );

  const { data: features = [] } = useGetFeatures();

  console.log({ features });

  const handleMoreInfo = (id: number) => {
    router.push(`/features-explorer/${id}`);
  };

  return (
    <div className="min-h-screen h-screen bg-white w-full">
      <div className="flex w-full h-full">
        <PCAPlot
          onSelect={(featureId) => setSelectedFeatureId(featureId)}
          features={features}
        />
        <FeaturesTable
          features={features}
          onClick={handleMoreInfo}
          selectedFeatureId={selectedFeatureId}
        />
      </div>
    </div>
  );
}
