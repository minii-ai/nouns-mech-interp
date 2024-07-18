"use client";
import React, { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import FeatureCard from "../../components/Feature";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

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
        const response = await fetcher("/api/features/");
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
    <div className="min-h-screen bg-white py-4">
      <div className="w-full flex flex-col items-center justify-center mb-6">
        <div className="max-w-2xl w-[672px] flex flex-row items-center justify-between font-medium text-sm pt-4">
          <p className="cursor-pointer" onClick={() => router.push("/")}>
            Swiggle
          </p>
          <p className="text-gray-500">Features Explorer.</p>
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
        </div>
      </div>
      <div className="h-full p-4">
        <input
          type="text"
          placeholder="Search features..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4 w-full bg-transparent active:border-none focus:border-none focus:outline-none"
        />
        {!loadingFeatures && (
          <div>
            {filteredFeatures.map((feature: DataPoint) => (
              <div
                key={feature.id}
                className="my-3"
                ref={(el) => {
                  featureRefs.current[feature.id] = el;
                }}>
                <FeatureCard feature={feature} />
                {/* <div className="bg-gray-200 h-[1px] my-3" /> */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FeaturesExplorer;
