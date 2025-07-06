"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


// Debounce function to limit how often a function can be called
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Interface for sample location data
interface SampleLocation {
  id: string;
  accession: string;
  sample_name?: string;
  latitude: number;
  longitude: number;
  sample_count?: number; // For clustered points
}

// Interface for API response
interface SampleLocationsResponse {
  data: SampleLocation[];
  total: number;
  limit: number;
  offset: number;
}

// This component handles Leaflet map initialization and cleanup
// We create a container element for the map and ensure proper cleanup on unmount
export function WorldMap() {
  // Reference to the map instance
  const mapInstanceRef = useRef<any>(null);
  // Reference to the marker cluster group
  const markerClusterRef = useRef<any>(null);
  // Reference to the container div
  const containerRef = useRef<HTMLDivElement>(null);
  // Reference to track if the component is mounted
  const isMountedRef = useRef(false);
  // State to store sample locations
  const [sampleLocations, setSampleLocations] = useState<SampleLocation[]>([]);
  // State to track loading status
  const [isLoading, setIsLoading] = useState(true);
  // State to track loading progress
  const [loadingProgress, setLoadingProgress] = useState(0);
  // State to track error status
  const [error, setError] = useState<string | null>(null);
  // Use refs instead of state for map bounds and zoom to avoid re-renders
  const mapBoundsRef = useRef<number[]>([]);
  const mapZoomRef = useRef<number>(2);
  // State to track total samples
  const [totalSamples, setTotalSamples] = useState<number>(0);
  // State to track loaded samples
  const [loadedSamples, setLoadedSamples] = useState<number>(0);
  // Ref to track if a fetch is in progress to prevent concurrent fetches
  const isFetchingRef = useRef<boolean>(false);

  // Function to fetch all sample locations at once
  const fetchSampleLocations = useCallback(async () => {
    // If a fetch is already in progress, skip it
    if (isFetchingRef.current) {
      console.log('Fetch already in progress, skipping new request');
      return null;
    }

    try {
      // Set fetching flag to true
      isFetchingRef.current = true;
      setIsLoading(true);

      // Request all samples at once with the all=true parameter
      const url = `/api/map/sample-locations?all=true`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch sample locations: ${response.status}`);
      }

      const data: SampleLocationsResponse = await response.json();

      // Update state with all data
      setSampleLocations(data.data);
      setTotalSamples(data.total);
      setLoadedSamples(data.data.length);
      setLoadingProgress(100);
      setIsLoading(false);

      // Reset fetching flag when done
      isFetchingRef.current = false;

      return data;
    } catch (err) {
      console.error('Error fetching sample locations:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsLoading(false);
      // Reset fetching flag on error
      isFetchingRef.current = false;
      return null;
    }
  }, []);

  // Initial data load - get all sample locations once
  useEffect(() => {
    fetchSampleLocations();
  }, [fetchSampleLocations]);


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

        // Also import Leaflet CSS
        await import("leaflet/dist/leaflet.css");

        // Fix Leaflet default icon paths
        // Make sure to properly initialize the default icon
        delete L.Icon.Default.prototype._getIconUrl;

        // Set the icon paths using the full URL
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        // Create a test icon to ensure the icon system is initialized
        const defaultIcon = new L.Icon.Default();

        // Import MarkerCluster
        const MarkerCluster = await import("leaflet.markercluster");
        await import("leaflet.markercluster/dist/MarkerCluster.css");
        await import("leaflet.markercluster/dist/MarkerCluster.Default.css");

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
        // Use a fixed initial zoom level to avoid calculation issues
        const fixedInitialZoom = 3; // Use a moderate zoom level that works well for most screen sizes

        const map = L.map(mapContainer, {
          minZoom: 2, // Prevent zooming out too far
          maxZoom: 10, // Limit zoom-in to city level
          maxBounds: [[-90, -180], [90, 180]], // Restrict panning to one world
          maxBoundsViscosity: 1.0, // Make the bounds completely solid
          bounceAtZoomLimits: true, // Bounce effect when hitting zoom limits
          worldCopyJump: true, // Helps with display when panning near the edge
          fadeAnimation: true, // Smooth transitions
          zoomSnap: 1, // Snap to integer zoom levels
          zoomDelta: 1, // Use integer zoom increments
        }).setView([0, 0], fixedInitialZoom); // Center at equator with fixed zoom level

        // Store the map instance
        mapInstanceRef.current = map;

        // Add the tile layer
        const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 10,
          noWrap: true, // Prevents the map from repeating horizontally
        }).addTo(map);

        // Create marker cluster group with settings for more flexible clustering
        // @ts-ignore - TypeScript doesn't recognize the markerClusterGroup plugin
        const markerCluster = L.markerClusterGroup({
          chunkedLoading: true,
          chunkInterval: 100,   // Process more markers in each internal chunk
          chunkDelay: 5,        // Smaller delay between internal chunks
          maxClusterRadius: 60, // Smaller radius to create more distributed clusters
          spiderfyOnMaxZoom: true, // Spider out markers when clicking a cluster at max zoom
          showCoverageOnHover: true, // Show the area covered by a cluster on hover
          zoomToBoundsOnClick: true,
          // Never disable clustering - always show clusters with numbers
          // disableClusteringAtZoom: 8, 
          removeOutsideVisibleBounds: true, // Remove markers outside the visible bounds
          animate: false        // Disable animations for better performance
        });

        // Add the cluster to the map immediately
        map.addLayer(markerCluster);

        markerClusterRef.current = markerCluster;


        // Add sample location markers if available
        if (sampleLocations.length > 0) {
          // Create markers in batches to avoid freezing
          const addMarkersInBatches = (locations: SampleLocation[], batchSize = 500) => {
            let i = 0;

            function addBatch() {
              const end = Math.min(i + batchSize, locations.length);
              const batch = locations.slice(i, end);

              // Create an array to hold all markers in this batch
              const markers = [];

              batch.forEach(location => {
                // Create a marker for each individual sample
                const marker = L.marker([Number(location.latitude), Number(location.longitude)], { 
                  icon: new L.Icon.Default() 
                });

                // Add a popup with sample information
                const popupContent = `
                  <div>
                    <h3>${location.sample_name || 'Sample'}</h3>
                    <p>Accession: ${location.accession}</p>
                    ${location.sample_count ? `<p>Samples in this area: ${location.sample_count}</p>` : ''}
                    <p>Coordinates: ${Number(location.latitude).toFixed(6)}, ${Number(location.longitude).toFixed(6)}</p>
                  </div>
                `;

                marker.bindPopup(popupContent);

                // Store the location data with the marker for later use
                // @ts-ignore - Adding custom property to marker
                marker.locationData = {
                  location,
                  lat: Number(location.latitude),
                  lng: Number(location.longitude)
                };

                markers.push(marker);
              });

              // Add each marker individually to the cluster
              markers.forEach(marker => {
                markerCluster.addLayer(marker);
              });

              i = end;

              if (i < locations.length) {
                // Use requestAnimationFrame for better performance
                requestAnimationFrame(() => {
                  // Show progress in console
                  console.log(`Adding markers: ${Math.round((i / locations.length) * 100)}% complete`);
                  addBatch();
                });
              } else {
                console.log('All markers added');
              }
            }

            addBatch();
          };

          addMarkersInBatches(sampleLocations);

          // Let the markercluster handle the clustering of markers
          // We don't need a custom icon creator function anymore
          // The default clustering behavior will work fine for our use case
        }

        // Store current bounds and zoom level for reference
        const updateMapViewInfo = () => {
          if (!isMountedRef.current || !map) return;

          const bounds = map.getBounds();
          const zoom = map.getZoom();

          // Convert bounds to array format [south, west, north, east]
          const boundsArray = [
            bounds.getSouth(),
            bounds.getWest(),
            bounds.getNorth(),
            bounds.getEast()
          ];

          // Update refs with new values
          mapBoundsRef.current = boundsArray;
          mapZoomRef.current = zoom;
        };

        // Initial update of map view info
        updateMapViewInfo();

        // Function to adjust the map to fill the container width
        const adjustMapToFillContainer = () => {
          // Multiple safety checks to ensure map is properly initialized
          if (!isMountedRef.current || !map || !map._container || !map._container._leaflet_pos) return;

          try {
            // Force a redraw of the map without affecting zoom
            map.invalidateSize({ pan: false, animate: false, debounceMoveend: true });
          } catch (e) {
            console.error("Error invalidating map size:", e);
          }
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
            // Only call adjustMapToFillContainer if the map is properly initialized
            try {
              if (map._container && map._container._leaflet_pos) {
                adjustMapToFillContainer();
              }
            } catch (e) {
              console.error("Error in final map adjustment:", e);
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
              // No need to remove map move/zoom event listeners as we're not using them

              // Clean up marker cluster if it exists
              if (markerClusterRef.current) {
                markerClusterRef.current.clearLayers();
                map.removeLayer(markerClusterRef.current);
              }

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
          markerClusterRef.current = null;
        };
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    // Initialize the map
    initializeMap();

    // Cleanup function
    return () => {
      // Mark component as unmounted
      isMountedRef.current = false;

      // Reset fetching flag to prevent any ongoing fetches from updating state
      isFetchingRef.current = false;

      // Call the map cleanup function if it exists
      if (cleanupFunction) {
        cleanupFunction();
      }

      // Remove the map container from the DOM
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [sampleLocations, fetchSampleLocations]); // Only re-run when sample locations or fetch function changes

  return (
    <Card className="w-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-center">Global BGC Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <div className="text-center text-red-500 p-4">Error: {error}</div>}
        <div 
          ref={containerRef}
          className="w-full rounded-md"
          style={{ height: "1000px", zIndex: 0 }}
        />
      </CardContent>
    </Card>
  );
}
