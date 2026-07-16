import { z } from 'zod';

export const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title is too long"),
  price: z.number().positive("Price must be positive").optional(),
  oldPrice: z.number().optional(),
  tag: z.string().optional(),
  tagType: z.string().optional(),
  brand: z.string().min(1, "Brand is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  productType: z.enum(['Store', 'Used']),
  condition: z.string().optional(),
  isSwappable: z.boolean().default(false),
  estValue: z.number().optional(),
  lookingFor: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  vendorName: z.string().optional(),
  
  // Standard Specs
  batteryHealth: z.number().min(0).max(100).optional(),
  ram: z.string().optional(),
  storage: z.string().optional(),
  
  // Custom Specs & Images
  customSpecs: z.array(z.object({
    key: z.string().min(1, "Key is required"),
    value: z.string().min(1, "Value is required")
  })).optional().default([]),
  
  imageUrls: z.array(z.string().url()).optional().default([]),
}).superRefine((data, ctx) => {
  if (!data.isSwappable && (data.price === undefined || data.price <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Price is required and must be positive when not swappable",
      path: ["price"]
    });
  }
});

// Checkout / Orders
export const orderSchema = z.object({
  items: z.array(z.object({
    id: z.string().optional(),
    productId: z.string().optional(),
    _id: z.string().optional(),
    quantity: z.number().int().min(1, "Quantity must be at least 1"),
    image: z.string().optional(),
  })).min(1, "Cart cannot be empty"),
  paymentMethod: z.enum(['pickup', 'delivery', 'paystack']),
  pickupLocation: z.string().optional(),
  reference: z.string().optional(),
  shippingDetails: z.object({
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    phone: z.string().min(9, "Phone number too short").optional(),
    fullName: z.string().min(2, "Name is required").optional(),
    region: z.string().optional(),
    streetAddress: z.string().optional(),
    additionalInfo: z.string().optional(),
    lat: z.string().optional(),
    lng: z.string().optional(),
  }).optional()
});

// Support / Contact
export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(9, "Phone number is too short").max(20, "Phone number is too long").optional().or(z.literal("")),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// Admin Team Invites
export const inviteSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100, "Full name is too long"),
  phone: z.string().min(9, "Phone number is too short").max(20, "Phone number is too long"),
  role: z.enum(['manager', 'support', 'delivery']),
});

export const inviteSetupSchema = z.object({
  inviteId: z.string().min(1, "Invite ID is required"),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Authentication
export const loginSchema = z.object({
  identifier: z.string().min(3, "Phone or Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(9, "Phone number is required"),
});

export const signupStep3Schema = z.object({
  phone: z.string().min(9, "Phone number is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const resetPasswordSchema = z.object({
  phone: z.string().min(9, "Phone number is required"),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
