const eventModel = require("../models/event.model");
const swapRequestModel = require("../models/swapRequest.model");
const userModel = require("../models/user.model");
const mongoose = require("mongoose");

// Get all events for the current user
const getUserEvents = async (req, res) => {
  try {
    const events = await eventModel
      .find({ userId: req.user._id })
      .sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching events",
      error: error.message,
    });
  }
};

// Create a new event
const createEvent = async (req, res) => {
  try {
    const { title, startTime, endTime, status, description } = req.body;

    const event = new eventModel({
      title,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: status || "BUSY",
      description: description || "",
      userId: req.user._id,
    });

    await event.save();

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating event",
      error: error.message,
    });
  }
};

// Update an event
const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const updates = req.body;

    // Ensure user can only update their own events
    const event = await eventModel.findOne({
      _id: eventId,
      userId: req.user._id,
    });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or you do not have permission to update it",
      });
    }

    // Prevent updating events that are in SWAP_PENDING status
    if (event.status === "SWAP_PENDING") {
      return res.status(400).json({
        success: false,
        message: "Cannot update event while swap is pending",
      });
    }

    // Update date fields if provided
    if (updates.startTime) updates.startTime = new Date(updates.startTime);
    if (updates.endTime) updates.endTime = new Date(updates.endTime);

    const updatedEvent = await eventModel.findByIdAndUpdate(eventId, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating event",
      error: error.message,
    });
  }
};

// Delete an event
const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Ensure user can only delete their own events
    const event = await eventModel.findOne({
      _id: eventId,
      userId: req.user._id,
    });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or you do not have permission to delete it",
      });
    }

    // Prevent deleting events that are in SWAP_PENDING status
    if (event.status === "SWAP_PENDING") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete event while swap is pending",
      });
    }

    await eventModel.findByIdAndDelete(eventId);

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting event",
      error: error.message,
    });
  }
};

// Get all swappable slots from other users
const getSwappableSlots = async (req, res) => {
  try {
    const swappableSlots = await eventModel
      .find({
        status: "SWAPPABLE",
        userId: { $ne: req.user._id }, // Exclude current user's slots
      })
      .populate("userId", "username fullName email")
      .sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      data: swappableSlots,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching swappable slots",
      error: error.message,
    });
  }
};

// Create a swap request
const createSwapRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { mySlotId, theirSlotId, message } = req.body;

    if (!mySlotId || !theirSlotId) {
      return res.status(400).json({
        success: false,
        message: "Both mySlotId and theirSlotId are required",
      });
    }

    // Verify my slot exists and belongs to the current user
    const mySlot = await eventModel
      .findOne({
        _id: mySlotId,
        userId: req.user._id,
        status: "SWAPPABLE",
      })
      .session(session);

    if (!mySlot) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Your slot not found or not swappable",
      });
    }

    // Verify their slot exists and is swappable
    const theirSlot = await eventModel
      .findOne({
        _id: theirSlotId,
        status: "SWAPPABLE",
        userId: { $ne: req.user._id }, // Ensure it's not the current user's slot
      })
      .session(session);

    if (!theirSlot) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Requested slot not found or not available for swap",
      });
    }

    // Check if there's already a pending request for these slots
    const existingRequest = await swapRequestModel
      .findOne({
        $or: [
          {
            requesterSlotId: mySlotId,
            receiverSlotId: theirSlotId,
            status: "PENDING",
          },
          {
            requesterSlotId: theirSlotId,
            receiverSlotId: mySlotId,
            status: "PENDING",
          },
        ],
      })
      .session(session);

    if (existingRequest) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "A swap request already exists for these slots",
      });
    }

    // Create the swap request
    const swapRequest = new swapRequestModel({
      requesterId: req.user._id,
      receiverId: theirSlot.userId,
      requesterSlotId: mySlotId,
      receiverSlotId: theirSlotId,
      message: message || "",
    });

    await swapRequest.save({ session });

    // Update both slots to SWAP_PENDING
    await eventModel.findByIdAndUpdate(
      mySlotId,
      { status: "SWAP_PENDING" },
      { session }
    );

    await eventModel.findByIdAndUpdate(
      theirSlotId,
      { status: "SWAP_PENDING" },
      { session }
    );

    await session.commitTransaction();

    // Populate the swap request with user and event details
    const populatedRequest = await swapRequestModel
      .findById(swapRequest._id)
      .populate("requesterId", "username fullName email")
      .populate("receiverId", "username fullName email")
      .populate("requesterSlotId")
      .populate("receiverSlotId");

    res.status(201).json({
      success: true,
      message: "Swap request created successfully",
      data: populatedRequest,
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: "Error creating swap request",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// Respond to a swap request (accept or reject)
const respondToSwapRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { requestId } = req.params;
    const { accept } = req.body; // true for accept, false for reject

    if (typeof accept !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Accept field is required and must be a boolean",
      });
    }

    // Find the swap request
    const swapRequest = await swapRequestModel
      .findOne({
        _id: requestId,
        receiverId: req.user._id, // Only the receiver can respond
        status: "PENDING",
      })
      .session(session);

    if (!swapRequest) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message:
          "Swap request not found or you do not have permission to respond",
      });
    }

    // Get both slots
    const requesterSlot = await eventModel
      .findById(swapRequest.requesterSlotId)
      .session(session);
    const receiverSlot = await eventModel
      .findById(swapRequest.receiverSlotId)
      .session(session);

    if (!requesterSlot || !receiverSlot) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "One or both slots no longer exist",
      });
    }

    if (accept) {
      // Accept the swap - exchange ownership
      await eventModel.findByIdAndUpdate(
        swapRequest.requesterSlotId,
        {
          userId: swapRequest.receiverId,
          status: "BUSY",
        },
        { session }
      );

      await eventModel.findByIdAndUpdate(
        swapRequest.receiverSlotId,
        {
          userId: swapRequest.requesterId,
          status: "BUSY",
        },
        { session }
      );

      // Update swap request status
      await swapRequestModel.findByIdAndUpdate(
        requestId,
        { status: "ACCEPTED" },
        { session }
      );

      await session.commitTransaction();

      res.status(200).json({
        success: true,
        message:
          "Swap request accepted successfully. Events have been exchanged.",
      });
    } else {
      // Reject the swap - restore slots to SWAPPABLE
      await eventModel.findByIdAndUpdate(
        swapRequest.requesterSlotId,
        { status: "SWAPPABLE" },
        { session }
      );

      await eventModel.findByIdAndUpdate(
        swapRequest.receiverSlotId,
        { status: "SWAPPABLE" },
        { session }
      );

      // Update swap request status
      await swapRequestModel.findByIdAndUpdate(
        requestId,
        { status: "REJECTED" },
        { session }
      );

      await session.commitTransaction();

      res.status(200).json({
        success: true,
        message:
          "Swap request rejected. Slots are now available for other swaps.",
      });
    }
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: "Error responding to swap request",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// Get swap requests for the current user (both sent and received)
const getSwapRequests = async (req, res) => {
  try {
    const { type } = req.query; // 'sent', 'received', or 'all'

    let query = {};
    if (type === "sent") {
      query.requesterId = req.user._id;
    } else if (type === "received") {
      query.receiverId = req.user._id;
    } else {
      // Default to all requests involving the user
      query = {
        $or: [{ requesterId: req.user._id }, { receiverId: req.user._id }],
      };
    }

    const swapRequests = await swapRequestModel
      .find(query)
      .populate("requesterId", "username fullName email")
      .populate("receiverId", "username fullName email")
      .populate("requesterSlotId")
      .populate("receiverSlotId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: swapRequests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching swap requests",
      error: error.message,
    });
  }
};

module.exports = {
  getUserEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getSwappableSlots,
  createSwapRequest,
  respondToSwapRequest,
  getSwapRequests,
};
