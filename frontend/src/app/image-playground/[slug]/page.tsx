"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useSWR from "swr";
import FeatureCard from "../../components/Feature";
import { useParams, useRouter } from "next/navigation";
import { XMarkIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { useGetImageDataById } from "@/hooks/images";
import { useGetFeatureById } from "@/hooks/features";

// import { Rotate } from "tabler-icons-react";

interface Feature {
  x: number;
  y: number;
  id: number;
  name: string;
  activation: number;
}

const featuresMock: Feature[] = [
  { x: 70, y: 80, name: "Burger", id: 101, activation: 0.2 },
  { x: 90, y: 100, name: "Pizza", id: 102, activation: 0.2 },
  { x: 110, y: 120, name: "Ice Cream", id: 103, activation: 0.2 },
  { x: 130, y: 140, name: "Fries", id: 104, activation: 0.2 },
  { x: 150, y: 160, name: "Taco", id: 105, activation: 0.2 },
  { x: 170, y: 180, name: "Nachos", id: 106, activation: 0.2 },
  { x: 190, y: 200, name: "Pasta", id: 107, activation: 0.2 },
  { x: 210, y: 220, name: "Sushi", id: 108, activation: 0.2 },
  { x: 230, y: 240, name: "Salad", id: 109, activation: 0.2 },
  { x: 250, y: 260, name: "Sandwich", id: 110, activation: 0.2 },
  { x: 270, y: 280, name: "Soup", id: 111, activation: 0.2 },
  { x: 290, y: 300, name: "Steak", id: 112, activation: 0.2 },
  { x: 310, y: 320, name: "Chicken", id: 113, activation: 0.2 },
  { x: 330, y: 340, name: "Fish", id: 114, activation: 0.2 },
  { x: 350, y: 360, name: "Eggs", id: 115, activation: 0.2 },
  { x: 370, y: 380, name: "Waffles", id: 116, activation: 0.2 },
  { x: 390, y: 400, name: "Pancakes", id: 117, activation: 0.2 },
];

// function formatBase64Image(base64String) {
//   const prefix = "data:image/png;base64,";
//   return `${prefix}${base64String}`;
// }

async function fetchMissingFeatureImages(missingFeatures) {
  const updatedFeatures = await Promise.all(
    missingFeatures.map(async (feature) => {
      if (!feature.imageUrl) {
        const id = feature.id.toString();
        try {
          const res = await fetch(
            `http://localhost:8000/api/features/${id}/image`
          );

          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }

          const contentType = res.headers.get("Content-Type");
          if (contentType && contentType.includes("image/png")) {
            const blob = await res.blob();
            const imageUrl = URL.createObjectURL(blob);
            return {
              ...feature,
              imageUrl, // Add the image URL to the feature
            };
          } else {
            throw new Error("Expected image/png response");
          }
        } catch (error) {
          console.error(
            `Error fetching image for feature_id ${feature.feature_id}:`,
            error
          );
          return feature; // Return the original feature even if the image fetch fails
        }
      } else {
        return feature; // If the feature already has an imageUrl, return it as is
      }
    })
  );

  return updatedFeatures;
}

function debounce(callback, delay) {
  let timeoutId;

  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

function throttle(callback, delay) {
  let lastCall = 0;

  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      callback(...args);
    }
  };
}

const modifyFeatures = async (imageId: number, features: object) => {
  const api = `http://localhost:8000/api/images/${imageId}/features`;
  const body = {
    features,
  };
  const res = await fetch(api, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  // console.log(res);

  const blob = await res.blob();
  const imageUrl = URL.createObjectURL(blob);
  console.log("Image URL:", imageUrl); // Log the image URL

  // const json = await res.json();
  // return json.base64;
  return imageUrl;
};

const modifyImageWithText = async (
  imageId: number,
  text: string,
  featureAdjustments: any
) => {
  const api = `http://localhost:8000/api/images/${imageId}/text`;
  const body = {
    text,
    feature_adjustments: featureAdjustments,
  };

  const res = await fetch(api, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  console.log(res);
  const res_json = await res.json();
  console.log(res_json);

  return { res_json };
};

function ImagePlayground() {
  const params = useParams();
  const id = params.slug as string;

  const [originalFeatures, setOriginalFeatures] = useState<Feature[]>([]);
  const [modifiedFeatures, setModifiedFeatures] = useState<any[]>([]);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [modifiedImageUrl, setModifiedImageUrl] = useState<string>("");
  const [featureSearchQuery, setFeatureSearchQuery] = useState("");
  const [modifiedImageBase64, setModifiedImageBase64] = useState<any | null>(
    null
  );
  const [featuresWithImages, setFeaturesWithImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [features, setFeatures] = useState<any>({});

  const featuresRef = useRef(features);
  featuresRef.current = features;

  const modifiedFeaturesRef = useRef(modifiedFeatures);
  modifiedFeaturesRef.current = modifiedFeatures;

  const imageId = parseInt(id, 10);
  const { data: imageData, isLoading } = useGetImageDataById(imageId);

  const modifyFeaturesDebounced = useMemo(() => {
    return debounce(async () => {
      console.log("[INFO] Modifying Features ....");

      const modifiedLearnedFeatures = Object.entries(featuresRef.current).map(
        ([featureId, activation]) => {
          return {
            feature_id: featureId,
            activation,
          };
        }
      );

      const combinedFeatures = [
        ...modifiedLearnedFeatures.map(({ feature_id, activation }) => ({
          feature_id,
          activation,
        })),
        ...modifiedFeaturesRef.current.map(({ id, activation }) => ({
          feature_id: id,
          activation,
        })),
      ];

      console.log(combinedFeatures);
      const modifiedBase64 = await modifyFeatures(imageId, combinedFeatures);
      console.log(modifiedBase64);

      setModifiedImageBase64(modifiedBase64);
    }, 1000);
  }, [imageId, modifiedFeatures]);

  useEffect(() => {
    if (imageData) {
      // convert list of features to object {feature_id -> activation}
      const featuresData = {};
      imageData.features.forEach((feature: any) => {
        featuresData[feature.feature_id] = feature.activation;
      });

      setFeatures(featuresData);
    }
  }, [imageData]);

  useEffect(() => {
    if (imageData) {
      if (imageData && featuresWithImages.length == 0) {
        setLoading(true);
      }
      console.log("Getting images");
      // Fetch image URLs for each feature
      const fetchFeatureImages = async () => {
        try {
          const featureImagePromises = imageData.features.map(
            async (feature: any) => {
              try {
                const res = await fetch(
                  `http://localhost:8000/api/features/${feature.feature_id}/image`
                );
                // console.log("Response:", res);

                if (!res.ok) {
                  throw new Error(`HTTP error! status: ${res.status}`);
                }

                const contentType = res.headers.get("Content-Type");
                if (contentType && contentType.includes("image/png")) {
                  const blob = await res.blob();
                  const imageUrl = URL.createObjectURL(blob);
                  console.log("Image URL:", imageUrl); // Log the image URL
                  return {
                    ...feature,
                    imageUrl, // Use the created URL for the image
                  };
                } else {
                  throw new Error("Expected image/png response");
                }
              } catch (error) {
                console.error(
                  `Error fetching image for feature_id ${feature.feature_id}:`,
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
          setFeaturesWithImages(filteredFeatures);
          setTimeout(() => {
            setLoading(false);
            console.log("Features with Images:", filteredFeatures);
          }, 2000);
          console.log("Features with Images:", filteredFeatures);
        } catch (error) {
          console.error("Error in fetching feature images:", error);
        }
      };

      fetchFeatureImages();
      console.log(featuresWithImages);
    }
  }, [imageData]);

  const handleSliderChange = (id: number, newValue: number) => {
    console.log(id, newValue);

    setFeatures((prevFeatures: any) => {
      return {
        ...prevFeatures,
        [id]: newValue / 10,
      };
    });

    modifyFeaturesDebounced();
  };

  const removeModifiedFeature = async (id: any) => {
    console.log("removing feature");
    console.log(id);
    console.log(modifiedFeatures);
    setModifiedFeatures((prevFeatures) => {
      const filteredFeatures = prevFeatures.filter(
        (feature) => parseInt(feature.id, 10) !== id
      );
      modifiedFeaturesRef.current = filteredFeatures;
      return filteredFeatures;
    });
    modifyFeaturesDebounced();
  };

  const formatActivation = (activation: number) => {
    return Number.isInteger(activation)
      ? `${activation}.0`
      : activation.toFixed(1);
  };

  const handleMoreInfo = (id: number) => {
    router.push(`/features-explorer/${id}`);
  };

  const handleImagePlayground = () => {
    router.push(`/image-playground`);
  };

  const handleReset = () => {
    // Set image url to empty
    setModifiedImageUrl("");

    setModifiedImageBase64(null);

    const featuresData = {};
    imageData.features.forEach((feature: any) => {
      featuresData[feature.feature_id] = feature.activation;
    });

    setFeatures(featuresData);

    // Remove modified features
    setModifiedFeatures([]);
  };

  const getFeatures = () => {
    const features = {}; // map feature id to activation
    // imageData.features.forEach((feature: any) => {
    //   features[feature.feature_id] = feature.activation;
    // });

    // modifiedFeatures.forEach((feature: any) => {
    //   features[feature.id] = feature.activation;
    // });

    return features;
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      console.log("MODIFYING IMAGE: ", featureSearchQuery);

      const featuresMook = getFeatures();
      console.log(modifiedFeatures);

      console.log(features);

      const res = await modifyImageWithText(
        imageId,
        featureSearchQuery,
        featuresMook
      );

      console.log(res);

      // throw new Error("asdf");
      console.log(res);
      console.log("MODIFIED IMAGE");
      console.log(res.res_json.image_id);
      console.log(res.res_json.modified_image);

      const feature_adjustments = res.res_json.feature_adjustments;
      console.log(feature_adjustments);

      setModifiedImageBase64(res.res_json.modified_image);

      console.log(features);

      Object.entries(feature_adjustments).forEach(
        ([feature_id, activation]) => {
          if (feature_id in features) {
            features[feature_id] = activation;
          }
        }
      );

      console.log(features);

      const updatedFeaturesWithImages = featuresWithImages.map((feature) => {
        if (feature.feature_id in feature_adjustments) {
          return {
            ...feature,
            activation: feature_adjustments[feature.feature_id],
          };
        }
        return feature;
      });

      // Assuming setFeaturesWithImages is the state setter function
      setFeaturesWithImages(updatedFeaturesWithImages);

      const newModifiedFeatures: any[] = [...modifiedFeatures];
      console.log(newModifiedFeatures);

      Object.entries(feature_adjustments).forEach(
        ([feature_id, activation]) => {
          if (feature_id in features) {
            features[feature_id] = activation;
          } else {
            newModifiedFeatures.push({
              id: parseInt(feature_id, 10),
              activation: activation,
            });
          }
        }
      );

      console.log(newModifiedFeatures);

      const missingFeaturesWithImages = await fetchMissingFeatureImages(
        newModifiedFeatures
      );
      console.log(missingFeaturesWithImages);
      setModifiedFeatures((prevFeatures) => {
        const updatedFeatures = [...prevFeatures, ...missingFeaturesWithImages];

        console.log("Updated Features:", updatedFeatures);

        return updatedFeatures;
      });

      setFeatureSearchQuery("");
    }
  };

  return (
    <>
      {!loading && (
        <div className="h-screen bg-white">
          <div className="w-full flex flex-col items-center justify-center"></div>
          {imageData && featuresWithImages.length > 0 && (
            <div className="flex justify-between h-full">
              <div className="w-full flex flex-col items-center justify-between h-full">
                <div className="flex flex-col w-full cursor-default px-2.5 py-2.5 bg-[#f9fafb] border-gray-100 border text-xs">
                  <p className="font-semibold mb-2">Original Image</p>
                  <div className="flex flex-row items-center">
                    <img
                      className="h-[44px] w-[44px] rounded-md mr-2"
                      src={imageData.url}
                    />
                    <p className="text-sm text-gray-500">
                      a pixel art character with a{" "}
                      <span>
                        crocodile-shaped head, light green glasses, and a green
                        and blacked checkered shirt
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <div className="relative flex flex-col items-center justify-center gap-2">
                    <img
                      src={
                        modifiedImageBase64
                          ? modifiedImageBase64.includes("blob:")
                            ? modifiedImageBase64
                            : `data:image/jpeg;base64,${modifiedImageBase64}`
                          : imageData.url
                      }
                      className="h-[512px] w-[512px] rounded-lg border border-gray-200 object-cover"
                      style={{
                        imageRendering: "pixelated",
                      }}
                    />
                    {modifiedImageBase64 && (
                      <button
                        className="cursor-pointer p-0.5 px-2 text-gray-500 hover:bg-gray-100 rounded-full flex items-center"
                        onClick={handleReset}
                      >
                        <p>reset changes</p>
                        <ArrowPathIcon
                          className="h-4 w-4 cursor-pointer ml-1.5 stroke-2"
                          strokeWidth={2}
                        />
                      </button>
                    )}
                  </div>
                </div>

                <input
                  type="text"
                  className="px-4 py-3 border border-gray-100 focus:ring-none focus:outline-none w-full"
                  placeholder="Add a shark hat"
                  value={featureSearchQuery}
                  onChange={(e) => setFeatureSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>

              <div className="w-[600px] flex flex-col h-full shadow-xl border-l border-l-gray-200">
                {modifiedFeatures.length > 0 && (
                  <div>
                    <div className="my-4 px-2 flex items-center justify-between">
                      <p className="font-medium text-sm">Added Features</p>
                      <p className="text-sm text-gray-500">
                        {modifiedFeatures.length}
                      </p>
                    </div>

                    <div className="overflow-y-scroll h-full">
                      {modifiedFeatures.map((feature) => (
                        <div
                          key={feature.id}
                          className="px-2"
                          onMouseEnter={() => setHoveredId(feature.id)}
                          onMouseLeave={() => setHoveredId(null)}
                        >
                          <div className="flex flex-row items-center justify-between w-full">
                            <div className="flex items-center justify-between w-full">
                              <div className="flex flex-row items-center space-x-2">
                                <img
                                  src={feature.imageUrl}
                                  className="h-[32px] w-[32px] rounded-md"
                                />
                                <div className="flex flex-col">
                                  <p className="text-xs">#{feature.id}</p>
                                  <p className="text-sm font-medium">
                                    {feature.id}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-row items-center">
                                <p className="min-w-7 max-w-7 w-7 mr-2 text-sm text-gray-500">
                                  {formatActivation(feature.activation)}
                                </p>
                                <input
                                  disabled
                                  type="range"
                                  min="0"
                                  max="100"
                                  step="1"
                                  value={feature.activation * 10}
                                  onChange={(e) =>
                                    handleSliderChange(
                                      feature.id,
                                      Number(e.target.value)
                                    )
                                  }
                                />
                              </div>
                            </div>
                            <XMarkIcon
                              className="h-4 w-4 cursor-pointer ml-3"
                              onClick={() => removeModifiedFeature(feature.id)}
                            />
                          </div>
                          <div className="bg-gray-200 h-[1px] my-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="my-4 px-2 flex items-center justify-between">
                  <p className="font-medium text-sm">Learned Features</p>
                  <p className="text-sm text-gray-500">
                    {imageData.features.length}
                  </p>
                </div>

                {featuresWithImages.length > 0 && (
                  <div className="overflow-y-scroll h-full">
                    {featuresWithImages.map((feature) => {
                      const displayActivation =
                        features[feature.feature_id] || 0;

                      return (
                        <div
                          key={feature.feature_id}
                          className="px-2"
                          onMouseEnter={() => setHoveredId(feature.feature_id)}
                          onMouseLeave={() => setHoveredId(null)}
                        >
                          <div className="flex flex-row items-center justify-between w-full">
                            <div className="flex items-center justify-between w-full">
                              <div className="flex flex-row items-center space-x-2">
                                <img
                                  src={feature.imageUrl}
                                  className="h-[32px] w-[32px] rounded-md"
                                />

                                <div className="flex flex-col">
                                  <p className="text-xs">
                                    #{feature.feature_id}
                                  </p>
                                  <p className="text-sm font-medium">
                                    {feature.feature_id}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-row items-center">
                                <p className="min-w-7 max-w-7 w-7 mr-2 text-sm text-gray-500">
                                  {formatActivation(displayActivation)}
                                </p>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  step="1"
                                  value={displayActivation * 10}
                                  onChange={(e) =>
                                    handleSliderChange(
                                      feature.feature_id,
                                      Number(e.target.value)
                                    )
                                  }
                                />
                              </div>
                            </div>

                            {/* {hoveredId === feature.feature_id && (
                              <button
                                onClick={() =>
                                  handleMoreInfo(feature.feature_id)
                                }
                                className="transition-opacity duration-200 ml-4 underline text-[#3B81F6]"
                              >
                                More Info
                              </button>
                            )} */}
                          </div>
                          <div className="bg-gray-200 h-[1px] my-2" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      {loading && imageData && imageData.url && (
        <div className="flex flex-col items-center justify-center h-screen bg-white">
          <div className="relative w-48 h-48 mb-4">
            <img
              src={imageData.url}
              alt="AI generating image"
              className="w-full h-full object-cover rounded-lg animate-pulse"
              style={{
                imageRendering: "pixelated",
              }}
            />
            <div className="absolute inset-0 border-4 rounded-lg animate-expand"></div>
          </div>
          <p className="mt-4 text-lg font-medium text-gray-500">
            Extracting Features...
          </p>

          <style jsx>{`
            @keyframes expand {
              0%,
              100% {
                transform: scale(1);
                opacity: 0.9;
              }
              50% {
                transform: scale(1.1);
                opacity: 0.7;
              }
            }
            .animate-expand {
              animation: expand 2s ease-in-out infinite;
            }
          `}</style>
        </div>
      )}
    </>
  );
}

export default ImagePlayground;
