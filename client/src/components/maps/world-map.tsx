"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// This component handles Leaflet map initialization and cleanup
// We create a container element for the map and ensure proper cleanup on unmount
export function WorldMap() {
  // Reference to the map instance
  const mapInstanceRef = useRef<any>(null);
  // Reference to the container div
  const containerRef = useRef<HTMLDivElement>(null);
  // Reference to track if the component is mounted
  const isMountedRef = useRef(false);

  useEffect(() => {
    // Mark component as mounted
    isMountedRef.current = true;

    // Skip if window is not defined (SSR) or if the container ref is not available
    if (typeof window === "undefined" || !containerRef.current) return;

    // Create a new div element that will be used as the map container
    const mapContainer = document.createElement('div');
    mapContainer.style.width = '100%';
    mapContainer.style.height = '100%';
    mapContainer.className = 'leaflet-container';

    // Clear any existing content and append the new container
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(mapContainer);
    }

    // Load Leaflet and initialize the map
    let cleanupFunction: (() => void) | undefined;

    const initializeMap = async () => {
      try {
        // Dynamic import of Leaflet
        const L = (await import("leaflet")).default;

        // Only proceed if the component is still mounted
        if (!isMountedRef.current) return;

        // Calculate the appropriate zoom level based on container width
        const calculateZoomLevel = () => {
          if (!containerRef.current) return 2; // Default zoom level

          const containerWidth = containerRef.current.clientWidth;

          // The world's width in pixels at zoom level 0 is 256 pixels
          // Each zoom level doubles the size, so at zoom level 1 it's 512 pixels, etc.
          // We want to find the zoom level where the world's width fits the container width

          // Calculate the zoom level where the world map width matches the container width
          // Formula: containerWidth = 256 * 2^zoom
          // Therefore: zoom = log2(containerWidth / 256)
          const worldWidthAtZoom0 = 256;

          // Add a buffer to ensure the map fills the container width
          // This helps eliminate gray areas on the sides
          // Use a larger buffer for wider screens
          const bufferFactor = containerWidth > 1000 ? 1.1 : 1.05; // 10% for wide screens, 5% for smaller screens
          const adjustedWidth = containerWidth * bufferFactor;

          let zoomLevel = Math.log2(adjustedWidth / worldWidthAtZoom0);

          // Round up instead of down to ensure the map is slightly larger than the container
          zoomLevel = Math.ceil(zoomLevel);

          // Ensure zoom level is within bounds (2-10)
          return Math.max(2, Math.min(10, zoomLevel));
        };

        // Get initial zoom level
        const initialZoom = calculateZoomLevel();

        // Initialize the map with options to limit zoom
        const map = L.map(mapContainer, {
          minZoom: 2, // Prevent zooming out too far
          maxZoom: 10, // Limit zoom-in to city level
          maxBounds: [[-90, -180], [90, 180]], // Restrict panning to one world
          maxBoundsViscosity: 1.0, // Make the bounds completely solid
          bounceAtZoomLimits: true, // Bounce effect when hitting zoom limits
          worldCopyJump: true, // Helps with display when panning near the edge
          fadeAnimation: true, // Smooth transitions
        }).setView([0, 0], initialZoom); // Center at equator for better display

        // Store the map instance
        mapInstanceRef.current = map;

        // Add the tile layer
        const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 10,
          noWrap: true, // Prevents the map from repeating horizontally
        }).addTo(map);

        // Function to adjust the map to fill the container width
        const adjustMapToFillContainer = () => {
          if (!isMountedRef.current || !map) return;

          // Force a redraw of the map
          map.invalidateSize();

          // Calculate the optimal zoom level
          const newZoom = calculateZoomLevel();

          // Only change zoom if needed
          if (newZoom !== map.getZoom()) {
            map.setZoom(newZoom);
          }

          // Ensure the map is centered
          map.setView(map.getCenter(), map.getZoom(), { animate: false });
        };

        // Handle window resize
        const handleResize = () => {
          if (isMountedRef.current && map) {
            // Use a short timeout to ensure the container has been resized
            setTimeout(adjustMapToFillContainer, 100);
          }
        };

        // Add event listener for when the map is fully loaded
        map.on('load', adjustMapToFillContainer);

        // Add event listener for when tiles are loaded
        tileLayer.on('load', adjustMapToFillContainer);

        // Call resize after a short delay to ensure proper rendering
        const resizeTimeout = setTimeout(handleResize, 100);

        // Add a final check after a longer delay to catch any edge cases
        const finalCheckTimeout = setTimeout(() => {
          if (isMountedRef.current && map) {
            // Force one final adjustment after everything has settled
            adjustMapToFillContainer();

            // Add a specific check for gray areas
            const containerWidth = containerRef.current?.clientWidth || 0;
            const mapWidth = mapContainer.clientWidth;

            // If the map is still narrower than the container, increase zoom by 1
            if (mapWidth < containerWidth && map.getZoom() < 10) {
              map.setZoom(map.getZoom() + 1);
            }
          }
        }, 1000);
        window.addEventListener('resize', handleResize);

        // Define cleanup function
        cleanupFunction = () => {
          window.removeEventListener('resize', handleResize);
          clearTimeout(resizeTimeout);
          clearTimeout(finalCheckTimeout);

          if (map) {
            try {
              // Remove all event listeners and layers
              map.eachLayer((layer: any) => {
                if (layer.remove) {
                  layer.remove();
                }
              });
              map.off();
              map.remove();
            } catch (e) {
              console.error("Error cleaning up map:", e);
            }
          }

          // Clear references
          mapInstanceRef.current = null;
        };
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    // Initialize the map
    initializeMap();

    // Cleanup function
    return () => {
      isMountedRef.current = false;

      if (cleanupFunction) {
        cleanupFunction();
      }

      // Remove the map container from the DOM
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []); // Only run once on mount

  return (
    <Card className="w-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-center">Global BGC Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={containerRef}
          className="w-full rounded-md"
          style={{ height: "1000px", zIndex: 0 }}
        />
      </CardContent>
    </Card>
  );
}
