"use client";

import {
  GraduationCap,
  Loader2,
  ChevronRight,
  ArrowLeft,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSetGradingSystem } from "../_service/onboardingService";
import type {
  GradingPolicyFormValues,
  GradeEntry,
} from "../schema/gradingSystemSchema";
import { StepHeader } from "../page";

// ─── Grading presets ────────────────────────────────────────────────

const NIGERIAN_GRADES: GradeEntry[] = [
  {
    grade: "A",
    minScore: 70,
    maxScore: 100,
    gradePoint: 5,
    remark: "Excellent",
  },
  {
    grade: "B",
    minScore: 60,
    maxScore: 69,
    gradePoint: 4,
    remark: "Very Good",
  },
  { grade: "C", minScore: 50, maxScore: 59, gradePoint: 3, remark: "Good" },
  { grade: "D", minScore: 45, maxScore: 49, gradePoint: 2, remark: "Fair" },
  { grade: "E", minScore: 40, maxScore: 44, gradePoint: 1, remark: "Poor" },
  { grade: "F", minScore: 0, maxScore: 39, gradePoint: 0, remark: "Fail" },
];

const PRESETS: Record<string, GradeEntry[]> = {
  nigerian: NIGERIAN_GRADES,
};

interface GradingSystemProps {
  goBack: () => void;
  setStep: (step: number) => void;
}

const GradingSystem = ({ goBack, setStep }: GradingSystemProps) => {
  const {
    setGradingSystem,
    isLoading: isGradingLoading,
    form: gradingForm,
    formGrades,
  } = useSetGradingSystem();

  const onGradingSubmit = async (data: GradingPolicyFormValues) => {
    await setGradingSystem(data);
    setStep(5);
  };

  const handlePresetChange = (preset: string) => {
    if (preset === "custom") {
      gradingForm.setValue("grades", [
        { grade: "", minScore: 0, maxScore: 100, gradePoint: 0, remark: "" },
      ]);
    } else if (PRESETS[preset]) {
      gradingForm.setValue("grades", PRESETS[preset]);
    }
  };

  const addGradeRow = () => {
    formGrades.append({
      grade: "",
      minScore: 0,
      maxScore: 100,
      gradePoint: 0,
      remark: "",
    });
  };

  return (
    <div className="space-y-6">
      <StepHeader
        icon={GraduationCap}
        title="Grading System"
        description="Configure the grading scale for assessments and results."
      />

      <Form {...gradingForm}>
        <form
          onSubmit={gradingForm.handleSubmit(onGradingSubmit)}
          className="space-y-6"
        >
          {/* Policy name & description */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h3 className="text-base font-medium">Grading Policy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={gradingForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Standard Grading Policy"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={gradingForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe this grading policy..."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Preset selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Grading Preset</label>
            <Select onValueChange={handlePresetChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a preset to auto-fill grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nigerian">
                  Nigerian Standard (A – F)
                </SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select a preset to start, then customize as needed.
            </p>
          </div>

          {/* Grade table */}
          <div className="rounded-lg border overflow-hidden">
            <div className="grid grid-cols-[60px_1fr_1fr_80px_1fr_40px] gap-0 bg-muted/50 px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <span>Grade</span>
              <span>Min Score</span>
              <span>Max Score</span>
              <span>Points</span>
              <span>Remark</span>
              <span></span>
            </div>
            {formGrades.fields.map((gradeField, idx) => (
              <div
                key={gradeField.id}
                className="grid grid-cols-[60px_1fr_1fr_80px_1fr_40px] gap-0 px-4 py-2 border-t items-center"
              >
                <FormField
                  control={gradingForm.control}
                  name={`grades.${idx}.grade`}
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormControl>
                        <Input
                          className="h-8 w-12 text-sm font-semibold text-center"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={gradingForm.control}
                  name={`grades.${idx}.minScore`}
                  render={({ field }) => (
                    <FormItem className="space-y-0 pr-2">
                      <FormControl>
                        <Input
                          type="number"
                          className="h-8 text-sm"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={gradingForm.control}
                  name={`grades.${idx}.maxScore`}
                  render={({ field }) => (
                    <FormItem className="space-y-0 pr-2">
                      <FormControl>
                        <Input
                          type="number"
                          className="h-8 text-sm"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={gradingForm.control}
                  name={`grades.${idx}.gradePoint`}
                  render={({ field }) => (
                    <FormItem className="space-y-0 pr-2">
                      <FormControl>
                        <Input
                          type="number"
                          className="h-8 text-sm"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={gradingForm.control}
                  name={`grades.${idx}.remark`}
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormControl>
                        <Input className="h-8 text-sm" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex justify-center">
                  {formGrades.fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => formGrades.remove(idx)}
                      className="h-8 w-8 p-0 text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addGradeRow}
            className="w-full gap-2 border-dashed"
          >
            <Plus className="h-4 w-4" />
            Add Grade
          </Button>

          <div className="flex justify-between pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={goBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button type="submit" className="gap-2" disabled={isGradingLoading}>
              {isGradingLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Save & Continue
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default GradingSystem;
