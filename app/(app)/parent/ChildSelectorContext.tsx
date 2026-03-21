"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { GUARDIAN_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import type { Student } from "@/types";
import type { AxiosResponse } from "axios";

interface ChildSelectorContextValue {
  children: Student[];
  selectedChildId: string | null;
  setSelectedChildId: (id: string) => void;
  isLoading: boolean;
}

const ChildSelectorContext = createContext<ChildSelectorContextValue | null>(null);

export function useChildSelector(): ChildSelectorContextValue {
  const ctx = useContext(ChildSelectorContext);
  if (!ctx) {
    throw new Error("useChildSelector must be used within a ChildSelectorProvider");
  }
  return ctx;
}

export function ChildSelectorProvider({ children: reactChildren }: { children: React.ReactNode }) {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  const { data: response, isLoading } = useQuery<AxiosResponse<Student[]>>({
    queryKey: [queryKeys.MY_CHILDREN],
    queryFn: () => apiClient.get(GUARDIAN_ENDPOINTS.GET_MY_CHILDREN),
  });

  const students = response?.data ?? [];

  // Default to first child when data loads
  useEffect(() => {
    if (students.length > 0 && selectedChildId === null) {
      setSelectedChildId(students[0].id);
    }
  }, [students, selectedChildId]);

  return (
    <ChildSelectorContext.Provider
      value={{ children: students, selectedChildId, setSelectedChildId, isLoading }}
    >
      {reactChildren}
    </ChildSelectorContext.Provider>
  );
}

export { ChildSelectorContext };
