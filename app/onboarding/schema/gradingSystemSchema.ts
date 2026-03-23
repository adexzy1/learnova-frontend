import { z } from "zod";

export const gradeEntrySchema = z.object({
  grade: z.string().min(1, "Grade is required"),
  minScore: z.coerce.number().min(0).max(100, "Max 100"),
  maxScore: z.coerce.number().min(0).max(100, "Max 100"),
  gradePoint: z.coerce.number().min(0, "Grade point is required"),
  remark: z.string().min(1, "Remark is required"),
});

export const gradingPolicySchema = z.object({
  name: z.string().min(1, "Policy name is required"),
  description: z.string().min(1, "Description is required"),
  isActive: z.boolean().optional().default(true),
  grades: z.array(gradeEntrySchema).min(1, "At least one grade is required"),
});

export type GradeEntry = z.infer<typeof gradeEntrySchema>;
export type GradingPolicyFormValues = z.infer<typeof gradingPolicySchema>;
