import useSWR from "swr";

export const useGetFeatures = () => {
  const fetcher = async () => {
    const api = "http://localhost:8000/api/features";
    const res = await fetch(api);
    const json = await res.json();
    const features = json.features;

    return features;
  };

  return useSWR("features", fetcher, {
    revalidateOnFocus: false, 
    revalidateOnReconnect: false, 
    refreshInterval: 0,
  }); 
};

export const useGetFeatureById = (featureId: number) => {
  const fetcher = async () => {
    const api = `http://localhost:8000/api/features/${featureId}`;
    const res = await fetch(api);
    const json = await res.json();
    const features = json.feature;

    return features;
  };

  const key = `features:${featureId}`;
  return useSWR(key, fetcher, {
    revalidateOnFocus: false, 
    revalidateOnReconnect: false, 
    refreshInterval: 0,
  });
};
