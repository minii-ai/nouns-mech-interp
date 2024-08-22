"use client";
import React, { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import FeatureCard from "../../components/Feature";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useGetFeatureById } from "@/hooks/features";

interface DataPoint {
  id: number;
  name: string;
  x: number;
  y: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function FeaturesExplorer() {
  const params = useParams();
  const id = params.slug as string;
  const router = useRouter();

  const featureId = parseInt(id, 10);
  const { data: feature, isLoading, error } = useGetFeatureById(featureId);

  console.log({ feature });

  const [selectedFeature, setSelectedFeature] = useState<
    DataPoint | undefined
  >();
  const [searchTerm, setSearchTerm] = useState("");
  const featureRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  console.log({ id });

  useEffect(() => {
    // const fetchData = async () => {
    //   setLoadingFeatures(true);
    //   try {
    //     const response = await fetcher("/api/features/");
    //     setFeatures(response.data);
    //   } catch (error) {
    //     setError(error);
    //   } finally {
    //     setLoadingFeatures(false);
    //   }
    // };
    // fetchData();
  }, []);

  // useEffect(() => {
  //   if (id && features) {
  //     const feature = features.find(
  //       (f: DataPoint) => f.id.toString() === id.toString()
  //     );
  //     setSelectedFeature(feature);
  //   }
  // }, [id, features]);

  useEffect(() => {
    if (selectedFeature) {
      const ref = featureRefs.current[selectedFeature.id];
      if (ref) {
        ref.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [selectedFeature]);

  if (error) return <div>Failed to load features</div>;

  // const filteredFeatures = features.filter(
  //   (feature: DataPoint) =>
  //     feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     feature.id.toString().includes(searchTerm.toLowerCase())
  // );

  const handleGotoPlayground = (id = null) => {
    router.push(`/image-playground/${feature.top_k_images[0].image_id}`);
  };

  return (
    <div className="min-h-screen bg-white py-4">
      <div className="w-full flex flex-col items-center justify-center mb-6">
        <div className="max-w-2xl w-[672px] flex flex-row items-center justify-between font-medium text-sm pt-4">
          <p
            className="cursor-pointer"
            onClick={() => router.push("/image-playground")}>
            Swiggle
          </p>
          <p className="text-gray-500">Features Explorer.</p>
        </div>
        <div className="max-w-2xl mx-auto py-6 mt-[64px]">
          <h1 className="text-2xl font-medium text-gray-900">
            Learned Feature
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
            onClick={() => handleGotoPlayground()}>
            Explore an image with this feature →
          </button>
        </div>
      </div>
      <div className="h-full p-4">
        {/* <input
          type="text"
          placeholder="Search features..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4 w-full bg-transparent active:border-none focus:border-none focus:outline-none"
        /> */}

        {feature && <FeatureCard feature={feature} />}
      </div>
    </div>
  );
}

export default FeaturesExplorer;
