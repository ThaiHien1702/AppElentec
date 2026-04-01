const normalizeBaseUrl = (value) => value?.trim().replace(/\/$/, "");

// Priority: explicit env var > auto-detect current host for LAN/localhost.
export const getApiBaseUrl = () => {
  const envBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_URL);
  if (envBaseUrl) {
    return envBaseUrl;
  }

  if (typeof window !== "undefined") {
    const protocol = window.location.protocol === "https:" ? "https" : "http";
    const host = window.location.hostname || "localhost";
    return `${protocol}://${host}:5001/api`;
  }

  return "http://localhost:5001/api";
};

export default getApiBaseUrl;
