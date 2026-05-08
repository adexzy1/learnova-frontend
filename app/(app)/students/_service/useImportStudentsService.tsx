"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import axiosClient from "@/lib/axios-client";
import { STUDENT_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { toast } from "sonner";

const ACCEPTED_EXTENSIONS = [".csv", ".xlsx"];

export const useImportStudentsService = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axiosClient.post(
        STUDENT_ENDPOINTS.IMPORT_STUDENTS,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.STUDENTS] });
      toast.success("Import queued", {
        description:
          data?.message ||
          "Your import is being processed. You will be notified by email and in-app when it completes.",
        duration: 6000,
      });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error("Import failed", {
        description:
          error?.response?.data?.message ||
          "Failed to start the import. Please check your file and try again.",
      });
    },
  });

  const downloadTemplate = async () => {
    setIsDownloadingTemplate(true);
    try {
      const response = await axiosClient.get(
        STUDENT_ENDPOINTS.IMPORT_STUDENTS_TEMPLATE,
        { responseType: "blob" },
      );
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "student-import-template.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Download failed", {
        description: "Could not download the template. Please try again.",
      });
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext))) {
      toast.error("Invalid file type", {
        description: "Only .csv or .xlsx files are accepted.",
      });
      e.target.value = "";
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      toast.error("No file selected", {
        description: "Please select a CSV or Excel file to import.",
      });
      return;
    }
    importMutation.mutate(selectedFile);
  };

  return {
    selectedFile,
    fileInputRef,
    handleFileChange,
    handleSubmit,
    downloadTemplate,
    isLoading: importMutation.isPending,
    isDownloadingTemplate,
  };
};
