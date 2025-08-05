/*  WorldMap.tsx  */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/* ────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────── */
interface SampleLocation {
  id: string;
  accession: string;
  sample_name?: string;
  latitude: number;
  longitude: number;
  sample_count?: number;
}

/* ────────────────────────────────────────────────────────────
   1. Fetch all sample locations once
   ──────────────────────────────────────────────────────────── */
function useSampleLocations() {
  const [data, setData] = useState<SampleLocation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();

    (async () => {
      try {
        const r = await fetch("/api/map/sample-locations?all=true", {
          signal: ctrl.signal,
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const { data } = await r.json();
        setData(data);
      } catch (e: any) {
        if (!ctrl.signal.aborted) setError(e.message);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, []);

  return { data, error, loading };
}

/* ────────────────────────────────────────────────────────────
   2.  One-time loader (Leaflet + markercluster + CSS)
       – caches the promise so every call re-uses it
   ──────────────────────────────────────────────────────────── */
const loadLeaflet = (() => {
  let cached: Promise<any> | null = null;

  return () => {
    if (cached) return cached;

    cached = (async () => {
      /*  Load UMD build – sets globalThis.L (mutable, extensible) */
      await import("leaflet/dist/leaflet.js");
      await import("leaflet/dist/leaflet.css");

      const L: any = (globalThis as any).L;

      /*  Load marker-cluster plugin and its styles                 */
      await import("leaflet.markercluster");
      await import("leaflet.markercluster/dist/MarkerCluster.css");
      await import(
          "leaflet.markercluster/dist/MarkerCluster.Default.css"
          );

      /*  Fix default icon paths (Next.js / Vite require absolute)  */
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      return L;
    })();

    return cached;
  };
})();

/* ────────────────────────────────────────────────────────────
   3.  Hook: turns the div in containerRef into a map
   ──────────────────────────────────────────────────────────── */
function useLeafletMap(
    containerRef: React.RefObject<HTMLDivElement>,
    points: SampleLocation[]
) {
  useEffect(() => {
    if (!containerRef.current || points.length === 0) return;

    let map: any;
    let cluster: any;

    loadLeaflet().then((L) => {
      if (!containerRef.current) return; // unmounted meanwhile

      /*  Create map  */
      map = L.map(containerRef.current, {
        center: [0, 0],
        zoom: 3,
        minZoom: 2,
        maxZoom: 10,
        worldCopyJump: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        noWrap: true,
        maxZoom: 10,
      }).addTo(map);

      /*  Cluster layer  */
      cluster = L.markerClusterGroup({ chunkedLoading: true }).addTo(map);

      /*  Add markers in 500-item batches  */
      const batch = 500;
      for (let i = 0; i < points.length; i += batch) {
        points.slice(i, i + batch).forEach((p) =>
            L.marker([p.latitude, p.longitude])
                .bindPopup(
                    `<strong>${p.sample_name ?? "Sample"}</strong><br/>${
                        p.accession
                    }`
                )
                .addTo(cluster)
        );
      }
    });

    /*  Cleanup on unmount  */
    return () => {
      map?.off();
      map?.remove();
    };
  }, [containerRef, points]);
}

/* ────────────────────────────────────────────────────────────
   4.  WorldMap component
   ──────────────────────────────────────────────────────────── */
export function WorldMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data, error, loading } = useSampleLocations();

  useLeafletMap(containerRef, data);

  return (
      <Card className="w-full flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-center">
            Global BGC Distribution
          </CardTitle>
        </CardHeader>

        <CardContent>
          {loading && (
              <p className="text-center p-4">Loading map… please wait</p>
          )}
          {error && (
              <p className="text-center text-red-500 p-4">Error: {error}</p>
          )}
          <div
              ref={containerRef}
              className="w-full rounded-md"
              style={{ height: 1000 }}
          />
        </CardContent>
      </Card>
  );
}
