import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

     username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    token: {
  type: String,
  default: null,
  select: false,
},

   role: {
    type: String,
    enum: ["subscriber", "administrator"],
    default: "subscriber"
}
,
    selectedCharity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Charity",
      default: null,
    },

    charityPercentage: {
      type: Number,
      default: 10,
      min: 10,
      max: 100,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;