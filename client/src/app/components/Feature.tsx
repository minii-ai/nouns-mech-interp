"use client";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import DensityHistogram from "./DensityHistogram";

interface FeatureProps {
  feature: any;
}

const FeatureCard: React.FC<FeatureProps> = ({ feature }) => {
  const similarFeatures: any = [
    { name: "Square Glasses", strength: 0.9 },
    { name: "Square Glasses", strength: 0.9 },
    { name: "Square Glasses", strength: 0.9 },
    { name: "Square Glasses", strength: 0.9 },
    { name: "Square Glasses", strength: 0.9 },
  ];
  const densityHist = [
    { activation: 0, count: 200 },
    { activation: 2, count: 140 },
    { activation: 4, count: 100 },
    { activation: 6, count: 80 },
    { activation: 8, count: 60 },
    { activation: 9, count: 40 },
    { activation: 9.5, count: 35 },
    { activation: 9.7, count: 33 },
    { activation: 10, count: 30 },
    { activation: 12, count: 20 },
  ];

  const baseUrl =
    "data:image/jpeg;base64,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";

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center space-x-2">
        <img src={baseUrl} className="h-[48px] w-[48px] rounded-md" />
        <p className="text-xl">#{feature.id}</p>
        <p className="text-xl font-semibold">{feature.name}</p>
      </div>
      <div className="flex flex-row justify-between mt-4">
        <div>
          <p className="text-md font-medium mb-3">SIMILAR FEATURES</p>
          <div className="space-y-2">
            {similarFeatures.map((similar: any, i: any) => (
              <div className="flex flex-row space-x-2 items-center" key={i}>
                <img src={baseUrl} className="h-6 w-6 rounded-md" />
                <p className="text-lg">{similar.name}</p>
                <p className="text-lg">{similar.strength}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-md font-medium mb-3">TOP ACTIVATIONS</p>
          {
            <div className="flex flex-row space-x-2">
              {similarFeatures.map((similar: any, i: any) => (
                <div className="flex flex-col items-center" key={i}>
                  <img
                    src={baseUrl}
                    className="h-[100px] w-[100px] rounded-md"
                  />
                  <p className="text-lg">{similar.strength}</p>
                </div>
              ))}
            </div>
          }
        </div>
        <div>
          <p className="text-md font-medium mb-3">ACTIVATION DENSITY (0.05%)</p>
          <DensityHistogram data={densityHist} />
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;
