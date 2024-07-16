"use client";
import React, { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import FeatureCard from "../../components/Feature";
import { useParams } from "next/navigation";

interface DataPoint {
  id: number;
  name: string;
  x: number;
  y: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function FeaturesExplorer() {
  const params = useParams();
  const id = params.slug;

  const [features, setFeatures] = useState<DataPoint[]>([]);
  const [error, setError] = useState<any>(null);
  const [loadingFeatures, setLoadingFeatures] = useState(false);

  const [selectedFeature, setSelectedFeature] = useState<
    DataPoint | undefined
  >();
  const [searchTerm, setSearchTerm] = useState("");
  const featureRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoadingFeatures(true);
      try {
        const response = await fetcher("/api/features");
        setFeatures(response.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoadingFeatures(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (id && features) {
      const feature = features.find(
        (f: DataPoint) => f.id.toString() === id.toString()
      );
      setSelectedFeature(feature);
    }
  }, [id, features]);

  useEffect(() => {
    if (selectedFeature) {
      const ref = featureRefs.current[selectedFeature.id];
      if (ref) {
        ref.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [selectedFeature]);

  if (error) return <div>Failed to load features</div>;

  const filteredFeatures = features.filter(
    (feature: DataPoint) =>
      feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feature.id.toString().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="flex flex-row items-center font-medium text-sm p-8">
        <p className="mr-1">Swiggle</p>
        <p className="text-gray-500">Feature Explorer.</p>
      </div>
      <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
        <p className="mt-5 text-base text-gray-500">
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
          className="mb-4 active:border-none focus:border-none focus:outline-none"
        />
        {!loadingFeatures && (
          <div>
            {filteredFeatures.map((feature: DataPoint) => (
              <div
                key={feature.id}
                ref={(el) => {
                  featureRefs.current[feature.id] = el;
                }}>
                <FeatureCard feature={feature} />
                <div className="bg-gray-200 h-[1px] my-6" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FeaturesExplorer;
