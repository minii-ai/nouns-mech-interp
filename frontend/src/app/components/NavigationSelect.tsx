import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const useCurrentRoute = () => {
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    // Function to update the path
    const updatePath = () => {
      setCurrentPath(window.location.pathname);
    };

    // Set the initial path
    updatePath();

    // Listen for changes in the URL
    window.addEventListener("popstate", updatePath);

    // Cleanup the event listener
    return () => {
      window.removeEventListener("popstate", updatePath);
    };
  }, []);

  return currentPath;
};

const NavigationSelect = () => {
  const router = useRouter();
  const pathname = useCurrentRoute();

  const getCurrentValue = () => {
    if (pathname.startsWith("/features-explorer")) return "Features Explorer";
    if (pathname.startsWith("/image-playground")) return "Image Playground";
    return "";
  };

  const handleChange = (event) => {
    const value = event.target.value;
    if (value === "Features Explorer") router.push("/features-explorer");
    if (value === "Image Playground") router.push("/image-playground/0");
  };

  return (
    <select
      value={getCurrentValue()}
      onChange={handleChange}
      className="p-1 border rounded text-sm"
    >
      <option value="Features Explorer">Features Explorer</option>
      <option value="Image Playground">Image Playground</option>
    </select>
  );
};

export default NavigationSelect;
