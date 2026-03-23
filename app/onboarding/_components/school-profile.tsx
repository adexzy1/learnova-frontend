"use client";

import { Building2, Loader2, ChevronRight, Info } from "lucide-react";
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
  FormDescription,
} from "@/components/ui/form";
import { useAuth } from "@/providers/app-auth-provider";
import { useUpdateSchoolProfile } from "../_service/onboardingService";
import { StepHeader } from "../page";

interface SchoolProfileProps {
  setStep: (step: number) => void;
}

const SchoolProfile = ({ setStep }: SchoolProfileProps) => {
  const { user } = useAuth();
  const {
    updateProfile,
    isLoading: isProfileLoading,
    form: profileForm,
  } = useUpdateSchoolProfile(user);

  const onProfileSubmit = async (data: any) => {
    await updateProfile(data);
    setStep(2);
  };

  return (
    <div className="space-y-6">
      <StepHeader
        icon={Building2}
        title="School Profile"
        description="Review and complete your institution's details."
      />

      <Form {...profileForm}>
        <form
          onSubmit={profileForm.handleSubmit(onProfileSubmit)}
          className="space-y-6"
        >
          {/* Pre-filled read-only fields */}
          <div className="rounded-lg border border-dashed border-muted-foreground/25 bg-muted/20 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Info className="h-3.5 w-3.5" />
              <span>
                Pre-filled from registration — verify and update if needed
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={profileForm.control}
                name="schoolName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="LearNova Academy" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email *</FormLabel>
                    <FormControl>
                      <Input placeholder="admin@school.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={profileForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone *</FormLabel>
                  <FormControl>
                    <Input placeholder="+234 800 000 0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Additional fields */}
          <div className="space-y-4">
            <FormField
              control={profileForm.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School Address *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 15 Adeola Odeku Street, Victoria Island, Lagos"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={profileForm.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="www.school.edu.ng" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={profileForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief description of your school, its mission, or motto..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This may appear on reports and communications.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" className="gap-2" disabled={isProfileLoading}>
              {isProfileLoading ? (
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

export default SchoolProfile;
