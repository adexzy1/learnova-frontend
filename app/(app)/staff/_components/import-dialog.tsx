"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Upload, FileText, AlertCircle, Loader2 } from "lucide-react";
import { useImportStaffService } from "../_service/useImportStaffService";

interface ImportStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportStaffDialog({
  open,
  onOpenChange,
}: ImportStaffDialogProps) {
  const {
    selectedFile,
    fileInputRef,
    handleFileChange,
    handleSubmit,
    downloadTemplate,
    isLoading,
    isDownloadingTemplate,
  } = useImportStaffService(() => onOpenChange(false));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Import Staff</DialogTitle>
          <DialogDescription>
            Upload an Excel (.xlsx) or CSV file to bulk-import staff members.
            The import runs in the background — you will receive an in-app
            notification and email when it completes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Template download */}
          <div className="rounded-lg border border-dashed p-4 space-y-2">
            <p className="text-sm font-medium">Download the Excel template</p>
            <p className="text-xs text-muted-foreground">
              The template includes all required and optional columns, a dropdown
              selector for <span className="font-medium">Role</span> (populated
              with your school&apos;s actual roles), and an Instructions sheet.
              Delete the sample row before uploading.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              disabled={isDownloadingTemplate}
              className="mt-1"
            >
              {isDownloadingTemplate ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {isDownloadingTemplate ? "Downloading…" : "Download Excel Template"}
            </Button>
          </div>

          {/* File upload */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Select File
            </label>
            <div
              className="flex items-center gap-3 rounded-lg border border-input p-3 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground truncate">
                {selectedFile
                  ? selectedFile.name
                  : "Click to browse .xlsx or .csv file…"}
              </span>
              {selectedFile && (
                <span className="ml-auto text-xs text-muted-foreground shrink-0">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Info note */}
          <div className="flex gap-2 rounded-lg bg-muted/50 p-3">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              Duplicate email addresses will be skipped with an error logged per
              row. Rows with invalid data are skipped — valid rows are still
              imported. You will see a detailed report in your notification.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedFile || isLoading}>
            <Upload className="mr-2 h-4 w-4" />
            {isLoading ? "Uploading…" : "Start Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
