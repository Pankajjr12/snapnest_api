import { Schema } from "mongoose";
import mongoose from "mongoose";

const userSchema = new Schema(
  {
    displayName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    img: {
      type: String,
    },
    hashedPassword: {
      type: String,
      required: true,
    },
 
    savedPins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pin", // Reference to the Pin model
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("User",userSchema)