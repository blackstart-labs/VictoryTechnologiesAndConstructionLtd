"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

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

      // Deep theme / Dark Matter tiles for a premium interactive aesthetic
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(map);

      // Add zoom control to bottom-right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapRef.current = map;

      // Define beautiful custom pulsing markers matching theme colors (neon cyan and neon green)
      const createPulsingIcon = (color: string, pingColor: string) => {
        return L.divIcon({
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
              <div class="animate-ping" style="position: absolute; width: 32px; height: 32px; border-radius: 9999px; background-color: ${pingColor}; opacity: 0.8; pointer-events: none;"></div>
              <div style="position: relative; width: 14px; height: 16px; border-radius: 9999px; background-color: ${color}; border: 2.5px solid #18181b; box-shadow: 0 0 12px ${color};"></div>
            </div>
          `,
          className: "custom-leaflet-marker",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
      };

      const dhakaIcon = createPulsingIcon("#00f0ff", "rgba(0, 240, 255, 0.5)"); // Neon Cyan
      const cumillaIcon = createPulsingIcon("#00ff66", "rgba(0, 255, 102, 0.5)"); // Neon Green

      // Place Dhaka Marker
      const dhakaMarker = L.marker(locations.dhaka.coords, { icon: dhakaIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family: inherit; font-size: 13px; color: #e4e4e7; line-height: 1.5; padding: 4px;">
            <h4 style="font-weight: 700; margin: 0; color: #ffffff; font-size: 14px; display: flex; align-items: center; gap: 6px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #00f0ff;"></span>
              ${locations.dhaka.title}
            </h4>
            <p style="margin: 6px 0 0 0; color: #a1a1aa; font-size: 12px; font-weight: 500;">${locations.dhaka.desc}</p>
          </div>`
        );

      // Place Cumilla Marker
      const cumillaMarker = L.marker(locations.cumilla.coords, { icon: cumillaIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family: inherit; font-size: 13px; color: #e4e4e7; line-height: 1.5; padding: 4px;">
            <h4 style="font-weight: 700; margin: 0; color: #ffffff; font-size: 14px; display: flex; align-items: center; gap: 6px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #00ff66;"></span>
              ${locations.cumilla.title}
            </h4>
            <p style="margin: 6px 0 0 0; color: #a1a1aa; font-size: 12px; font-weight: 500;">${locations.cumilla.desc}</p>
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
      mapRef.current.flyTo(loc.coords, 15, {
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

  return (
    <div className="relative w-full h-full">
      {/* Styles for Leaflet to fix popup styling to blend beautifully with the deep theme */}
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          border-radius: 16px;
          background-color: #18181b !important;
          color: #f4f4f5 !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4);
          border: 1px solid #27272a;
          padding: 4px;
        }
        .leaflet-popup-tip {
          background-color: #18181b !important;
          border: 1px solid #27272a;
        }
        .leaflet-container {
          font-family: inherit;
          background-color: #09090b !important;
        }
        .leaflet-popup-close-button {
          color: #a1a1aa !important;
          padding: 8px !important;
        }
      `}</style>
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
