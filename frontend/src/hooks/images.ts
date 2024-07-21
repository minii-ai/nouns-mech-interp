import useSWR from "swr";

export const useGetImageDataById = (imageId: number) => {
  const fetcher = async () => {
    const api = `http://localhost:8000/api/images/${imageId}`;
    const res = await fetch(api);
    const json = await res.json();

    const image = json.image;
    return image;
  };

  const key = `images:${imageId}`;

  return useSWR(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 0,
  });
};
