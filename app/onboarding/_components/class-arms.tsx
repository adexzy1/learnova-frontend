import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray } from "react-hook-form";

type Props = {
  control: any;
  classIdx: number;
};

const ClassArms = ({ control, classIdx }: Props) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `classes.${classIdx}.arms`,
  });
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-muted-foreground">
          Arms / Sections
        </label>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ name: "", capacity: 40 })}
          className="h-7 text-xs gap-1"
        >
          <Plus className="h-3 w-3" />
          Add Arm
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {fields.map((arm, armIdx) => (
          <div
            key={arm.id}
            className="flex items-center gap-2 rounded-md border bg-muted/20 p-2"
          >
            <FormField
              control={control}
              name={`classes.${classIdx}.arms.${armIdx}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      className="h-8 text-sm"
                      placeholder="Arm name"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`classes.${classIdx}.arms.${armIdx}.capacity`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      className="h-8 w-20 text-sm"
                      placeholder="Cap"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {fields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(armIdx)}
                className="h-8 w-8 p-0 text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassArms;
