import { Form } from "@/components/ui/form";
import {
  Layers,
  Trash2,
  Plus,
  ChevronRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSetupClassStructure } from "../_service/onboardingService";
import z from "zod";
import { ClassStructureSchema } from "../schema/classStructureSchema";
import { StepHeader } from "../page";
import ClassArms from "./class-arms";

interface ClassStructureProps {
  goBack: () => void;
  setStep: (step: number) => void;
}

const ClassStructure = ({ goBack, setStep }: ClassStructureProps) => {
  const {
    form: classForm,
    formClassLevels,
    addClassStructure,
    isLoading,
  } = useSetupClassStructure();

  const onClassStructureSubmit = async (values: ClassStructureSchema) => {
    await addClassStructure(values);
    setStep(4);
  };

  const addClassLevel = () => {
    formClassLevels.append({
      name: "",
      level: "",
      arms: [{ name: "", capacity: 40 }],
    });
  };

  return (
    <div className="space-y-6">
      <Form {...classForm}>
        <form onSubmit={classForm.handleSubmit(onClassStructureSubmit)}>
          <div className="space-y-6">
            <StepHeader
              icon={Layers}
              title="Class Structure"
              description="Define class levels and their arms (sections)."
            />

            <div className="space-y-4">
              {formClassLevels.fields.map((cls, classIdx) => (
                <div
                  key={cls.id}
                  className="rounded-lg border bg-card p-5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Class Level {classIdx + 1}
                    </h3>

                    {formClassLevels.fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => formClassLevels.remove(classIdx)}
                        className="text-destructive h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={classForm.control}
                      name={`classes.${classIdx}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Class Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., JSS 1" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={classForm.control}
                      name={`classes.${classIdx}.level`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Level Order</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {
                    <ClassArms
                      control={classForm.control}
                      classIdx={classIdx}
                    />
                  }
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => addClassLevel()}
                className="w-full gap-2 border-dashed"
              >
                <Plus className="h-4 w-4" />
                Add Class Level
              </Button>
            </div>

            <div className="flex justify-between pt-2">
              <Button type="button" variant="ghost" onClick={goBack}>
                Back
              </Button>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Save & Continue
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ClassStructure;
