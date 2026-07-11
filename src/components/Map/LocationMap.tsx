"use client";

import React, { useEffect, useRef } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import { GeocodingControl } from "@maptiler/geocoding-control/maptilersdk";

interface LocationMapProps {
  onLocationSelect: (lat: number, lng: number, addressStr: string) => void;
}

export default function LocationMap({ onLocationSelect }: LocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maptilersdk.Map | null>(null);
  const marker = useRef<maptilersdk.Marker | null>(null);

  // We use a ref to hold the latest callback to avoid re-triggering the useEffect
  const onLocationSelectRef = useRef(onLocationSelect);
  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  useEffect(() => {
    if (!mapContainer.current) return;

    maptilersdk.config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_PUBLIC_KEY || "";

    const mapInstance = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.STREETS,
      center: [-0.1870, 5.6037],
      zoom: 12,
      attributionControl: false,
    });
    
    map.current = mapInstance;

    const gc = new GeocodingControl({
      apiKey: maptilersdk.config.apiKey,
      // @ts-ignore
      mapController: mapInstance,
      flyTo: true,
      placeholder: "Search for a location...",
    });
    mapInstance.addControl(gc, "top-left");

    const markerInstance = new maptilersdk.Marker({ color: "#09090b", draggable: true })
      .setLngLat([-0.1870, 5.6037])
      .addTo(mapInstance);
      
    marker.current = markerInstance;

    const reverseGeocode = async (lng: number, lat: number, defaultPlaceName?: string) => {
      try {
        const result = await maptilersdk.geocoding.reverse([lng, lat]);
        if (result && result.features && result.features.length > 0) {
          onLocationSelectRef.current(lat, lng, result.features[0].place_name);
        } else {
          onLocationSelectRef.current(lat, lng, defaultPlaceName || `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
        }
      } catch (err) {
        console.error("Reverse geocoding failed", err);
        onLocationSelectRef.current(lat, lng, defaultPlaceName || `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
      }
    };

    markerInstance.on("dragend", () => {
      const lngLat = markerInstance.getLngLat();
      if (lngLat) {
        reverseGeocode(lngLat.lng, lngLat.lat);
      }
    });

    mapInstance.on("click", (e) => {
      const { lng: newLng, lat: newLat } = e.lngLat;
      markerInstance.setLngLat([newLng, newLat]);
      reverseGeocode(newLng, newLat);
    });

    gc.on("pick", (event: any) => {
      if (event && event.center) {
        const [pickedLng, pickedLat] = event.center;
        markerInstance.setLngLat([pickedLng, pickedLat]);
        onLocationSelectRef.current(pickedLat, pickedLng, event.place_name || "");
      }
    });
    
    return () => {
      mapInstance.remove();
      map.current = null;
    };
  }, []); // Run only once on mount

  return (
    <div ref={mapContainer} style={{ height: '350px', width: '100%', borderRadius: '12px', border: '1px solid var(--border-primary)', overflow: 'hidden', marginTop: '8px' }} />
  );
}
