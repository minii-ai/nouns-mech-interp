import { useGetFeatureById } from "@/hooks/features";
import DensityHistogram from "./DensityHistogram";
import { useState, useEffect } from "react";

function roundToHundredth(num: number) {
  return Math.round(num * 100) / 100;
}

export const FeatureDetails = ({ featureId }) => {
  const { data: feature, isLoading, error } = useGetFeatureById(featureId);
  const [topKImages, setTopKImages] = useState<any[]>([]);
  const [similarFeatureImages, setSimilarFeatureImages] = useState<any[]>([]);

  console.log({ topKImages });

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
    if (topKImages.length == 0 && feature?.top_k_images) {
      fetchTopActivationImages();
      console.log(topKImages);
    }
  }, [topKImages.length, feature?.top_k_images, topKImages]);

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
  }, [feature, similarFeatureImages.length]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const getActivationDensityPercent = () => {
    return roundToHundredth(feature.activation_density * 100);
  };

  const activationDensityPercent = getActivationDensityPercent();

  return (
    <div className="pr-2">
      <div className="flex flex-col gap-2 divide-y">
        <div className="flex gap-4 w-full">
          <div className="flex flex-col gap-2">
            <span className="font-medium text-sm">Decoded Feature</span>
            <img
              src={feature.image}
              className="min-h-[100px] h-[100px] min-w-[100px] w-[100px] rounded-md"
            />
          </div>

          <div className="flex flex-col gap-3 w-full">
            <span className="font-medium text-sm">
              Activations (Density = {activationDensityPercent}%)
            </span>
            <DensityHistogram
              data={feature.activations.buckets}
              height={100}
              width={250}
            />
          </div>
        </div>

        <div className="overflow-x-auto flex flex-col gap-1 pt-2">
          <span className="font-medium text-sm">Similar Features</span>
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="py-1 text-left text-xs font-medium text-gray-500">
                  Feature
                </th>

                <th className="py-1 text-right text-xs font-medium text-gray-500">
                  Cosine Similarity
                </th>
              </tr>
            </thead>
            <tbody>
              {similarFeatureImages.slice(0, 5).map((similar: any, i: any) => (
                <tr key={i} className="border-t">
                  <td className="py-1 flex items-center gap-1">
                    <span className="text-xs text-gray-700 min-w-[42px]">
                      #{similar.feature_id}
                    </span>
                    <img
                      src={similar.imageUrl}
                      className="h-6 w-6 rounded-md"
                      alt={`Feature ${similar.feature_id}`}
                    />
                  </td>

                  <td className="text-xs text-right text-gray-700 py-1">
                    {similar.cosine_similarity.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-1 pt-2">
          <span className="font-medium text-sm">Top K Images</span>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="py-1 text-left text-xs font-medium text-gray-500">
                    Image
                  </th>
                  <th className="py-1 text-right text-xs font-medium text-gray-500">
                    Activation
                  </th>
                </tr>
              </thead>
              <tbody>
                {topKImages.slice(0, 5).map((image: any, i: any) => (
                  <tr key={i} className="border-t">
                    <td className="py-1 flex gap-1 items-center">
                      <span className="text-xs text-gray-700 min-w-[56px]">
                        #{image.image_id}
                      </span>
                      <img
                        src={image.imageUrl}
                        className="h-6 w-6 rounded-md"
                        alt={`Image ${image.image_id}`}
                      />
                    </td>

                    <td className="text-xs text-gray-700 py-1 text-right">
                      {image.activation.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
