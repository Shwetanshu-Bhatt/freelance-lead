import mongoose, { Schema, Document } from "mongoose";

export interface INoteDocument extends Document {
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INoteDocument>(
  {
    title: {
      type: String,
      required: [true, "Note title is required"],
      trim: true,
      maxlength: [200, "Title cannot be more than 200 characters"],
      default: "Untitled Note",
    },
    content: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Note || mongoose.model<INoteDocument>("Note", NoteSchema);
