import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    authorName: { type: String, required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: false },
    summary: { type: String, required: true },
    content: { type: String, required: true },
    travelTags: { type: [String], default: [] },
    publishingDate: { type: Date, default: Date.now },
    authorImage: { type: String, required: true }, // Single author image
    media: { type: [String], default: [] }, // Multiple images/videos
  },
  { timestamps: true }
);

export default mongoose.model("Blog", BlogSchema);
