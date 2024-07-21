"use client";
import { useState } from "react";
import FeaturesTable from "../components/FeaturesTable";
import PCAPlot from "../components/PCAPlot";
import { useRouter } from "next/navigation";

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
  const [selectedFeature, setSelectedFeature] = useState<
    DataPoint | undefined
  >();

  const handleSelectedFeature = (id: number) => {
    const selectedFeature = featuresPCA.find(
      (feature: any) => feature.id === id
    );

    setSelectedFeature(selectedFeature);
  };

  const handleGotoFeatures = () => {
    router.push(`/features-explorer/null`);
  };

  const handleMoreInfo = (id: number) => {
    const selectedFeature = featuresPCA.find(
      (feature: any) => feature.id === id
    );

    setSelectedFeature(selectedFeature);
    router.push(`/features-explorer/${id}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full flex flex-col items-center justify-center">
        <div className="max-w-2xl w-[672px] flex flex-row items-center justify-between font-medium text-sm pt-4">
          <p className="cursor-pointer" onClick={() => router.push("/")}>
            Swiggle
          </p>
          <p className="text-gray-500">Feature Explorer.</p>
        </div>
        <div className="max-w-2xl mx-auto py-6 mt-[64px]">
          <h1 className="text-2xl font-medium text-gray-900">
            Explore Learned Features
          </h1>
          <p className="text-sm mt-5 text-gray-500">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </p>
          <button
            className="mt-5 px-4 py-2 border rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-600"
            onClick={() => handleGotoFeatures()}>
            Feature Details →
          </button>
        </div>
      </div>
      <div className="flex flex-row mt-10 bg-[#f9fafb] py-4 space-x-3">
        <PCAPlot
          data={featuresPCA}
          onSelect={handleSelectedFeature}
          selectedFeature={selectedFeature}
        />
        <FeaturesTable
          features={featuresPCA}
          onClick={handleMoreInfo}
          selectedFeature={selectedFeature}
        />
      </div>
    </div>
  );
}
