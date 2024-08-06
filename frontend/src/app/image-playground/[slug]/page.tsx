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

const modifyImageWithText = async (imageId: number, text: string) => {
  const api = `http://localhost:8000/api/images/${imageId}/text`;
  const body = {
    text,
  };

  const res = await fetch(api, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const blob = await res.blob();
  const newImageUrl = URL.createObjectURL(blob);
  console.log("Image URL:", newImageUrl); // Log the image URL

  // const json = await res.json();

  return newImageUrl;
};

function ImagePlayground() {
  const params = useParams();
  const id = params.slug as string;

  const [originalFeatures, setOriginalFeatures] = useState<Feature[]>([]);
  // const [learnedFeatures, setLearnedFeatures] = useState<Feature[]>([]);
  const [modifiedFeatures, setModifiedFeatures] = useState<Feature[]>([
    { x: 70, y: 80, name: "Burger", id: 101, activation: 0.2 },
    { x: 90, y: 100, name: "Pizza", id: 102, activation: 0.2 },
  ]);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [modifiedImageUrl, setModifiedImageUrl] = useState<string>("");
  const [featureSearchQuery, setFeatureSearchQuery] = useState("");
  const [modifiedImageBase64, setModifiedImageBase64] = useState<string | null>(
    null
  );
  const [featuresWithImages, setFeaturesWithImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // const [loadingOriginalImage, setLoadingOriginalImage] = useState(false);
  // const [loadingOriginalFeatures, setLoadingOriginalFeatures] = useState(true);
  // const [originalImage, setOriginalImage] = useState<any>(null);
  // const [error, setError] = useState<any>(null);
  const router = useRouter();
  const [features, setFeatures] = useState<any>({});

  console.log(features);

  const featuresRef = useRef(features);
  featuresRef.current = features;

  const imageId = parseInt(id, 10);
  const { data: imageData, isLoading } = useGetImageDataById(imageId);

  const modifyFeaturesDebounced = useMemo(() => {
    return debounce(async () => {
      console.log("[INFO] Modifying Features ....");

      const modifiedFeatures = Object.entries(featuresRef.current).map(
        ([featureId, activation]) => {
          return {
            feature_id: featureId,
            activation,
          };
        }
      );

      console.log(modifiedFeatures);
      const modifiedBase64 = await modifyFeatures(imageId, modifiedFeatures);
      console.log(modifiedBase64);

      setModifiedImageBase64(modifiedBase64);
    }, 1000);
  }, [imageId]);

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
                console.log("Response:", res); // Log the response object

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
          }, 3000);
          console.log("Features with Images:", filteredFeatures);
        } catch (error) {
          console.error("Error in fetching feature images:", error);
        }
      };

      fetchFeatureImages();
    }
  }, [imageData]);

  useEffect(() => {
    console.log("Is Loading");
    console.log(loading);
  }, [setLoading]);

  const handleSliderChange = (id: number, newValue: number) => {
    console.log(id, newValue);

    setFeatures((prevFeatures: any) => {
      return {
        ...prevFeatures,
        [id]: newValue / 10,
      };
    });

    modifyFeaturesDebounced();

    // setLearnedFeatures((prevFeatures) =>
    //   prevFeatures.map((feature) =>
    //     feature.id === id ? { ...feature, activation: newValue / 10 } : feature
    //   )
    // );
  };

  const removeModifiedFeature = (id: number) => {
    setModifiedFeatures((prevFeatures) =>
      prevFeatures.filter((feature) => feature.id !== id)
    );
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
    // setModifiedFeatures([]);
    // Reset learned features to original state
    // setLearnedFeatures(originalFeatures);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Add your logic here for what should happen when the "Enter" key is pressed
      console.log(featureSearchQuery);
      console.log("Enter key pressed");

      console.log("MODIFYING IMAGE");
      const res = await modifyImageWithText(imageId, featureSearchQuery);
      console.log(res);

      setModifiedImageBase64(res);

      const features = [{ feature_id: 1, activation: 0.5, image: "htp://" }];

      const originalFeatures = { ...features };
      // const modifiedFeatures = {};

      features.forEach((feature) => {
        if (feature.feature_id in originalFeatures) {
          originalFeatures[feature.feature_id] = feature.activation;
        } else {
        }
      });

      const modifiedFeatures = [];

      // Find Feature searching for
      // If new image not in learned, set modified features to previous plus new feature
      // let newFeature = {
      //   x: 290,
      //   y: 300,
      //   name: featureSearchQuery,
      //   id: 134,
      //   activation: 0.2,
      // };
      // if (newFeature) {
      //   // Set modified features to previous plus new image
      //   setModifiedFeatures((prevFeatures) => [...prevFeatures, newFeature]);
      // }
      setFeatureSearchQuery("");
    }
  };

  // Placeholder async function to generate a new image URL based on features
  const generateNewImage = async (features: any): Promise<string> => {
    // Simulate an async operation (e.g., API call) with a timeout
    return new Promise((resolve) => {
      setTimeout(() => {
        const newImageUrl = newUrl;
        resolve(newImageUrl);
      }, 1000);
    });
  };

  // useEffect(() => {
  //   const updateImageUrl = async () => {
  //     console.log(learnedFeatures);
  //     console.log(modifiedFeatures);

  //     const combinedFeatures = learnedFeatures.concat(modifiedFeatures);
  //     console.log(combinedFeatures);

  //     // Generate new image URL with new learned and modified features
  //     const newImageUrl = await generateNewImage(combinedFeatures);

  //     // If combined features does not equal original features
  //     if (
  //       newImageUrl &&
  //       JSON.stringify(combinedFeatures) !== JSON.stringify(originalFeatures)
  //     ) {
  //       console.log("setting new image url");
  //       setModifiedImageUrl(newImageUrl);
  //     }
  //   };
  //   if (learnedFeatures.length > 0) {
  //     updateImageUrl();
  //   }
  // }, [learnedFeatures, modifiedFeatures]);

  // useEffect(() => {
  //   const fetchOriginalImage = async () => {
  //     setLoadingOriginalImage(true);
  //     try {
  //       const response = await fetcher(`/api/images/?id=${id}`);
  //       setOriginalImage(response.data);
  //     } catch (error) {
  //       setError(error);
  //     } finally {
  //       setLoadingOriginalImage(false);
  //     }
  //   };

  //   const fetchFeaturesById = async () => {
  //     setLoadingOriginalFeatures(true);
  //     try {
  //       const response = await fetcher(`/api/features/?id=${id}/image`);
  //       console.log(response.data);
  //       setOriginalFeatures(response.data);
  //       setLearnedFeatures(response.data);
  //     } catch (error) {
  //       setError(error);
  //     } finally {
  //       setLoadingOriginalFeatures(false);
  //     }
  //   };

  //   if (!originalImage) {
  //     fetchOriginalImage();
  //   }
  //   fetchFeaturesById();
  // }, []);

  return (
    <>
      {!loading && (
        <div className="h-screen bg-white">
          <div className="w-full flex flex-col items-center justify-center mb-6">
            <div className="max-w-2xl w-[672px] flex flex-row items-center justify-between font-medium text-sm pt-4">
              <p
                className="cursor-pointer"
                onClick={() => router.push("/image-playground")}>
                Swiggle
              </p>
              <p
                className="text-gray-500 cursor-pointer"
                onClick={() => handleImagePlayground()}>
                Image Playground.
              </p>
            </div>
          </div>
          {imageData && featuresWithImages.length > 0 && (
            <div className="flex justify-between mb-8 px-[100px] h-full">
              <div className="w-1/2 pr-[50px] flex flex-col items-center justify-center h-full">
                <div className="relative flex items-center justify-center mb-6">
                  <img
                    src={
                      modifiedImageBase64 ? modifiedImageBase64 : imageData.url
                    }
                    className="h-[256px] w-[256px] rounded-lg border border-gray-200 object-cover"
                    style={{
                      imageRendering: "pixelated",
                    }}
                  />
                </div>
                {/* Only show if not original image */}
                <div
                  className="cursor-pointer h-6 mb-4 text-gray-500 hover:bg-gray-100 rounded-full py-2.5 px-2.5 flex items-center"
                  onClick={handleReset}>
                  {modifiedImageBase64 && (
                    <div className="flex flex-row items-center">
                      <p>reset changes</p>
                      <ArrowPathIcon
                        className="h-4 w-4 cursor-pointer ml-1.5 stroke-2"
                        strokeWidth={2}
                      />
                    </div>
                  )}
                </div>
                <div className="w-[400px]  overflow-y-scroll">
                  {/* <p className="mb-6 mt-6">
                Added Features: {modifiedFeatures.length}
              </p> */}
                  {modifiedFeatures.map((feature) => (
                    <div
                      key={feature.id}
                      className="w-full flex flex-row hover:bg-gray-100 px-3 py-3 rounded-lg items-center justify-between cursor-pointer">
                      <div className="flex flex-row items-center">
                        <div className="bg-[var(--primary-color)] px-2 py-1 rounded-full flex items-center mr-3">
                          <span className="text-white text-xs">Added!</span>
                        </div>
                        <img
                          src={
                            modifiedImageBase64
                              ? modifiedImageBase64
                              : imageData.url
                          }
                          className="h-[36px] w-[36px] rounded-md mr-2"
                        />
                        <p className="">{feature.name}</p>
                      </div>
                      <div className="flex flex-row items-center">
                        <p>{feature.activation}</p>
                        <XMarkIcon
                          className="h-4 w-4 cursor-pointer ml-3"
                          onClick={() => removeModifiedFeature(feature.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-1/2 pl-[50px] flex flex-col h-full">
                <div
                  className="flex flex-col cursor-default px-2.5 py-2.5 bg-[#f9fafb] rounded-xl border-gray-100 border text-xs text-gray-500"
                  onClick={() => console.log("adding feature")}>
                  {/* <img
                src={formatBase64Image(imageData.base64)}
                className="h-[44px] w-[44px] rounded-md mr-2"
              /> */}
                  <p className="font-semibold mb-2">Original Image</p>
                  <div className="flex flex-row items-center">
                    <img
                      className="h-[44px] w-[44px] rounded-md mr-2"
                      src={imageData.url}
                    />
                    <p>
                      a pixel art character with a{" "}
                      <span>
                        crocodile-shaped head, light green glasses, and a green
                        and blacked checkered shirt
                      </span>
                    </p>
                  </div>
                </div>
                <p className="mb-6 mt-6">
                  Learned Features: {imageData.features.length}
                </p>
                {featuresWithImages.length > 0 && (
                  <div className="overflow-y-scroll h-full pb-10">
                    {featuresWithImages.map((feature) => {
                      const displayActivation =
                        features[feature.feature_id] || 0;

                      return (
                        <div
                          key={feature.feature_id}
                          className="mb-4"
                          onMouseEnter={() => setHoveredId(feature.feature_id)}
                          onMouseLeave={() => setHoveredId(null)}>
                          <div className="flex flex-row items-center justify-between">
                            <div>
                              <div className="flex flex-row items-center space-x-2 mb-3">
                                <img
                                  src={feature.imageUrl}
                                  className="h-[36px] w-[36px] rounded-md"
                                />
                                <p className="text-lg">#{feature.feature_id}</p>
                                <p className="text-lg font-medium">
                                  {feature.feature_id}
                                </p>
                              </div>
                              <div className="flex flex-row items-center">
                                <p className="min-w-7 max-w-7 w-7">
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
                                  // className="h-2 bg-gray-200 rounded-lg appearance-none accent-[#3B81F6] cursor-pointer ml-6 mr-3 w-[200px]"
                                />
                              </div>
                            </div>
                            {hoveredId === feature.feature_id && (
                              <button
                                onClick={() =>
                                  handleMoreInfo(feature.feature_id)
                                }
                                className="transition-opacity duration-200 ml-4 underline text-[#3B81F6]">
                                More Info
                              </button>
                            )}
                          </div>
                          <div className="bg-gray-200 h-[1px] my-6" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
          <input
            type="text"
            className="absolute px-4 py-3 bottom-4 left-1/2 transform -translate-x-1/2 w-1/3 border border-gray-300 rounded-md focus:ring-none focus:outline-none"
            placeholder="Add a shark hat"
            value={featureSearchQuery}
            onChange={(e) => setFeatureSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
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
