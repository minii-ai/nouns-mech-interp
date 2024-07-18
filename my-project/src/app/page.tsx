"use client";
import { useRouter } from "next/navigation";
import React from "react";
import twitterLogo from "../../public/logo-black.png";

const logo: string = twitterLogo as unknown as string;

const About: React.FC = () => {
  const router = useRouter();

  const handleGotoFeatures = () => {
    router.push(`/features-explorer`);
  };

  const handleGotoPlayground = () => {
    router.push(`/image-playground`);
  };

  return (
    <div className="w-full flex items-center justify-center bg-white pb-8">
      <div className="max-w-2xl pt-4">
        <h1 className="text-sm font-medium mb-6">Swiggle</h1>
        <div className="mb-[64px] mt-[100px]">
          <h1 className="text-2xl font-medium mb-6">
            Diffusion Interpretability Research
          </h1>
          <p className="text-sm mb-6">
            Playground for interpreting and exploring the features from the VAE
            latent space. <br />
            Playground for interpreting and exploring the features from the VAE
            latent space.
          </p>
          <div className="flex space-x-4">
            <button
              className="px-4 py-2 border rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-600"
              onClick={() => handleGotoFeatures()}>
              Feature Explorer →
            </button>
            <button
              className="px-4 py-2 border rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-600"
              onClick={() => handleGotoPlayground()}>
              Image Playground →
            </button>
          </div>
        </div>

        <section className="mb-8">
          <h2 className="text-xl font-medium mb-5">Creative Control.</h2>
          <p className="text-sm mb-4 text-gray-500">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </p>
          <div className="border rounded-lg p-4 flex items-center justify-center h-72"></div>
          <p className="text-sm text-gray-500 mt-2">Control Demo</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-medium mb-5">Security.</h2>
          <p className="text-sm mb-4 text-gray-500">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </p>
          <div className="border rounded-lg p-4 flex items-center justify-center h-72"></div>
          <p className="text-sm text-gray-500 mt-2">Security Demo</p>
        </section>

        <footer className="flex items-center justify-center">
          <button className="flex flex-row items-center px-5 py-3 border rounded-full hover:bg-gray-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-twitter-x"
              viewBox="0 0 16 16">
              <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
            </svg>
            <p className="ml-2">@Swiggle</p>
          </button>
        </footer>
      </div>
    </div>
  );
};

export default About;
