import { create } from 'zustand';

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

interface SettingsState {
  settings: AppSettings | null;
  loading: boolean;
  fetchSettings: () => Promise<void>;
  refreshSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  loading: true,
  
  fetchSettings: async () => {
    try {
      set({ loading: true });
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      const data = await res.json();
      if (data.success && data.settings) {
        set({ settings: data.settings });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      set({ loading: false });
    }
  },

  refreshSettings: async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      const data = await res.json();
      if (data.success && data.settings) {
        set({ settings: data.settings });
      }
    } catch (error) {
      console.error("Error refreshing settings:", error);
    }
  }
}));
