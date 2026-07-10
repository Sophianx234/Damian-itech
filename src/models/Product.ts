import mongoose from "mongoose";

const SpecSchema = new mongoose.Schema({
  key: { type: String, required: true },
  value: { type: String, required: true },
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  brand: { type: String, required: true },
  description: { type: String, required: true },
  stock: { type: Number, required: true, default: 1 },
  productType: { type: String, enum: ['Store', 'Used'], required: true },
  condition: { type: String }, // Optional for 'Store'
  isSwappable: { type: Boolean, default: false },
  category: { type: String, required: true },
  
  // Hardcoded standard specs
  batteryHealth: { type: Number },
  ram: { type: String },
  storage: { type: String },
  
  // Custom user-defined specs
  customSpecs: [SpecSchema],
  
  images: [{ type: String }],
  
  status: { type: String, enum: ['Active', 'Reserved', 'Sold'], default: 'Active' },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
