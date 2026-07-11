import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface IOrder extends Document {
  user?: mongoose.Types.ObjectId;
  guestEmail?: string;
  items: IOrderItem[];
  totalAmount: number;
  deliveryFee: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  shippingDetails?: {
    fullName: string;
    email: string;
    phone: string;
    region: string;
    streetAddress: string;
    additionalInfo?: string;
    lat?: string;
    lng?: string;
  };
  pickupLocation?: string;
  paystackReference?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  image: { type: String },
});

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    guestEmail: { type: String },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    paymentMethod: { type: String, required: true }, // 'paystack', 'pickup', 'delivery'
    paymentStatus: { type: String, default: "pending" }, // 'pending', 'paid', 'failed'
    orderStatus: { type: String, default: "pending" }, // 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
    shippingDetails: {
      fullName: { type: String },
      email: { type: String },
      phone: { type: String },
      region: { type: String },
      streetAddress: { type: String },
      additionalInfo: { type: String },
      lat: { type: String },
      lng: { type: String },
    },
    pickupLocation: { type: String },
    paystackReference: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
