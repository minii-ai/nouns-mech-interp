"use client";
import React, { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import FeatureCard from "../../components/Feature";
import { useParams, useRouter } from "next/navigation";
import { XMarkIcon } from "@heroicons/react/24/outline";
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

function ImagePlayground() {
  const params = useParams();
  const id = params.slug;

  const [features, setFeatures] = useState<Feature[]>(featuresMock);
  const [originalFeatures, setOriginalFeatures] =
    useState<Feature[]>(featuresMock);
  const [modifiedFeatures, setModifiedFeatures] = useState<Feature[]>([]);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [modifiedImageUrl, setModifiedImageUrl] = useState(baseUrl);
  const [featureSearchQuery, setFeatureSearchQuery] = useState("");
  const router = useRouter();

  const handleSliderChange = (id: number, newValue: number) => {
    setFeatures((prevFeatures) =>
      prevFeatures.map((feature) =>
        feature.id === id ? { ...feature, activation: newValue / 10 } : feature
      )
    );
    setModifiedFeatures((prevFeatures) => {
      const existingFeature = prevFeatures.find((feature) => feature.id === id);
      if (existingFeature) {
        return prevFeatures.map((feature) =>
          feature.id === id
            ? { ...feature, activation: newValue / 10 }
            : feature
        );
      } else {
        const featureToModify = features.find((feature) => feature.id === id);
        if (featureToModify) {
          return [
            ...prevFeatures,
            { ...featureToModify, activation: newValue / 10 },
          ];
        }
        return prevFeatures;
      }
    });
    // update modified image url to new image
    setModifiedImageUrl(baseUrl);
  };

  const removeFeature = (id: number) => {
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

  const handleReset = () => {
    // Set image url to original
    setModifiedImageUrl(baseUrl2);
    // Remove modified features
    setModifiedFeatures([]);
    // Reset learned features to original state
    setFeatures(featuresMock);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Add your logic here for what should happen when the "Enter" key is pressed
      console.log(featureSearchQuery);
      console.log("Enter key pressed");
      setFeatureSearchQuery("");
    }
  };

  useEffect(() => {}, [modifiedImageUrl]);

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full flex flex-col items-center justify-center mb-6">
        <div className="max-w-2xl w-[672px] flex flex-row items-center justify-between font-medium text-sm pt-4">
          <p className="cursor-pointer" onClick={() => router.push("/")}>
            Swiggle
          </p>
          <p className="text-gray-500">Image Playground.</p>
        </div>
      </div>
      <div className="flex justify-between mb-8 px-[100px] h-screen">
        <div className="w-1/2 pr-[50px] flex flex-col items-center justify-center mb-[84px]">
          <div className="w-full flex items-center justify-center">
            <img
              src={modifiedImageUrl}
              className="h-[400px] w-[400px] mb-6 rounded-3xl"
            />
          </div>
          <div className="cursor-pointer" onClick={handleReset}>
            <p>reset to original</p>
          </div>
        </div>
        <div className="w-1/2 pl-[50px] flex flex-col">
          <div
            className="flex flex-row cursor-pointer items-center px-2 py-2 border border-gray-200 rounded-lg text-xs text-gray-500"
            onClick={() => console.log("adding feature")}>
            <img src={baseUrl2} className="h-[44px] w-[44px] rounded-md mr-2" />
            <p>
              a pixel art character with square black glasses, a hotdog-shaped
              head and a peachy-colored body on a warm background
            </p>
          </div>
          <p className="mb-6 mt-6">Learned Features: {features.length}</p>
          <div className="overflow-y-scroll">
            {features.map((feature) => {
              const modifiedFeature = modifiedFeatures.find(
                (mf) => mf.id === feature.id
              );
              const displayActivation = modifiedFeature
                ? modifiedFeature.activation
                : feature.activation;
              return (
                <div
                  key={feature.id}
                  className="mb-4"
                  onMouseEnter={() => setHoveredId(feature.id)}
                  onMouseLeave={() => setHoveredId(null)}>
                  <div className="flex flex-row items-center justify-between">
                    <div>
                      <div className="flex flex-row items-center space-x-2 mb-3">
                        <img
                          src={baseUrl}
                          className="h-[36px] w-[36px] rounded-md"
                        />
                        <p className="text-xl">#{feature.id}</p>
                        <p className="text-xl font-semibold">{feature.name}</p>
                      </div>
                      <div className="flex flex-row items-center">
                        <p className="min-w-7 max-w-7 w-7">
                          {formatActivation(displayActivation)}
                        </p>
                        <input
                          type="range"
                          min="0"
                          max="40"
                          value={displayActivation * 10}
                          onChange={(e) =>
                            handleSliderChange(
                              feature.id,
                              Number(e.target.value)
                            )
                          }
                          className="accent-orange-700 bg-white border-orange-700 cursor-pointer ml-6 mr-3"
                        />
                      </div>
                    </div>
                    {hoveredId === feature.id && (
                      <button
                        onClick={() => handleMoreInfo(feature.id)}
                        className="transition-opacity duration-200 ml-4 underline text-orange-800">
                        More Info
                      </button>
                    )}
                  </div>
                  <div className="bg-gray-200 h-[1px] my-6" />
                </div>
              );
            })}
          </div>
          <div>
            <p className="mb-6 mt-6">
              Added Features: {modifiedFeatures.length}
            </p>
            {modifiedFeatures.map((feature) => (
              <div
                key={feature.id}
                className="flex flex-row mb-4 bg-gray-100 px-3 py-3 rounded-lg items-center justify-between">
                <div className="flex flex-row items-center">
                  <img
                    src={baseUrl}
                    className="h-[36px] w-[36px] rounded-md mr-2"
                  />
                  <p className="">{feature.name}</p>
                </div>
                <div className="flex flex-row items-center">
                  <p>{feature.activation}</p>
                  <XMarkIcon
                    className="h-4 w-4 cursor-pointer ml-3"
                    onClick={() => removeFeature(feature.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <input
        type="text"
        className="absolute px-3 py-3 bottom-4 left-1/2 transform -translate-x-1/2 w-1/3 border border-gray-300 rounded-md focus:ring-none focus:outline-none"
        placeholder="Add a shark hat"
        value={featureSearchQuery}
        onChange={(e) => setFeatureSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

export default ImagePlayground;

const baseUrl =
  "data:image/jpeg;base64,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";

const baseUrl2 =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAFAAUADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD1qiiioNAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigYUUUUAFFFFAgooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKztU13TtG8r+0LjyfO3bPkZt23Gfug+oobtuVGMpytFXfkaNFc9/wAJx4d/6CP/AJAk/wDiaP8AhOPDv/QR/wDIEn/xNLmj3Nvqtb+R/cdDRXPf8Jx4d/6CP/kCT/4mj/hOPDv/AEEf/IEn/wATRzR7h9VrfyP7joaKztL13TtZ83+z7jzvJ27/AJGXbuzj7wHoa0aad9jGUZQlaSs/MKKKKCQooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKoaz/yCZ/+A/8AoQpSlaLfYqMbyS7l+iuErXrCOIv0Ov6p5/gdJXn3xP8A+YV/22/9krlfFP8AyMd3/wAA/wDQFrHqnUurWPWweW+ynGtzX8rBRRRWZ64UUUUAehfDD/mK/wDbH/2evQa+fK2PC3/Ix2n/AAP/ANAatI1LK1jyMZlvtZyrc1vKx7XRXN1kVMsRboeT9U8/wO7oqho3/IJg/wCBf+hGr9bxleKfc5JRtJrsFFFFMkKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiism91v7HdvB9n3bcfNvxnIB6Y96mUoxV2XGEpuyQa3eXFn5HkPt3bt3yg5xjHUe9Ys2p3lxC0Us25GxkbFGec9hUmpaj/aHlfuvL2bv492c49h6VTiTzJAmcZ71w1KjlJ2eh6FKklFXWoyteqn2H/pp/wCO/wD165v/AITn/qHf+R//ALGnTi1e51U6Up35Vexj+Kf+Rju/+Af+gLWPVzVL7+0tSlu/L8rzNvy7t2MKB1wPStTwx4YPiQ3QF39n+z7P+WW/Oc/7QxjH60VasKUHObskevzKlSTnpZI5+iuy1rwEdI0ua9/tLzfLx8nkYzkgddx9fSuU+zf7f6UsPXhiIudJ3SdjWhL28eanqtiCip/s3+3+lROuxiuc4rdxa3NJU5RV2htbHhb/AJGO0/4H/wCgNWPVzS77+zdSiu/L83y93y7tucqR1wfWkY1E3BpbtHqdZFY//Cc/9Q7/AMj/AP2NdJ9h/wCmn/jv/wBesqkW7WPFqUpQtzK1xIdTvLeFYoptqLnA2Kcc57itrRLy4vPP89923bt+UDGc56D2rnZU8uQpnOO9XNN1H+z/ADf3Xmb9v8e3GM+x9aVOo4yV3octWknF2Wp1lFZNlrf2y7SD7Pt3Z+bfnGAT0x7VrV3RlGSujz5QlB2aCiiiqICiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACuT1r/AJC0/wDwH/0EV1lcnrX/ACFp/wDgP/oIrnxPwr1OrC/G/QoVNa/8fK/j/Koamtf+Plfx/lXHH4kd5o15BXr9eQV0o9HA9fkFdh4E1zT9Fa/N/ceV5vl7PkZs43Z6A+orj6KyxFCNem6ctn2OyrSVWDi9meqaxr+m+IdLm0vS7r7ReT7fLi8tl3YIY8kADgE8ntXLDwfrx/5cD/39j/xqp4I/5HCw/wC2n/otq9kyPavErYieVv2NBXT1111OH6xPAv2dKzT11PJ/+EP17/oHn/v7H/jWBqGn3VlfSW9xFslTG5cqcZAI5Bx0Ir3fPWvJ/GP/ACNd99U/9AWurLsyq4uq4VEkkr/1c68HjamLqOFRJJK+ny7s5VkZcbhjNNqe5/h/GoK9d7nVOKjJpBXr9eQV6/SZ5mO6fMzrr/j5b8P5VDU11/x8t+H8qhrmfxM84v6L/wAhaD/gX/oJrrK5PRf+QtB/wL/0E11ldmG+F+pwYr416BRRRXQcoUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAVyetf8AIWn/AOA/+giusrk9a/5C0/8AwH/0EVz4n4V6nVhfjfoUKmtf+Plfx/lUNTWv/Hyv4/yrjj8SO80a8gr1+vIK6UejgevyCiiimegFFbHhaxt9S8R2lpdx+ZDJv3LuIzhCRyCD1Ar0oeBvDv8A0D//ACNJ/jXnYvMKWGmozV20clfFU6UuVpnjtexeBgD4QsOP+en/AKMal/4Qbw7/ANA7/wAjyf8AxVcpq2rX3h3VZtL0ufyLODHlx7Q2MgMeWBJ5JPJ71w1a0czXsaGklrrpp8jFv68/Z0tGtdTR+I3XTf8Atp/7JXAzf6pvw/nVzWNb1DU/J+2XHm+Xu2/IoxnGegHoKyzK7KQWyD7V7GDoyw9BUp6tHqYdfV6Koz3V9hlev15BXr9bM8zHdPmZ11/x8t+H8qhqa6/4+W/D+VQ1zP4mecX9F/5C0H/Av/QTXWVyei/8haD/AIF/6Ca6yuzDfC/U4MV8a9AoooroOUKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK5PWv+QtP/AMB/9BFdZXJ61/yFp/8AgP8A6CK58T8K9Tqwvxv0KFTWv/Hyv4/yrG1fxDpeg+T/AGndeR527y/3bNu24z90HH3h19az7f4i+FEmVm1XAGefs8vp/u1yxpzbTS0Ox1Ip2bR3VeQV2X/CzPB//QX/APJaX/4mvOf+Ej0n/n7H/fDf4V08kux3YLEUY35pJfM1K6Hwx4YPiQ3QF39n+z7P+WW/Oc/7QxjH61xP/CR6T/z9j/vhv8K7LwJ4+8MaMb86hqgg87y9n7iRs43Z+6p9RXLjfbRoN0U+bpZX/A3xGNpKm3Tmr+q7nTJ4WPg9xrv2z7X9l/5Y+V5e7d8nXccY3Z6HpUw+I5zn+yh/4Ef/AGNZ3ib4n+DtQ8PXNra6wJJn24X7NKucMCeSoHQGvPv+Ep0b/n9H/ft/8K48HgvrVNzxkHzJ2V9NPQnBywleDliZLmvbV20+R6l/wsc5z/ZQ/wDAj/7GuN1vWP7T1ie78jy/M2/LuzjCgdcD0rV/4Q7Xv+gef+/sf+Ncfrd7baJrE+najJ5N3Ft3x4LbdyhhyAQeGB4NdWFoYOnNvDWbt0d9DuvgsN79KSTem99CeWTzMfLjHvTKyv8AhJNJ/wCfsf8AfDf4Uf8ACSaT/wA/Y/74b/Cu1xk9WiJY2i3dzX3mrXr9eGf8JHpJ/wCXsf8AfDf4V6N/wszwf/0F/wDyWl/+Jpckux5+NxFGVuWSfzNy6/4+W/D+VQ1zlx8RfCjzMy6rkHHP2eX0/wB2o/8AhYnhb/oK/wDkvL/8TXM6c7vR/ccHtYd19522i/8AIWg/4F/6Ca6yvNvCvjHQNV8SWllZX/nXEu/YnlSDOEYnkqB0Br0muvDxcYtSVtTixEoyknF30CiiitznCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACuT1r/kLT/8AAf8A0EV1lcnrX/IWn/4D/wCgiufE/CvU6sL8b9DyH4v/APMG/wC23/tOvMBXp/xf/wCYN/22/wDadUPgn/yVzQ/+3j/0RJWuH/howxP8Vnn1Fff9FbGB8AUV6B8bP+Su67/27/8ApPHXn9ABSjqKSlX7w+tAI+2sjPWvl34u8/FDWP8Ath/6JjrergPEp/4n9z/wH/0EV4eWZb9VrOpzXurfiezmGE9jSUr31Meivf8A9mX/AJmj/t0/9rV9AV7h4x8AUV9/18AUAFFFFAHb/CL/AJKho3/bb/0TJX1HXy58Iv8AkqOjf9tv/RMlfUdJlx2CiiipGFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQBy/xF1e+0HwHqWp6bP5F5D5XlybFbbulVTwwIPDEcjvXgn/C3fHP/AEHP/JSH/wCIr234u/8AJL9Z/wC2P/o6OvluqRMnqdx/wtzxz/0HP/JWD/4iqs3xK8W3Exll1Xc7dT9niGeMdlr0D/hnz/qZ/wDyn/8A2ysq8+DH2O7eA6/u24+b7HjOQD03+9TOUEve2NKcajdobnnuseItU1/yf7SufPEO7y/3arjOM/dAz0HX0rqfgn/yV3Qv+3j/ANJ5KyfGHg//AIRQWf8Ap32r7Tv/AOWWzbt2+5znd+la3wT/AOSu6F/28f8ApPJTi4tJx2IqKSk1Lc+v6KKKog+QPjZ/yV3Xf+3f/wBJ468/r0D42f8AJXdd/wC3f/0njrz+gAoHBzRSgZIHrQBr/wDCS6t/z9f+Q1/wqhdXMt5O08zb5Gxk8DoMDp7Cus/4QNf+gkf+/P8A9lXNavp40zUpbTzfM2Y+bbjOQD0yfWpVj0cVhcZSgpV7283fU9v/AGZf+Zo/7dP/AGtX0BXz/wDszf8AM0f9un/tavoCqPOCvgCvv+vgCgAooooA7f4Rf8lR0b/tt/6Jkr6jr5c+EX/JUdG/7bf+iZK+o6TLjsFFFFSMKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigDiPi7/AMkv1n/tj/6Ojr5cr6j+Lv8AyS/Wf+2P/o6OvlyqRD3PtquT1r/kLT/8B/8AQRXWVyetf8haf/gP/oIrlxPwr1O3C/G/Q8h+L/TRv+23/tOqHwT/AOSuaH/28f8AoiSr/wAX/wDmDf8Abb/2nVD4J/8AJXND/wC3j/0RJWuH/howxP8AFZ9fUUUVsYHyB8bP+Su67/27/wDpPHXn9egfGz/kruu/9u//AKTx15/QAUq/eH1pKUdRQCPoL/hD9e/6B5/7+x/415B43s7iw8XXtrdR7JkEeU3A4yikcgkdCK+t884r5e+LnPxQ1j/th/6JSvAyrMq2Kryp1FZJX/E9vMcdVxFFQmlZPp6Hov7Mv/M0f9un/tavoCvAP2Zv+Zo/7dP/AGtXv9e+eIFfAFff9fAFABRRRQB2/wAIv+So6N/22/8ARMlfUdfLnwi/5Kho3/bb/wBEyV9R0mXHYKKKKkYUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAVyetf8haf/gP/AKCK6yuT1r/kLT/8B/8AQRXPifhXqdWF+N+h5F8X+mjf9tv/AGnXl9fRer+HtL17yf7TtfP8nd5f7xl27sZ+6Rn7o6+lUIPh34UeZVbSsqc8faJfT/epUq8IxUXuVWw0pzck0eB0V9Ef8Kz8H/8AQI/8mZf/AIqvOP8AhHNJ/wCfQf8Afbf41v7WI6WWVqt+VrQ89or0L/hG9J/59B/323+NH/CN6T/z6D/vtv8AGj2sTb+xq/df18jz6lH3h9a9Z8LeD9B1LxHaWl3YCSCTfuXzZB0Qkcgg9QK9K/4VH4G6/wBif+TU3/xdcGLzehhpKE07tX0X/BOargalGXLJo8xrgfEuf7euf+A/+givqH/hBvDv/QO/8jyf/FV5d4u8KaJH4nvI1shtXZgea/8AcHvWWX5jRxFRxgrNK+p7NaLzCKo0dGtddrHi9Fejz+GdHXG2zAzn/lo/+NQ/8I3pP/Pp/wCRG/xr1XVinY4ZZJiIuza+/wD4B59RXoP/AAjmk/8APoP++2/xr0f/AIVn4P8A+gR/5My//FUvaxOerllalbma1Pneive5/h14USZlXSsAY4+0S+n+9Uf/AArzwt/0Cv8AyYl/+KqHioJ21Mfqc+6PPvhF/wAlQ0b/ALbf+iZK+o6828LeDtA0rxJaXtlYeTcRb9r+bIcZRgeCxHQmvSauFRTV4mc6cqbtIKKKKogKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK5PWv+QtP/wAB/wDQRXWVyetf8haf/gP/AKCK58T8K9Tqwvxv0KFTWv8Ax8r+P8qhqa1/4+V/H+VccfiR3mjXkFev15BXSj0cD1+QV0PhjwwfEn2rF39n+z7P+WW/Oc+4xjb+tc9XYeBNc0/RTf8A2+48nzfL2fIzbsbs9AfUVy42VWFBul8XSx04mU4026e/39TTTwq3g9hrpvBd/Zf+WPl7N275OuTjG7PQ9Km/4WOcf8gof9//AP7Gresa/pviHS5dK0q5+0Xs+3y49jLnaQx5YADgE8ntXL/8Idr3/QPP/f2P/GvOw0KNeDlj7Kd7K7s7ehjhYUKsW8XpK+l3bT00N3/hY7f9Asf9/wD/AOxrjdb1j+09YnvPI8vzNvy7s4woHXA9K1f+EP17/oHn/v7H/jWDqOnXdlfyW9xFslTG5cqcZAI5Bx0Ir0cLRwdOTeGte3R9DtpUsNTd8Nbm8nfT0uVJZPMx8uMe9MpzIy43DGabXW731Kk25XluFev15BXr9Jnm47p8zOuv+Plvw/lUNTXX/Hy34fyqGuZ/Ezzi/ov/ACFoP+Bf+gmusrk9F/5C0H/Av/QTXWV2Yb4X6nBivjXoFFFFdByhRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABXJ61/wAhaf8A4D/6CK6yuT1r/kLT/wDAf/QRXPifhXqdWF+N+hQqa1/4+V/H+VQ1Na/8fK/j/KuOPxI7zRryCvX68grpR6OB6/IKKKKZ6B0PgjjxhYf9tP8A0W1ex5GetfPdFeTjss+t1FPmtZWOLE4P201K9tLbH0JkdyK8m8Yf8jVe49U/9AWuUr2LwOB/wiFgSB/y0/8ARjVyxo/2U/b35r6W2MqaeAl7X4r6W2PJLn+H8agr0j4jDnTeMf6z/wBkrgpv9U34fzr28LW+s0VWta/Q9Wk/rFL2+176blSvX68gr1+tGeZjunzM66/4+W/D+VQ1Ndf8fLfh/Koa5n8TPOL+i/8AIWg/4F/6Ca6yuT0X/kLQf8C/9BNdZXZhvhfqcGK+NegUUUV0HKFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFcH4iuZY9euUV8KNuBgf3VrvK8+8Tf8jBdf8B/9BWufE/CvU9HLknVaa6FD7Zcf3//AB0UqX1yjhlkwR32j/Cq9FcJ7fs49kXf7Wvv+e//AI4v+FY/9mWf/PH/AMfb/GrdFVzS7lRSjtoVP7Ms/wDnj/4+3+NH9mWf/PH/AMfb/GrdFHNLuVzPuVP7Ms/+eP8A4+3+NH9mWf8Azx/8fb/GrdFHM+4cz7lT+zLP/nj/AOPt/jWxY6vfabaR2tpP5cMedq7QcZJJ5IJ6k1SoqKkVUVpq68yZpTVpak+o3k+reX9uk83y923gDGcZ+6B6CqBsbZlIMeQf9o/41Yopw9yPLHRdlsVCTjHli7LsVP7Ms/8Anj/4+3+NbH9rX3/Pf/xxf8KpUVXNLuTJKW+pYe+uXcs0mSe+0f4Un2y4/v8A/joqCipJ9nHsjb8O3MsmvWyM+VO7IwP7rV3lefeGf+Rgtf8AgX/oLV6DXdhvhfqeJmKSqpJdAoooroPOCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACvPvE3/IwXX/AAH/ANBWvQa8+8Tf8jBdf8B/9BWufE/CvU9LLP4r9P1MmiiiuE90KKKKACiiigAooooAKKKKBJp7BRRRQF0FFFFAwooooA1vDP8AyMFr/wAC/wDQWr0GvPvDP/IwWv8AwL/0Fq9Bruw3wv1PCzP+MvQKKKK6DzQooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArz7xN/wAjBdf8B/8AQVr0GvPvE3/IwXX/AAH/ANBWufE/CvU9LLP4r9P1MmiitDQ7aG81iC3nTfG27cuSM4Ukcj3FcSjdpI9qclCLk9lqZ9Feg/8ACNaR/wA+n/kRv/iq8+q6lKULX6mOHxMa9+VPTuFFFFZnSFFFFAmrqwUUUV2Skqy5Y776nxuGw1TJKjxOJd4vTTV3f3dgooopOahFwe5cMDWx+KjmFJ2g2nZ3vpvpt0CiiiuQ+wCiiigDW8M/8jBa/wDAv/QWr0GvPvDP/IwWv/Av/QWr0Gu7DfC/U8LM/wCMvQKKKK6DzQooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArz7xN/yMF1/wAB/wDQVr0GvPvE3/IwXX/Af/QVrnxPwr1PSyz+K/T9TJrW8M/8jBa/8C/9Basmtbwz/wAjBa/8C/8AQWrkp/EvU9fEfwpejPQa8or1evKK6MV0+Z52Vfa+QUUUVyHrhRShSzAAZJp/kSf3f1FROpGOjaXzGot7If8AZ/8Aa/Sj7Px979Kse9RmRA2GOCPavLp4zE83uPX0uPF5dhcVBQrxuk772K8kfl4+bOfamVNM4bG05xmoa9OlOpUgpVN3uY0sPSw0VSoq0VsgooorQ0CiiigDW8M/8jBa/wDAv/QWr0GvPvDP/IwWv/Av/QWr0Gu7DfC/U8LM/wCMvQKKKK6DzQooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArz7xN/yMF1/wAB/wDQVr0GvPvE3/IwXX/Af/QVrnxPwr1PSyz+K/T9TJrW8M/8jBa/8C/9Basmtbwz/wAjBa/8C/8AQWrkp/GvU9fEfwpejPQa8or1evKK6MV0+Z5uVfa+QUUUVyHsEkH+uH4/yq0OlVYP9cPx/lVodK8jH/xF6HXQ+Fi1Un/1x/D+VR0V14fC+yk5Xvp2MqlXmVrBRRRXYYhRRRQAUUUUAa3hn/kYLX/gX/oLV6DXn3hn/kYLX/gX/oLV6DXdhvhfqeFmf8ZegUUUV0HmhRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABXn3ib/kYLr/AID/AOgrXoNefeJv+Rguv+A/+grXPifhXqelln8V+n6mTWt4Z/5GC1/4F/6C1ZNa3hn/AJGC1/4F/wCgtXJT+Nep6+I/hS9Geg15RXq9eUV0Yrp8zzcq+18gqaFFbduGcYqGpI5PL3fLnPvXnV1J02obnt02k03sTOixoXQYYdDUPnyf3v0FOebehXbjPvUNY4ei+V+1V3fr2LnNX9x6BRRRXYYhRRRQAUUUUAFFFFAGt4Z/5GC1/wCBf+gtXoNefeGf+Rgtf+Bf+gtXoNd2G+F+p4WZ/wAZegUUUV0HmhRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABXn3ib/AJGC6/4D/wCgrXoNefeJv+Rguv8AgP8A6Ctc+J+Fep6WWfxX6fqZNa3hn/kYLX/gX/oLVk1reGf+Rgtf+Bf+gtXJT+Nep6+I/hS9Geg15RXq9eUV0Yrp8zzcq+18gooorkPYCiiigAooooAKKKKACiiigAooooA1vDP/ACMFr/wL/wBBavQa8+8M/wDIwWv/AAL/ANBavQa7sN8L9Twsz/jL0Ciiiug80KKKKACiiigAooooAKKKKAP/2Q==";
