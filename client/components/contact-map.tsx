"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { RiMap2Line, RiCompass3Line } from "react-icons/ri";

interface ContactMapProps {
  center: [number, number];
  zoom?: number;
  activeBranch?: "dhaka" | "cumilla";
}

const locations = {
  dhaka: {
    coords: [23.7279768, 90.4262174] as [number, number],
    title: "VDCBD - Main Branch",
    desc: "Eastern Kamalapur Complex, 2nd Floor, Room No 206, Kamalapur, Dhaka 1000",
  },
  cumilla: {
    coords: [23.4833, 91.0083] as [number, number],
    title: "VDCBD - Cumilla Branch",
    desc: "Madhya Bazar, Chandina, Cumilla",
  },
};

export default function ContactMap({ center, zoom = 14, activeBranch }: ContactMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  
  // Support toggling between Real Street Map and Satellite (Google Earth style)
  const [mapMode, setMapMode] = useState<"street" | "satellite">("street");

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize the map if it doesn't exist
    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        scrollWheelZoom: true,
        dragging: true,
        tap: true,
      }).setView(center, zoom);

      // Add default tile layer
      const initialLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(map);

      tileLayerRef.current = initialLayer;

      // Add zoom control to bottom-right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapRef.current = map;

      // Define beautiful custom pulsing markers (using highly visible glowing pins)
      const createPulsingIcon = (color: string, pingColor: string) => {
        return L.divIcon({
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
              <div class="animate-ping" style="position: absolute; width: 32px; height: 32px; border-radius: 9999px; background-color: ${pingColor}; opacity: 0.8; pointer-events: none;"></div>
              <div style="position: relative; width: 16px; height: 16px; border-radius: 9999px; background-color: ${color}; border: 2.5px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>
            </div>
          `,
          className: "custom-leaflet-marker",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
      };

      const dhakaIcon = createPulsingIcon("#0284c7", "rgba(14, 165, 233, 0.5)"); // Cyan / Sky Blue
      const cumillaIcon = createPulsingIcon("#10b981", "rgba(52, 211, 153, 0.5)"); // Emerald Green

      // Place Dhaka Marker
      const dhakaMarker = L.marker(locations.dhaka.coords, { icon: dhakaIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family: inherit; font-size: 13px; color: #18181b; line-height: 1.5; padding: 4px;">
            <h4 style="font-weight: 700; margin: 0; color: #0f172a; font-size: 14px; display: flex; align-items: center; gap: 6px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #0284c7;"></span>
              ${locations.dhaka.title}
            </h4>
            <p style="margin: 6px 0 0 0; color: #4b5563; font-size: 12px; font-weight: 500;">${locations.dhaka.desc}</p>
          </div>`
        );

      // Place Cumilla Marker
      const cumillaMarker = L.marker(locations.cumilla.coords, { icon: cumillaIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family: inherit; font-size: 13px; color: #18181b; line-height: 1.5; padding: 4px;">
            <h4 style="font-weight: 700; margin: 0; color: #0f172a; font-size: 14px; display: flex; align-items: center; gap: 6px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #10b981;"></span>
              ${locations.cumilla.title}
            </h4>
            <p style="margin: 6px 0 0 0; color: #4b5563; font-size: 12px; font-weight: 500;">${locations.cumilla.desc}</p>
          </div>`
        );

      markersRef.current = {
        dhaka: dhakaMarker,
        cumilla: cumillaMarker,
      };
    }

    return () => {
      // Cleanup the map instance on unmount to prevent React double-init error in Strict Mode
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Sync center and active branch animations
  useEffect(() => {
    if (!mapRef.current) return;

    if (activeBranch) {
      const loc = locations[activeBranch];
      mapRef.current.flyTo(loc.coords, 16, {
        animate: true,
        duration: 1.5,
      });

      // Auto open popup after pan
      setTimeout(() => {
        const marker = markersRef.current[activeBranch];
        if (marker) {
          marker.openPopup();
        }
      }, 1500);
    } else {
      mapRef.current.panTo(center);
    }
  }, [center, activeBranch]);

  // Sync Map Mode Tile Layer dynamically
  useEffect(() => {
    if (!mapRef.current) return;

    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }

    let url = "";
    let attribution = "";
    
    if (mapMode === "satellite") {
      // Esri World Imagery (Satellite) for Google Earth feel
      url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      attribution = "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community";
    } else {
      // Clean high-detail Street map
      url = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
      attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
    }

    const newLayer = L.tileLayer(url, {
      attribution,
      maxZoom: 20,
    }).addTo(mapRef.current);

    tileLayerRef.current = newLayer;
  }, [mapMode]);

  return (
    <div className="relative w-full h-full">
      {/* Map Mode Switcher Control */}
      <div className="absolute top-4 left-4 z-[1000] flex gap-1 bg-background/90 backdrop-blur-md p-1.5 rounded-xl shadow-lg border border-border">
        <button
          type="button"
          onClick={() => setMapMode("street")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            mapMode === "street"
              ? "bg-primary text-primary-foreground scale-105 shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <RiMap2Line className="text-sm" /> Street Map
        </button>
        <button
          type="button"
          onClick={() => setMapMode("satellite")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            mapMode === "satellite"
              ? "bg-primary text-primary-foreground scale-105 shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <RiCompass3Line className="text-sm" /> Satellite
        </button>
      </div>

      {/* Styles for Leaflet to fix popup styling to blend beautifully */}
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          border-radius: 14px;
          background-color: white !important;
          color: #0f172a !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
          padding: 2px;
        }
        .leaflet-popup-tip {
          background-color: white !important;
        }
        .leaflet-container {
          font-family: inherit;
          background-color: #f1f5f9 !important;
        }
        .leaflet-popup-close-button {
          color: #94a3b8 !important;
          padding: 8px !important;
        }
      `}</style>
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
