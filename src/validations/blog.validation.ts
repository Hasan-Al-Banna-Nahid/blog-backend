import { z } from "zod";

export const blogValidationSchema = z.object({
  authorName: z.string().min(3, "Author name must be at least 3 characters"),
  title: z.string().min(5, "Title must be at least 5 characters"),
  category: z.string().min(3, "Category is required"),
  subCategory: z.string().optional(),
  summary: z.string().min(10, "Summary must be at least 10 characters"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  travelTags: z.string().optional(),
  publishingDate: z.string().optional(),
});
