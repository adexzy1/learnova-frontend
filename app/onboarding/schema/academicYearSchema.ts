import * as z from "zod";

export const academicYearSchema = z.object({
  sessionName: z.string().min(1, "Session name is required (e.g., 2024/2025)"),
  sessionStartDate: z.string().min(1, "Start date is required"),
  sessionEndDate: z.string().min(1, "End date is required"),
  currentTermName: z
    .string()
    .min(1, "Term name is required (e.g., First Term)"),
  currentTermStartDate: z.string().min(1, "Start date is required"),
  currentTermEndDate: z.string().min(1, "End date is required"),
});

export type AcademicYearFormValues = z.infer<typeof academicYearSchema>;
