"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface PickupLocation {
  id: string;
  name: string;
  address: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  time: string;
  rate: number;
}

export interface AppSettings {
  storeName: string;
  supportEmail: string;
  contactPhone: string;
  physicalAddress: string;
  isLocalPickupEnabled: boolean;
  pickupLocations: PickupLocation[];
  freeDeliveryThreshold: number;
  isDeliveryEnabled: boolean;
  deliveryZones: DeliveryZone[];
}

interface SettingsContextType {
  settings: AppSettings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error("Error fetching settings context:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
