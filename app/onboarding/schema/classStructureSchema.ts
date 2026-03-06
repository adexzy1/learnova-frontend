import { z } from "zod";

export const classStructureSchema = z.object({
  classes: z.array(
    z.object({
      name: z.string().min(1, "Class name is required"),
      level: z.string().min(1, "Level is required"),
      arms: z.array(
        z.object({
          name: z.string().min(1, "Arm name is required"),
          capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
        }),
      ),
    }),
  ),
});

export type ClassStructureSchema = z.infer<typeof classStructureSchema>;
