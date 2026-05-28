"use client";

import { useEffect, useRef } from "react";
import type { Map as MapboxMap, LngLatBoundsLike } from "mapbox-gl";

interface MediaPin {
  id: string;
  title: string;
  slug: string | null;
  lat: number;
  lng: number;
  mediaType: string | null;
  region: string | null;
}

interface MediaMapProps {
  pins: MediaPin[];
  className?: string;
}

const MENA_CENTER: [number, number] = [45.0, 25.0];
const MENA_ZOOM = 4;

const TYPE_COLORS: Record<string, string> = {
  NEWSPAPER: "#3b82f6",
  MAGAZINE: "#8b5cf6",
  TV: "#ef4444",
  RADIO: "#f59e0b",
  OUTDOOR: "#10b981",
  ONLINE: "#06b6d4",
  CINEMA: "#ec4899",
};

export default function MediaMap({ pins, className = "" }: MediaMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    let cancelled = false;

    import("mapbox-gl").then((mapboxgl) => {
      if (cancelled || !containerRef.current) return;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        accessToken: token,
        style: "mapbox://styles/mapbox/light-v11",
        center: MENA_CENTER,
        zoom: MENA_ZOOM,
      });

      map.addControl(new mapboxgl.NavigationControl(), "top-right");

      map.on("load", () => {
        if (cancelled) return;

        map.addSource("media", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: pins.map((p) => ({
              type: "Feature",
              geometry: { type: "Point", coordinates: [p.lng, p.lat] },
              properties: { ...p },
            })),
          },
        });

        map.addLayer({
          id: "media-pins",
          type: "circle",
          source: "media",
          paint: {
            "circle-radius": 8,
            "circle-color": [
              "match",
              ["get", "mediaType"],
              ...Object.entries(TYPE_COLORS).flatMap(([k, v]) => [k, v]),
              "#6b7280",
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        });

        const popup = new mapboxgl.Popup({ closeButton: false, maxWidth: "280px" });

        map.on("mouseenter", "media-pins", (e) => {
          map.getCanvas().style.cursor = "pointer";
          const feature = e.features?.[0];
          if (!feature) return;
          const props = feature.properties as MediaPin;
          popup
            .setLngLat(feature.geometry as unknown as [number, number])
            .setHTML(
              `<div style="padding:8px;font-family:system-ui;font-size:13px">
                <strong>${props.title}</strong>
                ${props.mediaType ? `<br><span style="color:#6b7280">${props.mediaType}</span>` : ""}
                ${props.region ? `<br><span style="color:#6b7280">${props.region}</span>` : ""}
                ${props.slug ? `<br><a href="/media/${props.slug}" style="color:#2563eb">View details →</a>` : ""}
              </div>`
            )
            .addTo(map);
        });

        map.on("mouseleave", "media-pins", () => {
          map.getCanvas().style.cursor = "";
          popup.remove();
        });

        if (pins.length > 0) {
          const bounds = new mapboxgl.LngLatBounds();
          pins.forEach((p) => bounds.extend([p.lng, p.lat]));
          map.fitBounds(bounds as LngLatBoundsLike, { padding: 50, maxZoom: 12 });
        }
      });

      mapRef.current = map;
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [pins]);

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <div className={`flex items-center justify-center rounded-xl border bg-gray-50 text-sm text-muted-foreground ${className}`}>
        Mapbox token not configured
      </div>
    );
  }

  return <div ref={containerRef} className={`rounded-xl overflow-hidden ${className}`} />;
}
