import mongoose, { Schema, Document } from "mongoose";
import { LeadStatus, LeadSource, Priority, IAddress } from "@/lib/types";

export interface ILeadDocument extends Document {
  category: mongoose.Types.ObjectId;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  rating: number;
  reviewCount: number;
  googleMapsUrl?: string;
  address: IAddress;
  status: LeadStatus;
  source: LeadSource;
  tags: string[];
  notes?: string;
  priority: Priority;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  contactedAt?: Date;
  lastActivityAt?: Date;
}

const AddressSchema = new Schema({
  street: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  postalCode: { type: String, trim: true },
  country: { type: String, trim: true },
  latitude: { type: Number },
  longitude: { type: Number },
}, { _id: false });

const LeadSchema = new Schema<ILeadDocument>(
  {
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
      index: true,
    },
    name: {
      type: String,
      trim: true,
      maxlength: [200, "Name cannot be more than 200 characters"],
    },
    contactPerson: {
      type: String,
      trim: true,
      maxlength: [100, "Contact person name cannot be more than 100 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    rating: {
      type: Number,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot be more than 5"],
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, "Review count cannot be negative"],
    },
    googleMapsUrl: {
      type: String,
      trim: true,
    },
    address: {
      type: AddressSchema,
      default: {},
    },
    status: {
      type: String,
      enum: {
        values: ["lead_generated", "contacted", "to_send", "declined", "proposed"],
        message: "Status {VALUE} is not supported",
      },
      default: "lead_generated",
      index: true,
    },
    source: {
      type: String,
      enum: {
        values: ["manual", "google", "referral", "social_media", "website", "other"],
        message: "Source {VALUE} is not supported",
      },
      default: "manual",
    },
    tags: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high", "urgent"],
        message: "Priority {VALUE} is not supported",
      },
      default: "medium",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    contactedAt: {
      type: Date,
    },
    lastActivityAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

LeadSchema.index({ status: 1, isDeleted: 1 });
LeadSchema.index({ category: 1, isDeleted: 1 });
LeadSchema.index({ rating: -1 });
LeadSchema.index({ isDeleted: 1 });
LeadSchema.index({
  name: "text",
  phone: "text",
  "address.city": "text",
  tags: "text"
});
LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ priority: 1 });

// Unique index to prevent duplicate leads (same phone)
LeadSchema.index({ phone: 1 }, { unique: true, sparse: true });

const Lead = mongoose.models.Lead || mongoose.model<ILeadDocument>("Lead", LeadSchema);

export default Lead;
