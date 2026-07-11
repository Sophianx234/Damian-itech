import mongoose, { Schema, Document } from "mongoose";

export interface IAdminInvitation extends Document {
  fullName: string;
  phone: string;
  role: string;
  otp: string;
  status: "pending" | "accepted";
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminInvitationSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["Super Admin", "Manager", "Support Staff"],
    },
    otp: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure a single pending invite per phone number
AdminInvitationSchema.index({ phone: 1 }, { unique: true, partialFilterExpression: { status: "pending" } });

const AdminInvitation =
  mongoose.models.AdminInvitation ||
  mongoose.model<IAdminInvitation>("AdminInvitation", AdminInvitationSchema);

export default AdminInvitation;
