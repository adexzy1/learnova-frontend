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
import { Input } from "@/components/ui/input";
import { BrandingSettings } from "../types";
import { useUpdateBranding } from "./service/branding.service";
import { LogoUploader } from "./logo-uploader";

interface BrandingManagerProps {
  data?: BrandingSettings;
}

export default function BrandingManager({ data }: BrandingManagerProps) {
  const { updateBranding, isPending } = useUpdateBranding();
  const [branding, setBranding] = useState<BrandingSettings>({
    primaryColor: data?.primaryColor || "#2563eb",
    logoUrl: data?.logoUrl || "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("primaryColor", branding.primaryColor);
    if (logoFile) {
      formData.append("logo", logoFile);
      await updateBranding(formData);
    } else {
      await updateBranding(branding);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Look & Feel</CardTitle>
        <CardDescription>
          Customize the school portal appearance.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <Label>School Logo</Label>
            <LogoUploader
              value={logoFile || branding.logoUrl || null}
              onChange={(file) => setLogoFile(file)}
              defaultImage={branding.logoUrl}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Recommended size: 200x200px (PNG, JPG, WebP)
            </p>
          </div>
          <div className="space-y-2 max-w-1/2">
            <Label>Primary Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                className="w-12 p-1"
                value={branding.primaryColor}
                onChange={(e) =>
                  setBranding({ ...branding, primaryColor: e.target.value })
                }
              />
              <Input
                value={branding.primaryColor}
                onChange={(e) =>
                  setBranding({ ...branding, primaryColor: e.target.value })
                }
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isPending}>
            <Save className="mr-2 h-4 w-4" />
            {isPending ? "Updating..." : "Update Branding"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
