const express = require("express");
const swapController = require("../controllers/swap.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const validators = require("../middlewares/validator.middleware");
const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Event CRUD routes
router.get("/events", swapController.getUserEvents);
router.post("/events",validators.createEventValidator,swapController.createEvent);
router.put("/events/:eventId", swapController.updateEvent);
router.delete("/events/:eventId", swapController.deleteEvent);

// Core swap functionality routes (as per requirements)
router.get("/swappable-slots", swapController.getSwappableSlots);
router.post("/swap-request",validators.createSwapRequestValidator,swapController.createSwapRequest
);
router.post("/swap-response/:requestId",validators.swapResponseValidator,swapController.respondToSwapRequest
);

// Additional helpful routes
router.get("/swap-requests", swapController.getSwapRequests);

module.exports = router;
