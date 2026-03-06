"use client";

import { Calendar, Loader2, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useSetAcademicYear } from "../_service/onboardingService";
import { AcademicYearFormValues } from "../schema/academicYearSchema";
import { StepHeader } from "../page";

interface AcademicSessionProps {
  goBack: () => void;
  setStep: (step: number) => void;
}

const AcademicSession = ({ goBack, setStep }: AcademicSessionProps) => {
  const {
    setAcademicYear,
    isLoading: isSessionLoading,
    form: academicForm,
  } = useSetAcademicYear();

  const onAcademicSubmit = async (data: AcademicYearFormValues) => {
    await setAcademicYear(data);
    setStep(3);
  };

  return (
    <div className="space-y-6">
      <StepHeader
        icon={Calendar}
        title="Academic Session & Term"
        description="Set up your current academic session and term."
      />

      <div className="space-y-8">
        <Form {...academicForm}>
          <form onSubmit={academicForm.handleSubmit(onAcademicSubmit)}>
            <div className="rounded-lg border bg-card p-6 space-y-4">
              <h3 className="text-base font-medium">
                Current Academic Session
              </h3>
              <div className="space-y-4">
                <FormField
                  control={academicForm.control}
                  name="sessionName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 2024/2025" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={academicForm.control}
                    name="sessionStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={academicForm.control}
                    name="sessionEndDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Term */}
            <div className="rounded-lg border bg-card p-6 space-y-4 mt-10">
              <h3 className="text-base font-medium">Current Term</h3>
              <div className="space-y-4">
                <FormField
                  control={academicForm.control}
                  name="currentTermName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Term Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., First Term" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={academicForm.control}
                    name="currentTermStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={academicForm.control}
                    name="currentTermEndDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

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
              <Button
                type="submit"
                className="gap-2"
                disabled={isSessionLoading}
              >
                {isSessionLoading ? (
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
    </div>
  );
};

export default AcademicSession;
