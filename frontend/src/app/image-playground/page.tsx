"use client";
import React, { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import { ArrowUpRightIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function ImagePlaygroundHome() {
  const router = useRouter();
  const [hoverId, setHoverId] = useState<number | null>(null);
  const [images, setImages] = useState<any[]>([]);
  const [error, setError] = useState<any>(null);
  const [loadingImages, setLoadingImages] = useState(false);

  const handleSelectImage = (id: number) => {
    router.push(`/image-playground/${id}`);
  };

  const handleExploreFeatures = () => {
    router.push(`/features-explorer`);
  };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     setLoadingImages(true);
  //     try {
  //       const api = `http://localhost:8000/api/images/1`
  //       const response = await fetcher("/api/images/");
  //       setImages(response.data);
  //     } catch (error) {
  //       setError(error);
  //     } finally {
  //       setLoadingImages(false);
  //     }
  //   };

  //   fetchData();
  // }, []);

  useEffect(() => {
    console.log("Getting top activation images");
    // Fetch image URLs for each feature
    const fetchTopActivationImages = async () => {
      const ids = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        20,
      ];
      try {
        const featureImagePromises = ids.map(async (id: any) => {
          try {
            const res = await fetch(`http://localhost:8000/api/images/${id}`);
            console.log("Response:", res);

            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            console.log("Data:", data);
            const imageUrl = data.image.url;
            return {
              ...id,
              imageUrl, // Use the created URL for the image
            };
          } catch (error) {
            console.error(`Error fetching image for id ${id}:`, error);
            return null;
          }
        });

        const featuresWithImagesData = await Promise.all(featureImagePromises);
        // Filter out any null values that may have occurred due to errors
        const filteredFeatures = featuresWithImagesData.filter(
          (feature) => feature !== null
        );
        setImages(filteredFeatures);
        console.log("Top Activations with Images:", filteredFeatures);
      } catch (error) {
        console.error("Error in fetching top activation images:", error);
      }
    };
    if (images.length == 0) {
      fetchTopActivationImages();
      console.log(images);
    }
  }, []);

  // useEffect(() => {
  //   // console.log("getting images");
  // }, [images]);

  const mock_images: any[] = [
    {
      id: 0,
      url: "https://datasets-server.huggingface.co/assets/m1guelpf/nouns/--/default/train/0/image/image.jpg?Expires=1722879441&Signature=Z8xTkJk6vBHwqPox7ucl8AH4VppewRd5k8CXmqtyqptaClVPvFtlzUFg~fjfjtDds-qGpacj8U1t5Q2-0cmnQGc~zOkb~JKrz0L5QkBjf~~IuVOZq6-Te4CcGpEiAEoFH3v7Ls0noPwKK2B7AZz8JcSv~vesHtjM2l3aopv0WU1NI7AcLjDXFcOnT6B7CC7IAg0Ly0ebJJUz3TRht8FfSvvO9aqZCnnVEoNzzzByuhxOHsuL59ouf12APilxet6cCQV6PC4xyU6YPOf2NZ7~wRZHWJDZn84guM9mp0JOxuDT1jb1gjRR4q30D~kUMrQM29maquBvK6xajxMjd4Jzyw__&Key-Pair-Id=K3EI6M078Z3AC3",
      text: "a pixel art character with square black glasses, a hotdog-shaped head and a peachy-colored body on a warm background",
    },
    {
      id: 1,
      url: "https://datasets-server.huggingface.co/assets/m1guelpf/nouns/--/default/train/1/image/image.jpg?Expires=1722879441&Signature=Osw~MxqolH-BhqSrjiJEonzrEK50jkBIWlmHkwkK9RNLMW5vCnJuSae6m3wEcesAZrm4gE19cgxf9mCiZG9-Y2ZrS82QF7tPyaTSr9pvIAvJ-8NpbnWoGQtdM81pArngJ8cpe2AMZupa7OTMhK6ElrCgpSUjLD0WE--Fi8pmocqXA0QXCy2LT8ytfIeaBF2cDloYETOeuoqcarr31bbxP8H5DLOwIE7OkyV6HuiSe56H0npYRqAOM2DcUtsFcX8ygpOo~lqaWQUiJ1kCCP19VwpEUafoDivgdBNFUhZM7utXGgK0kSQHS25~V5NeM~ZQHxSxPKUAkmAxjoldFYvyxg__&Key-Pair-Id=K3EI6M078Z3AC3",
      text: "a pixel art character with square black sunglasses, a shower-shaped head and a blue-colored body on a cool background",
    },
    {
      id: 2,
      url: "https://datasets-server.huggingface.co/assets/m1guelpf/nouns/--/default/train/2/image/image.jpg?Expires=1722879441&Signature=EwaSRDU691uk4E9AdcJlyG8XCLjB2GF8F1-LAIPN5FY6wCaFp~GtS6TLsIxqkqcrt6PwKPksjZ4ReVmK9CJKBBeX~M2loaHOkfAA3GY1DtSWt6C9tD7Jl1t8WfNHGnwId0i6EnG8kAQDiiknVlt4q07ghEr2PlePK6EZv1a6sVYA9xzgbrbcNFVbmhBdhS82CXr6A8NW-QMVqwhYtfQPjByWvyYxHrGTAFLnu3CGyj2t-O7Z7UjaT5IGjnaRgiBAkUmmiKjsFM-ATkB8WcRxpoXGkLucQOL82MdR4hZ2kXfKzu5EZ60qQk86GXmQiakofOeDDWJzLG6wppAlInF2wg__&Key-Pair-Id=K3EI6M078Z3AC3",
      text: "a pixel art character with square dark green glasses, a yeti-shaped head and a redpinkish-colored body on a cool background",
    },
    {
      id: 3,
      url: "https://datasets-server.huggingface.co/assets/m1guelpf/nouns/--/default/train/3/image/image.jpg?Expires=1722879441&Signature=Hbh6GRnVSfTQB2XEV15oioZc1MzRhF79mEiDVzQ3qy0OEzdy3pCjWT5xGzClauGLPaKPyRSFu4VPWlD6zHbHQXhvRqJJAbMsD~ju5nVKuiJDRJ6ufV~N6NsFpmEG8NWqhPqZqxDLWrY~Zub82lzJyC2oSTp-ALHffNrhO8~FR~kNCLgNm6MF-lIj0I4xszgpSde621AN7D04GpgfeP~utZGgJNOW1k4TRIZ0djdzeR3sPv78o0pFjjgCOki7hH-FBPw0AAfw-xJc8ZEr-~zq7a9gafsD9PcX-xoytZ8yLP0iOS4Nm2AYJ~ZYOJNX05N~xnAaHEIad6ETxgidB14f~Q__&Key-Pair-Id=K3EI6M078Z3AC3",
      text: "a pixel art character with square dark gray glasses, a void-shaped head and a teal-colored body on a warm background",
    },
    {
      id: 4,
      url: "https://datasets-server.huggingface.co/assets/m1guelpf/nouns/--/default/train/4/image/image.jpg?Expires=1722879441&Signature=zPa2IUqvqKvrOFyAygIqf~0pNYcQqHbuRFIGtZ9f1c4MrwUJc5D2AbZ0Ypr81HrdYfhOS8x0Q2eejVPWBD-yg9tV6~UuABiDVD3oC~1Zgqk3jIZl9gBt8hNrD5MPvwt00k4lyrdzrxzXn12hoUq1Q3vm5NdIkmWAiiRDvW9ZmbicoLr0YHPliulpmDKn9tWiLpRBstQ5oCXygwGg9kI1b7xveP~VhtXZg5CtJWCokN8AouMyeNe4klSlNT0q417ZO~AafSwR6NRuPEk2VwNyNf6OcISBkIEsI4Wo23F~-t6FIi0h0AyFCz-wILJytwNolTwPe~AHLoF3Wpl2Q~Fktw__&Key-Pair-Id=K3EI6M078Z3AC3",
      text: "a pixel art character with square dark green glasses, a rainbow-shaped head and a orange-colored body on a cool background",
    },
    {
      id: 5,
      url: "https://datasets-server.huggingface.co/assets/m1guelpf/nouns/--/default/train/5/image/image.jpg?Expires=1722879441&Signature=fKcIOOHvIBuhYqXr5ueS4upl-q~zQsUUIs~~RoS~fLNFwjy0aY3-yBqv4yk3vH10k2MDyoAmw-2taBDoyHOazY60Sh6K5D~qrgbKvmr5jssm56UOVUhsQu9MYWFIY-zTS33PcPieFkIT-IQct~3kmRAzNtNVl1CWlSDBEsMtvmGpSSNrJglddGGl9qaRpV9dPKVFggIhYJUFv2JUxFNeHj9PiM1LQAVQJVkXVjpQTjxWq36KKGBMp4FKbZgxtbtnrQ8z~sgoe4SMOUNCsalL8Y8xUFOd5co~oRPgq4TaLzBrjfEjgfSLRsMOXRhgd835HnGxflmkGwgKtEs3c8bWkg__&Key-Pair-Id=K3EI6M078Z3AC3",
      text: "a pixel art character with square blue glasses, a couch-shaped head and a gold-colored body on a cool background",
    },
    {
      id: 6,
      url: "https://datasets-server.huggingface.co/assets/m1guelpf/nouns/--/default/train/6/image/image.jpg?Expires=1722879441&Signature=gTdoP-K5Vqz5~MbfzDmP8ePBYihRBwTkz-gxdaeizzToLvMVMkCUsWoaMcY057jQ7dSIuu-ruD-Gyqcb5VdzwhFqYfpZ-o17Fh27lMq1bn3InJOzbSzhLctNc4GY3KmsMNgiT25a0abERYJYB9SO4kE6e5n2CYvtQDpH8JecUZJ9q9Vwdk9v0VSIniXHpJV8-PdCV~d1WZnpZSc-wNbiz2kuC9L9YV0Y1bDbZiAftoTvrTNH4TLTv9ilOPzAbiQCve9KwXfMJgfV6fwg50SSn1jRvQdEuj4sh6YlAkBA8acFEsKjEQQ6-AJqq3jSl804~6cAywkz6O9ZD5wyDEfAcA__&Key-Pair-Id=K3EI6M078Z3AC3",
      text: "a pixel art character with square orange glasses, a chef hat-shaped head and a purple-colored body on a cool background",
    },
    {
      id: 7,
      url: "https://datasets-server.huggingface.co/assets/m1guelpf/nouns/--/default/train/7/image/image.jpg?Expires=1722879441&Signature=PLehD1~JdqSxH4vDEjQ8VKVIXBc~T453HoQ1Nj5sc~vXgpkDJzhP-VuYVmQyf3ViaMNgNoianlULjbvN3ZR1Xix1Nn8qUUxGM1zDs5Xk13kzv3IyaAHAPBi2gCZI4WEJtw92scZG4jPFcBfUSxWU-TfKYBcjTFVy8Io7PRQnBfHgZcs4achyzrO4Iupbtlz1-vfQVS~B~7TtBViLdh7Q97SNI1FMqayzsIDVRYkxDxkQOkW4EBoOJ7jBYhSvZVjDSwm802Q0Z9vSvSkEyhPdTGxKOTyjNTpSGyptgztukHn-WDlzMTQMagQV2lDuk7g1QEo6pPKlLxnjamvT2Tt8PA__&Key-Pair-Id=K3EI6M078Z3AC3",
      text: "a pixel art character with square red glasses, a blackhole-shaped head and a teal-colored body on a cool background",
    },
    {
      id: 8,
      url: "https://datasets-server.huggingface.co/assets/m1guelpf/nouns/--/default/train/8/image/image.jpg?Expires=1722879441&Signature=er3gQzfIWAs6JNfpUkNjK0TfwJ59OnqzZdzGh1uYkcZ8A~rW6ksAXWVXFdV6P1lL7zTpd3UdqawCfRdktzMg2afUUT4HZ0u0MFINjc3dQ5g0pKa-MY7VcQt8tN7lVwz3GzOhi1mHoiFjrxq0yIKzq8iffvjRr9WuDYhCKXUuaHO3iytbajq4YfT5U074IDYNRu1auD164NJTmpdZ~-VsZhA~L6jFAhHxWjzYmYosy6khjOw0qR4RpODcS2FBna~UzijAqI8gVsAeYcmphjBT5Hry8Y-SFxcdqH-iLS-s~JPKt7wSSYlb02t-vRwLxKqH8FJ~qrVl2V-mw~sBsDsEEQ__&Key-Pair-Id=K3EI6M078Z3AC3",
      text: "a pixel art character with square dark green glasses, a ufo-shaped head and a darkbrown-colored body on a cool background",
    },
    {
      id: 9,
      url: "https://datasets-server.huggingface.co/assets/m1guelpf/nouns/--/default/train/9/image/image.jpg?Expires=1722879441&Signature=JQSqYNRt7ZZclj-TVdaB5L3W1V-CUJB9BowKKm4mWmDs0Hx2HJGBS6T6Jb1zEW0BVFiCGiJJrByFiBxYSMQWPoVRiKeZ0w6OOxn-bR6-iilrGwI1EOtRrqyiJAFxL4VZ6Fx~WaHWrkprCRsCIx-0mItAqPG8GIgmFe3kXshyfUJMmmLkG9SpOIhxkqYF5JaNca0I5Ul9CPe2oLXcXGfyR3pmZ~QqZE1UDTmoLRrvtu27c-gSIT3RiMFCiqOYR0cPmecPzfv36tCTKAv6no87fm6sODdUtj3GQDtTMD02n8tqBVRBoWyVcTFizEgoxRWBv8XlfFcM20JpAezkw6uBWw__&Key-Pair-Id=K3EI6M078Z3AC3",
      text: "a pixel art character with square brown glasses, a crocodile-shaped head and a blue-colored body on a cool background",
    },
  ];

  return (
    <div className="min-h-screen bg-white pb-4">
      <div className="w-full flex flex-col items-center justify-center">
        <div className="max-w-2xl w-[672px] flex flex-row items-center justify-between font-medium text-sm pt-4">
          <p className="cursor-default" onClick={() => router.push("/")}>
            Swiggle
          </p>
          <p className="text-gray-500 cursor-default">Image Playground.</p>
        </div>
        <div className="max-w-2xl w-full mx-auto py-6 mt-[64px]">
          <h1 className="text-2xl font-medium text-gray-900">
            Explore Dataset
          </h1>
          <p className="text-sm mt-5 text-gray-500">
            An interface for interpreting and exploring the features from the
            VAE latent space to create new characters. Trained on almost 50,000
            Nouns pixel art characters.{" "}
            <span className="font-semibold">
              Select an image to edit its features.
            </span>
          </p>
          {/* <button
            className="flex flex-row items-center mt-5 px-4 py-2 border rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-600"
            onClick={() =>
              window.open(
                "https://huggingface.co/datasets/m1guelpf/nouns",
                "_blank"
              )
            }>
            View on HuggingFace
            <ArrowUpRightIcon
              height={14}
              width={14}
              strokeWidth={2}
              className="ml-1"
            />
          </button> */}
          <button
            className="flex flex-row items-center mt-5 px-4 py-2 border rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-600"
            onClick={() => handleExploreFeatures()}>
            Explore Features
            <ArrowRightIcon
              height={14}
              width={14}
              strokeWidth={2}
              className="ml-1"
            />
          </button>
        </div>
      </div>
      {mock_images.length > 0 && (
        <div className="grid grid-cols-5 gap-1 mt-10 mx-4">
          {mock_images.map((image, index) => (
            <div
              key={index}
              className="flex relative justify-center cursor-pointer"
              onClick={() => handleSelectImage(index)}
              onMouseEnter={() => setHoverId(index)}
              onMouseLeave={() => setHoverId(null)}>
              <img
                src={image.url}
                alt={`Image ${index + 1}`}
                className="w-[20wh] h-[20wh] max-w-[20wh] object-cover border border-gray-100 rounded-md"
              />
              {/* <img
                src={image.imageUrl}
                alt={`Image ${index + 1}`}
                className="w-200px h-[200px] min-w-[200px] min-h-[200px] object-cover border border-gray-100 rounded-md"
              /> */}
              {hoverId === image.id && (
                <div className="absolute inset-0 bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg flex items-center justify-center rounded-md px-4 text-center border border-gray-100">
                  <p className="text-gray-700 font-medium text-sm">
                    {image.text}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImagePlaygroundHome;
