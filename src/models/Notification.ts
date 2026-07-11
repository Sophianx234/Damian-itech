import mongoose from 'mongoose';

export interface INotification extends mongoose.Document {
  type: string;
  referenceId: string;
  title: string;
  message: string;
  link: string;
  isCritical: boolean;
  isRead: boolean;
  isDismissed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new mongoose.Schema({
  type: { type: String, required: true },
  referenceId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String, required: true },
  isCritical: { type: Boolean, default: false },
  isRead: { type: Boolean, default: false },
  isDismissed: { type: Boolean, default: false },
}, { timestamps: true });

NotificationSchema.index({ type: 1, referenceId: 1 }, { unique: true });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
