const sponsorService = require("../services/sponsor.service");
const { getCloudinary } = require("../config/cloudinary");

const getAllSponsorsHandler = async (req, res) => {
  try {
    const { industry, status } = req.query;
    const sponsors = await sponsorService.getAllSponsors({ industry, status });
    res.status(200).json({ sponsors });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Failed to fetch sponsors" });
  }
};

const getSponsorByIdHandler = async (req, res) => {
  try {
    const { sponsorId } = req.params;
    const sponsor = await sponsorService.getSponsorById(sponsorId);
    if (!sponsor) return res.status(404).json({ message: "Sponsor not found" });
    res.status(200).json({ sponsor });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Failed to fetch sponsor" });
  }
};

const listSponsorRequestsForBookingHandler = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (req.user.role === "customer") {
      const ownerId = await sponsorService.getBookingOwnerId(bookingId);
      if (ownerId === null)
        return res.status(404).json({ message: "Booking not found" });
      if (ownerId !== req.user.id) {
        return res.status(403).json({
          message: "You do not have access to this booking's sponsor requests",
        });
      }
    }

    const requests = await sponsorService.getSponsorRequestsForBooking(
      bookingId
    );
    res.status(200).json({ sponsorRequests: requests });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Failed to fetch sponsor requests" });
  }
};

const createSponsorRequestHandler = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { sponsorId, proposedAmount, message } = req.body;

    if (!sponsorId)
      return res.status(400).json({ message: "sponsorId is required" });

    const request = await sponsorService.createSponsorRequest(
      bookingId,
      sponsorId,
      req.user.id,
      {
        proposedAmount,
        message,
      }
    );

    res
      .status(201)
      .json({ message: "Sponsor request created", sponsorRequest: request });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Failed to create sponsor request" });
  }
};

const respondToSponsorRequestHandler = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body;

    const updated = await sponsorService.respondToSponsorRequest(
      requestId,
      action,
      req.user.id,
      req.user.role
    );
    res
      .status(200)
      .json({ message: `Sponsor request ${action}`, sponsorRequest: updated });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Failed to respond to sponsor request" });
  }
};

const withdrawSponsorRequestHandler = async (req, res) => {
  try {
    const { requestId } = req.params;
    const updated = await sponsorService.withdrawSponsorRequest(
      requestId,
      req.user.id
    );
    res
      .status(200)
      .json({ message: "Sponsor request withdrawn", sponsorRequest: updated });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Failed to withdraw sponsor request" });
  }
};

const getMySponsorRequestsHandler = async (req, res) => {
  try {
    const requests = await sponsorService.getSponsorRequestsForSponsorUser(
      req.user.id
    );
    res.status(200).json({ sponsorRequests: requests });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      message: err.message || "Failed to fetch your sponsor requests",
    });
  }
};

const {
  uploadImageBuffer,
  deleteImage,
  publicIdFromUrl,
} = require("../services/upload.service");

const uploadSponsorLogoHandler = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No logo file provided" });

    const existing = await sponsorService.getSponsorByUserId(req.user.id);
    if (!existing)
      return res
        .status(404)
        .json({ message: "Sponsor profile not found for this user" });

    const uploaded = await uploadImageBuffer(req.file.buffer, "sponsors", {
      avatar: true,
    });

    const sponsor = await sponsorService.updateSponsorLogo(
      req.user.id,
      uploaded.url
    );

    // Best-effort cleanup of the old logo — don't fail the request if this errors
    const oldPublicId = publicIdFromUrl(existing.logo_url);
    if (oldPublicId) {
      deleteImage(oldPublicId).catch((err) =>
        console.error(
          "Failed to delete old sponsor logo from Cloudinary:",
          err.message
        )
      );
    }

    res.status(200).json({ message: "Logo updated", sponsor });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Failed to upload logo" });
  }
};

const getMySponsorProfileHandler = async (req, res) => {
  try {
    const sponsor = await sponsorService.getSponsorByUserId(req.user.id);
    if (!sponsor)
      return res
        .status(404)
        .json({ message: "Sponsor profile not found for this user" });
    res.status(200).json({ sponsor });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Failed to fetch sponsor profile" });
  }
};

module.exports = {
  getAllSponsorsHandler,
  getSponsorByIdHandler,
  listSponsorRequestsForBookingHandler,
  createSponsorRequestHandler,
  respondToSponsorRequestHandler,
  withdrawSponsorRequestHandler,
  getMySponsorRequestsHandler,
  uploadSponsorLogoHandler,
  uploadSponsorLogoHandler,
  getMySponsorProfileHandler,
};
