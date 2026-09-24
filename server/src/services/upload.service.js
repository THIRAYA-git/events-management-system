const { getCloudinary } = require("../config/cloudinary");

const ALLOWED_FOLDERS = ["halls", "organizers", "sponsors", "events", "users", "menu"];

const DEFAULT_TRANSFORM = [{ width: 1600, crop: "limit", quality: "auto", fetch_format: "auto" }];
const AVATAR_TRANSFORM = [
  { width: 400, height: 400, crop: "fill", gravity: "auto", quality: "auto", fetch_format: "auto" },
];

function httpError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

// Uploads an in-memory Buffer (from multer) to Cloudinary.
// Returns { url, public_id, width, height, format, bytes }.
function uploadImageBuffer(buffer, folder, { avatar = false } = {}) {
  if (!ALLOWED_FOLDERS.includes(folder)) {
    throw httpError(`Invalid folder. Allowed: ${ALLOWED_FOLDERS.join(", ")}`, 400);
  }
  return new Promise((resolve, reject) => {
    const stream = getCloudinary().uploader.upload_stream(
      {
        folder: `aazath-plaza/${folder}`,
        resource_type: "image",
        transformation: avatar ? AVATAR_TRANSFORM : DEFAULT_TRANSFORM,
      },
      (error, result) => {
        if (error) return reject(httpError(error.message || "Image upload failed", 502));
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );
    stream.end(buffer);
  });
}

// Extracts "aazath-plaza/users/abc123" from a Cloudinary URL (null if not ours)
function publicIdFromUrl(url) {
  if (!url || typeof url !== "string") return null;
  const m = url.match(/\/upload\/(?:v\d+\/)?(aazath-plaza\/.+)\.[a-z0-9]+$/i);
  return m ? m[1] : null;
}

async function deleteImage(publicId) {
  const result = await getCloudinary().uploader.destroy(publicId, { resource_type: "image" });
  return result.result === "ok";
}

module.exports = { uploadImageBuffer, deleteImage, publicIdFromUrl, ALLOWED_FOLDERS };