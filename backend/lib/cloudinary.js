import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "heystay/pgs",
    // Broadened so common phone/download formats (heic, jfif, avif, gif) don't
    // cause the whole multi-image request to be rejected.
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "heic", "heif", "jfif", "avif"],
    transformation: [{ width: 1200, crop: "limit", quality: "auto" }],
  },
});

// No file-size limit — admins can upload images of any size. (Cloudinary's own
// account limits still apply on their end.)
export const upload = multer({ storage });
export { cloudinary };
