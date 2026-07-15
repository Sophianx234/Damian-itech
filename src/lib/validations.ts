import { z } from 'zod';

export const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title is too long"),
  price: z.number({ invalid_type_error: "Price must be a number" }).positive("Price must be positive").optional(),
  oldPrice: z.number().optional(),
  tag: z.string().optional(),
  tagType: z.string().optional(),
  brand: z.string().min(1, "Brand is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  productType: z.enum(['Store', 'Used'], { required_error: "Product type is required" }),
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
