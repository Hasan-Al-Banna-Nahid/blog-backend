import { Request, Response } from "express";
import Blog from "../models/blog.model";
import { blogValidationSchema } from "../validations/blog.validation";
import cloudinary from "cloudinary";
import dotenv from "dotenv";
dotenv.config();
// Cloudinary Config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload to Cloudinary
const uploadToCloudinary = async (files: Express.Multer.File[]) => {
  const uploadPromises = files.map(async (file) => {
    const result = await cloudinary.v2.uploader.upload(file.path, {
      resource_type: "auto", // Supports images/videos
    });
    return result.secure_url;
  });
  return Promise.all(uploadPromises);
};
type Error = {
  message: string;
};
// Create Blog
export const createBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      authorName,
      title,
      category,
      subCategory,
      summary,
      content,
      travelTags,
      publishingDate,
    } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Validate input
    const validatedData = blogValidationSchema.parse(req.body);

    // Upload images
    const authorImage = files["authorImage"]
      ? await uploadToCloudinary(files["authorImage"])
      : [];
    const mediaFiles = files["media"]
      ? await uploadToCloudinary(files["media"])
      : [];

    if (!authorImage.length) {
      res.status(400).json({ message: "Author image is required" });
      return;
    }

    const newBlog = new Blog({
      ...validatedData,
      authorImage: authorImage[0],
      media: mediaFiles,
      travelTags: travelTags ? travelTags.split(",") : [],
      publishingDate: publishingDate ? new Date(publishingDate) : new Date(),
    });

    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

// Get All Blogs
export const getAllBlogs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;

    const query: any = {};
    if (category) query.category = category;
    if (search)
      query.$or = [
        { title: new RegExp(search as string, "i") },
        { content: new RegExp(search as string, "i") },
      ];

    const blogs = await Blog.find(query)
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .sort({ publishingDate: -1 });

    const total = await Blog.countDocuments(query);

    res.json({ total, page: +page, limit: +limit, blogs });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Get Single Blog
export const getBlogById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      res.status(404).json({ message: "Blog not found" });
      return;
    }
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Delete Blog
export const deleteBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Find the blog by ID
    const blog = await Blog.findById(id);
    if (!blog) {
      res.status(404).json({ message: "Blog not found" });
      return;
    }

    // Delete author image from Cloudinary
    if (blog.authorImage) {
      const authorImagePublicId = blog.authorImage
        .split("/")
        .pop()
        ?.split(".")[0]; // Extract public ID
      if (authorImagePublicId) {
        await cloudinary.v2.uploader.destroy(authorImagePublicId);
      }
    }

    // Delete media files from Cloudinary
    if (blog.media.length > 0) {
      const deleteMediaPromises = blog.media.map(async (mediaUrl) => {
        const mediaPublicId = mediaUrl.split("/").pop()?.split(".")[0]; // Extract public ID
        if (mediaPublicId) {
          // Determine resource type based on file extension
          const extension = mediaUrl.split(".").pop()?.toLowerCase();
          const resourceType =
            extension === "mp4" || extension === "mov" || extension === "avi"
              ? "video"
              : "image";

          return cloudinary.v2.uploader.destroy(mediaPublicId, {
            resource_type: resourceType,
          });
        }
      });
      await Promise.all(deleteMediaPromises);
    }

    // Delete blog from database
    await blog.deleteOne();
    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      authorName,
      title,
      category,
      subCategory,
      summary,
      content,
      travelTags,
      publishingDate,
    } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Validate input
    const validatedData = blogValidationSchema.parse(req.body);

    // Find existing blog
    const blog = await Blog.findById(id);
    if (!blog) {
      res.status(404).json({ message: "Blog not found" });
      return;
    }

    // Upload new author image (if provided)
    let authorImage = blog.authorImage;
    if (files["authorImage"] && files["authorImage"].length > 0) {
      const uploadedImage = await uploadToCloudinary(files["authorImage"]);
      authorImage = uploadedImage[0];
    }

    // Upload new media (if provided)
    let media = blog.media;
    if (files["media"] && files["media"].length > 0) {
      media = await uploadToCloudinary(files["media"]);
    }

    // Update blog data
    blog.authorName = validatedData.authorName;
    blog.title = validatedData.title;
    blog.category = validatedData.category;
    blog.subCategory = validatedData.subCategory || blog.subCategory;
    blog.summary = validatedData.summary;
    blog.content = validatedData.content;
    blog.travelTags = travelTags ? travelTags.split(",") : blog.travelTags;
    blog.publishingDate = publishingDate
      ? new Date(publishingDate)
      : blog.publishingDate;
    blog.authorImage = authorImage;
    blog.media = media;

    await blog.save();
    res.status(200).json(blog);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
