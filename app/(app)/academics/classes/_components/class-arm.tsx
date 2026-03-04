import { ClassArm as ClassArmType } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Trash2 } from "lucide-react";
import { useClassArm } from "../_hooks/useClassArm";
import { DeleteClassArmDialog } from "./delete-class-arm-dialog";

interface ClassArmProps {
  arm: ClassArmType;
  classId: string;
}

const ClassArm = ({ arm, classId }: ClassArmProps) => {
  const {
    handleDeleteArm,
    deleteArmOpen,
    setDeleteArmOpen,
    selectedArm,
    confirmDeleteArm,
    isDeleting,
  } = useClassArm(classId);

  return (
    <>
      <div
        key={arm.id}
        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
      >
        <div className="flex items-center gap-2">
          <Badge variant="outline">{arm.name}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{arm.capacity}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => handleDeleteArm(arm)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <DeleteClassArmDialog
        open={deleteArmOpen}
        onOpenChange={setDeleteArmOpen}
        armName={selectedArm ? selectedArm.name : ""}
        onConfirm={confirmDeleteArm}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default ClassArm;
