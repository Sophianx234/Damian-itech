import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISupportTicket extends Document {
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'open' | 'in-progress' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Please provide a message'],
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved'],
      default: 'open',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose from recompiling the model if it already exists
export const SupportTicket: Model<ISupportTicket> =
  mongoose.models.SupportTicket || mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
