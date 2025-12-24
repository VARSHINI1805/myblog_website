import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      default: ""
    },
    description: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      default: ""
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);
