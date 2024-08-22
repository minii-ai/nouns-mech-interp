"use client";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import DensityHistogram from "./DensityHistogram";
import { useRouter } from "next/navigation";

interface FeatureProps {
  feature: any;
}

interface SimilarFeatureProps {
  feature_id: any;
  cosine_similarity: any;
}

function roundToHundredth(num: number) {
  return Math.round(num * 100) / 100;
}

const FeatureCard: React.FC<FeatureProps> = ({ feature }) => {
  const router = useRouter();
  const [topKImages, setTopKImages] = useState<any[]>([]);
  const [similarFeatureImages, setSimilarFeatureImages] = useState<any[]>([]);

  // const similarFeatures: any = [
  //   { name: "Square Glasses", strength: 0.9, id: 101 },
  //   { name: "Square Glasses", strength: 0.9, id: 101 },
  //   { name: "Square Glasses", strength: 0.9, id: 101 },
  //   { name: "Square Glasses", strength: 0.9, id: 101 },
  //   { name: "Square Glasses", strength: 0.9, id: 101 },
  // ];
  // const densityHist = [
  //   { activation: 0, count: 200 },
  //   { activation: 2, count: 140 },
  //   { activation: 4, count: 100 },
  //   { activation: 6, count: 80 },
  //   { activation: 8, count: 60 },
  //   { activation: 9, count: 40 },
  //   { activation: 9.5, count: 35 },
  //   { activation: 9.7, count: 33 },
  //   { activation: 10, count: 30 },
  //   { activation: 12, count: 20 },
  // ];

  const handleGotoPlayground = (id = null) => {
    router.push(`/image-playground/${id}`);
  };

  const getActivationDensityPercent = () => {
    return roundToHundredth(feature.activation_density * 100);
  };

  const activationDensityPercent = getActivationDensityPercent();

  useEffect(() => {
    console.log("Getting top activation images");
    // Fetch image URLs for each feature
    const fetchTopActivationImages = async () => {
      try {
        const featureImagePromises = feature.top_k_images.map(
          async (top_k: any) => {
            try {
              const res = await fetch(
                `http://localhost:8000/api/images/${top_k.image_id}`
              );
              // console.log("Response:", res);

              if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
              }

              const data = await res.json();
              // console.log("Data:", data);
              const imageUrl = data.image.url;
              return {
                ...top_k,
                imageUrl, // Use the created URL for the image
              };
            } catch (error) {
              console.error(
                `Error fetching image for feature_id ${top_k.image_id}:`,
                error
              );
              return null;
            }
          }
        );

        const featuresWithImagesData = await Promise.all(featureImagePromises);
        // Filter out any null values that may have occurred due to errors
        const filteredFeatures = featuresWithImagesData.filter(
          (feature) => feature !== null
        );
        setTopKImages(filteredFeatures);
        console.log("Top Activations with Images:", filteredFeatures);
      } catch (error) {
        console.error("Error in fetching top activation images:", error);
      }
    };
    if (topKImages.length == 0) {
      fetchTopActivationImages();
      console.log(topKImages);
    }
  }, []);

  useEffect(() => {
    if (feature) {
      console.log("Getting images");
      // Fetch image URLs for each feature
      const fetchFeatureImages = async () => {
        try {
          const featureImagePromises = feature.similar_features.map(
            async (similarFeature: any) => {
              try {
                const res = await fetch(
                  `http://localhost:8000/api/features/${similarFeature.feature_id}/image`
                );
                // console.log("Response:", res);

                if (!res.ok) {
                  throw new Error(`HTTP error! status: ${res.status}`);
                }

                const contentType = res.headers.get("Content-Type");
                if (contentType && contentType.includes("image/png")) {
                  const blob = await res.blob();
                  const imageUrl = URL.createObjectURL(blob);
                  // console.log("Image URL:", imageUrl);
                  return {
                    ...similarFeature,
                    imageUrl,
                  };
                } else {
                  throw new Error("Expected image/png response");
                }
              } catch (error) {
                console.error(
                  `Error fetching image for feature_id ${similarFeature.feature_id}:`,
                  error
                );
                return null;
              }
            }
          );

          const featuresWithImagesData = await Promise.all(
            featureImagePromises
          );
          // Filter out any null values that may have occurred due to errors
          const filteredFeatures = featuresWithImagesData.filter(
            (feature) => feature !== null
          );
          setSimilarFeatureImages(filteredFeatures);
          console.log("Similar Features with Images:", filteredFeatures);
        } catch (error) {
          console.error("Error in fetching feature images:", error);
        }
      };

      if (similarFeatureImages.length == 0) {
        fetchFeatureImages();
      }
    }
  }, []);

  return (
    <div className="bg-[#f9fafb] rounded-xl p-4 border-gray-100 border">
      <div className="flex flex-row items-center space-x-2">
        <img src={feature.image} className="h-[48px] w-[48px] rounded-md" />
        <p className="text-lg">#{feature.id}</p>
        <p className="text-lg font-medium">{feature.description}</p>
      </div>
      {topKImages.length > 0 && similarFeatureImages.length > 0 && (
        <div className="text-gray-500 flex flex-row justify-between mt-5">
          <div>
            <p className="text-sm font-medium mb-4">Similar Features</p>
            <div className="space-y-3">
              {/* {similarFeatures.map((similar: any, i: any) => ( */}
              {/* {feature.similar_features.map((similar: any, i: any) => {
              const cosine_sim = roundToHundredth(similar.cosine_similarity);
              return (
                <div className="flex flex-row space-x-2 items-center" key={i}>
                  <img src={similar.image} className="h-6 w-6 rounded-md" />
                  <p className="text-sm">{similar.feature_id}</p>
                  <p className="text-sm">{cosine_sim}</p>
                </div>
              );
            })} */}
              {similarFeatureImages.slice(0, 5).map((similar: any, i: any) => {
                // const cosine_sim = roundToHundredth(similar.cosine_similarity);
                return (
                  <div className="flex flex-row space-x-2 items-center" key={i}>
                    <img
                      src={similar.imageUrl}
                      className="h-6 w-6 rounded-md"
                    />
                    <p className="text-sm">#{similar.feature_id}</p>
                    <p className="text-sm">
                      {similar.cosine_similarity.toFixed(4)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-4">Top Activations</p>
            {
              <div className="flex flex-row space-x-3">
                {topKImages.slice(0, 5).map((topK: any, i: any) => (
                  <div
                    className="flex flex-col items-center"
                    key={topK.image_id}
                  >
                    <img
                      src={topK.imageUrl}
                      className="h-[72px] w-[72px] rounded-md cursor-pointer"
                      onClick={() => handleGotoPlayground(topK.image_id)}
                    />
                    <p className="text-sm mt-2">{topK.activation.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            }
          </div>
          <div>
            <p className="text-sm font-medium mb-4">
              Activation Density ({activationDensityPercent}%)
            </p>
            <DensityHistogram data={feature.activations.buckets} />
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureCard;
