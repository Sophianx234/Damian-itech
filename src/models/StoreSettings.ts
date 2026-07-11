import mongoose, { Schema, Document } from "mongoose";

export interface IStoreSettings extends Document {
  // Store Config
  storeName: string;
  supportEmail: string;
  contactPhone: string;
  physicalAddress: string;

  // Shipping & Delivery
  isLocalPickupEnabled: boolean;
  pickupLocations: Array<{ id: string; name: string; address: string }>;
  freeDeliveryThreshold: number;
  isDeliveryEnabled: boolean;
  deliveryZones: Array<{ id: string; name: string; time: string; rate: number }>;

  // Notifications - Admin Alerts
  adminAlertNewOrder: boolean;
  adminAlertNewUser: boolean;
  adminAlertLowStock: boolean;
  lowStockThreshold: number;

  // Notifications - Customer Emails
  customerEmailOrderConfirm: boolean;
  customerEmailOrderShipped: boolean;
  customerEmailReview: boolean;
  customerEmailWelcome: boolean;

  // Security
  require2FA: boolean;
  sessionTimeout: boolean;
}

const StoreSettingsSchema = new Schema(
  {
    storeName: { type: String, default: "Damian iTech" },
    supportEmail: { type: String, default: "support@damian-itech.com" },
    contactPhone: { type: String, default: "+233 55 123 4567" },
    physicalAddress: { type: String, default: "Accra, Ghana\nWest Africa" },

    isLocalPickupEnabled: { type: Boolean, default: true },
    pickupLocations: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        address: { type: String, required: true },
      },
    ],
    freeDeliveryThreshold: { type: Number, default: 5000 },
    isDeliveryEnabled: { type: Boolean, default: true },
    deliveryZones: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        time: { type: String, required: true },
        rate: { type: Number, required: true },
      },
    ],

    adminAlertNewOrder: { type: Boolean, default: true },
    adminAlertNewUser: { type: Boolean, default: true },
    adminAlertLowStock: { type: Boolean, default: true },
    lowStockThreshold: { type: Number, default: 5 },

    customerEmailOrderConfirm: { type: Boolean, default: true },
    customerEmailOrderShipped: { type: Boolean, default: true },
    customerEmailReview: { type: Boolean, default: true },
    customerEmailWelcome: { type: Boolean, default: true },

    require2FA: { type: Boolean, default: false },
    sessionTimeout: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const StoreSettings =
  mongoose.models.StoreSettings ||
  mongoose.model<IStoreSettings>("StoreSettings", StoreSettingsSchema);

export default StoreSettings;
