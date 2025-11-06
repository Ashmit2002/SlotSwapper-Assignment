const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["BUSY", "SWAPPABLE", "SWAP_PENDING"],
      default: "BUSY",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);



const eventModel = mongoose.model("event", eventSchema);
module.exports = eventModel;
