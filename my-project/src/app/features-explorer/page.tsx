"use client";
import React, { useEffect, useRef, useState } from "react";
import FeatureCard from "../components/Feature";

interface DataPoint {
  id: number;
  name: string;
  x: number;
  y: number;
}

const features: DataPoint[] = [
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

function FeaturesExplorer() {
  const id = 100;

  const [selectedFeature, setSelectedFeature] = useState<
    DataPoint | undefined
  >();

  const [searchTerm, setSearchTerm] = useState("");
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
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Diffusion Interpretability.
        </h1>
        <p className="mt-5 text-xl text-gray-500">
          Playground for interpreting and exploring the features from the VAE
          latent space. <br />
          Playground for interpreting and exploring the features from the VAE
          latent space.
        </p>
      </div>
      <div className="h-full">
        <input
          type="text"
          placeholder="Search features..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4 active:border-none focus:border-none"
        />
        <div>
          {filteredFeatures.map((feature) => (
            <div key={feature.id}>
              <FeatureCard feature={feature} />
              <div className="bg-gray-200 h-[1px] my-6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FeaturesExplorer;
