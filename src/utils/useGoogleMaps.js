import { useEffect, useState } from "react";

const SCRIPT_ID = "google-maps-js";

let loadPromise = null;

// Loads the Google Maps JS SDK (Places library) exactly once, however many
// components ask for it. Resolves to false — never rejects — when no API key
// is configured, so callers can degrade to a plain text address input.
function loadGoogleMaps() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return Promise.resolve(false);

  if (window.google?.maps?.places) return Promise.resolve(true);

  if (!loadPromise) {
    loadPromise = new Promise((resolve) => {
      const existing = document.getElementById(SCRIPT_ID);
      if (existing) {
        existing.addEventListener("load", () => resolve(true));
        existing.addEventListener("error", () => resolve(false));
        return;
      }
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  }
  return loadPromise;
}

console.log(loadGoogleMaps());

// Returns true once window.google.maps.places is ready to use, false if
// unconfigured/failed to load, null while still loading.
export function useGoogleMaps() {
  const [loaded, setLoaded] = useState(null);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps().then((ok) => {
      if (!cancelled) setLoaded(ok);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return loaded;
}
