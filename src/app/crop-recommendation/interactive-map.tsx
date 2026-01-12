'use client';

import { useEffect, useState, useRef, ReactNode } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default icon issue with Leaflet and React
const markerIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41]
});

const secondaryMarkerIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
  className: 'hue-rotate-180'
});

interface DummyLocation {
  lat: number;
  lng: number;
  name: string;
}

interface InteractiveMapProps {
  latitude: number;
  longitude: number;
  onMapClick: (lat: number, lon: number) => void;
  dummyLocations?: DummyLocation[];
  overlayProperty?: string | null;
  children?: ReactNode;
}

function InteractiveMapComponent({ latitude, longitude, onMapClick, dummyLocations = [], overlayProperty = null, children }: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const mainMarkerRef = useRef<L.Marker | null>(null);
  const dummyMarkersRef = useRef<L.Marker[]>([]);
  const overlayLayerRef = useRef<L.TileLayer.WMS | null>(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      // Initialize map
      const map = L.map(mapContainerRef.current).setView([latitude, longitude], 13);
      mapRef.current = map;

      L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
      ).addTo(map);

      // Add main marker
      const marker = L.marker([latitude, longitude], { icon: markerIcon }).addTo(map)
        .bindPopup('Your selected location');
      mainMarkerRef.current = marker;

      // Add click event
      map.on('click', (e) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });

      // Force initial invalidate
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }

    // ResizeObserver to handle container size changes (tabs, resize, animations)
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      resizeObserver.disconnect();
    };
  }, []); // Only run once on mount

  // Update view when lat/lng props change
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView([latitude, longitude], 13);
      if (mainMarkerRef.current) {
        mainMarkerRef.current.setLatLng([latitude, longitude]);
      }
    }
  }, [latitude, longitude]);

  // Handle Overlay Layer
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing overlay
    if (overlayLayerRef.current) {
      mapRef.current.removeLayer(overlayLayerRef.current);
      overlayLayerRef.current = null;
    }

    if (overlayProperty) {
      const wmsUrl = `https://maps.isric.org/mapserv?map=/map/${overlayProperty}.map`;
      const layerName = `${overlayProperty}_0-5cm_mean`;

      const wmsLayer = L.tileLayer.wms(wmsUrl, {
        layers: layerName,
        format: 'image/png',
        transparent: true,
        version: '1.1.1',
        attribution: 'SoilGrids © ISRIC',
        opacity: 0.7,
        styles: 'default',
        crossOrigin: true // Important for validation and avoiding tainted canvas if used elsewhere
      });

      wmsLayer.addTo(mapRef.current);
      overlayLayerRef.current = wmsLayer;
    }
  }, [overlayProperty]);

  // Update dummy locations
  useEffect(() => {
    if (mapRef.current) {
      // Clear existing dummy markers
      dummyMarkersRef.current.forEach(marker => marker.remove());
      dummyMarkersRef.current = [];

      // Add new dummy markers
      dummyLocations.forEach(location => {
        const marker = L.marker([location.lat, location.lng], { icon: secondaryMarkerIcon })
          .addTo(mapRef.current!)
          .bindPopup(location.name);
        dummyMarkersRef.current.push(marker);
      });
    }
  }, [dummyLocations]);

  return <div ref={mapContainerRef} className="h-full w-full isolate min-h-[400px]" style={{ minHeight: '400px', minWidth: '100%', height: '100%', width: '100%' }} />;
}


// Default export a simple wrapper that checks for client side execution
export const InteractiveMap = (props: InteractiveMapProps) => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? <InteractiveMapComponent {...props} /> : null;
}
