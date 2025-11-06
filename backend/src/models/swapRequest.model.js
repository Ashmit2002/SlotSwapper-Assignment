const mongoose = require("mongoose");

const swapRequestSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    requesterSlotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "event",
      required: true,
    },
    receiverSlotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "event",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);



const swapRequestModel = mongoose.model("swapRequest", swapRequestSchema);
module.exports = swapRequestModel;
