import multer from "multer";
import path from "path";

// Configure multer to handle file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/"); // Define where to store the files
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Name the file with the current timestamp
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true); // Accept the file
    } else {
      return cb(new Error("Images only!")); // Reject the file if it is not an image
    }
  },
});

export default upload;
