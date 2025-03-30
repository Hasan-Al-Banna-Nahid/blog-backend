import express from "express";
import multer from "multer";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  deleteBlog,
  updateBlog,
} from "../controllers/blog.controller";

const router = express.Router();

// Multer Storage
const storage = multer.diskStorage({});
const upload = multer({ storage });

router.post(
  "/create",
  upload.fields([
    { name: "authorImage", maxCount: 1 },
    { name: "media", maxCount: 5 },
  ]),
  createBlog
);
router.put(
  "/update/:id",
  upload.fields([
    { name: "authorImage", maxCount: 1 },
    { name: "media", maxCount: 5 },
  ]),
  updateBlog
);

router.get("/", getAllBlogs);
router.get("/:id", getBlogById);
router.delete("/delete/:id", deleteBlog);

export default router;
