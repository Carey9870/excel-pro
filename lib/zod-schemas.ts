import { z } from "zod";

export const generateSchema = z.object({
  input: z.string().min(1, "Input is required").max(500, "Input is too long"),
  outputType: z.enum(["formula", "vba", "chart"]),
});

export const ratingSchema = z.object({
  queryId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
});
