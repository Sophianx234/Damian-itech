"use client";

import React, { useEffect, useRef } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";

interface DeliveryMapProps {
  lat: number;
  lng: number;
}

export default function DeliveryMap({ lat, lng }: DeliveryMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maptilersdk.Map | null>(null);
  const marker = useRef<maptilersdk.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    maptilersdk.config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_PUBLIC_KEY || "";

    const mapInstance = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.STREETS,
      center: [lng, lat],
      zoom: 15,
      interactive: true,
    });
    
    map.current = mapInstance;

    marker.current = new maptilersdk.Marker({ color: "#e11d48" }) // Red pin for delivery
      .setLngLat([lng, lat])
      .addTo(mapInstance);

    return () => {
      mapInstance.remove();
      map.current = null;
    };
  }, [lat, lng]);

  return (
    <div 
      ref={mapContainer} 
      style={{ 
        height: '250px', 
        width: '100%', 
        borderRadius: '12px', 
        border: '1px solid var(--border-primary)', 
        overflow: 'hidden', 
        marginTop: '16px' 
      }} 
    />
  );
}
