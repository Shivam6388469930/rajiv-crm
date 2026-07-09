import mongoose, { Schema, model, models } from "mongoose";

const otpSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
    },

    otp: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["EMAIL_VERIFY", "PASSWORD_RESET"],
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      expires: 0
    },
  },
  {
    timestamps: true,
  }
);

export default models.OTP || model("OTP", otpSchema);