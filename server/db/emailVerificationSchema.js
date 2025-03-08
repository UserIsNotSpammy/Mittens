import mongoose from "mongoose";

const emailVerificationSchema = new mongoose.Schema(
  {
    cookie: {
      type: String,
      required: true,
      unique: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationCode: {
      type: String,
      required: true,
    },
    userAgent: {
      type: mongoose.Schema({
        os: { type: String, default: "unknown" },
        ip: { type: String, default: "unknown" },
        browser: { type: String, default: "unknown" },
        device: { type: String, default: "unknown" },
      }),
      required: true,
    },

    submittedData: {},
  },
  {
    timestamps: true,
  }
);

const EmailVerification = mongoose.model(
  "EmailVerification",
  emailVerificationSchema
);

export default EmailVerification;
