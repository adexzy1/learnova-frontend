"use client";
import { Save } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AcademicConfig } from "../types";
import { useUpdateAcademicConfig } from "./service/academic-config.service";

interface AcademicConfigManagerProps {
  data?: AcademicConfig;
}

export default function AcademicConfigManager({
  data,
}: AcademicConfigManagerProps) {
  const { updateConfig, isPending, sessions, terms } =
    useUpdateAcademicConfig();
  const [config, setConfig] = useState<AcademicConfig>({
    currentSessionId: data?.currentSessionId || "",
    currentTermId: data?.currentTermId || "",
    autoPromoteStudents: data?.autoPromoteStudents ?? false,
    lockPastResults: data?.lockPastResults ?? true,
  });

  const handleSave = async () => {
    await updateConfig(config);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Academic Rules</CardTitle>
        <CardDescription>
          Configure promotion rules and grading defaults.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Current Session</Label>
            <Select
              value={config.currentSessionId}
              onValueChange={(val) =>
                setConfig({ ...config, currentSessionId: val })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Session" />
              </SelectTrigger>
              <SelectContent>
                {sessions.map((session) => (
                  <SelectItem key={session.id} value={session.id}>
                    {session.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Current Term</Label>
            <Select
              value={config.currentTermId}
              onValueChange={(val) =>
                setConfig({ ...config, currentTermId: val })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Term" />
              </SelectTrigger>
              <SelectContent>
                {terms.map((term) => (
                  <SelectItem key={term.id} value={term.id}>
                    {term.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Auto-Promote Students</Label>
            <p className="text-sm text-muted-foreground">
              Automatically promote students who pass to the next class at
              session end.
            </p>
          </div>
          <Switch
            checked={config.autoPromoteStudents}
            onCheckedChange={(checked) =>
              setConfig({ ...config, autoPromoteStudents: checked })
            }
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Lock Past Results</Label>
            <p className="text-sm text-muted-foreground">
              Prevent modification of results from previous terms.
            </p>
          </div>
          <Switch
            checked={config.lockPastResults}
            onCheckedChange={(checked) =>
              setConfig({ ...config, lockPastResults: checked })
            }
          />
        </div>
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isPending}>
            <Save className="mr-2 h-4 w-4" />
            {isPending ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
