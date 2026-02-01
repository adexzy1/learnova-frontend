"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { PageHeader } from "@/components/shared/page-header";

// Mock Data
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIODS = [
  { id: 1, time: "08:00 - 08:45", name: "Period 1" },
  { id: 2, time: "08:45 - 09:30", name: "Period 2" },
  { id: 3, time: "09:30 - 10:15", name: "Period 3" },
  { id: 4, time: "10:15 - 10:45", name: "Short Break" },
  { id: 5, time: "10:45 - 11:30", name: "Period 4" },
  { id: 6, time: "11:30 - 12:15", name: "Period 5" },
  { id: 7, time: "12:15 - 13:00", name: "Period 6" },
  { id: 8, time: "13:00 - 13:45", name: "Long Break" },
  { id: 9, time: "13:45 - 14:30", name: "Period 7" },
];

const MOCK_TIMETABLE = {
  Monday: {
    1: { subject: "Mathematics", teacher: "Mrs. Johnson", room: "Hall A" },
    2: { subject: "English", teacher: "Mr. Smith", room: "Class 1A" },
    3: { subject: "Physics", teacher: "Dr. Brown", room: "Lab 1" },
    5: { subject: "Biology", teacher: "Ms. Davis", room: "Lab 2" },
    6: { subject: "Chemistry", teacher: "Mr. Wilson", room: "Lab 1" },
  },
  Tuesday: {
    1: { subject: "English", teacher: "Mr. Smith", room: "Class 1A" },
    2: { subject: "Mathematics", teacher: "Mrs. Johnson", room: "Hall A" },
    5: { subject: "Geography", teacher: "Mr. White", room: "Class 1A" },
  },
};

export default function TimetablePage() {
  const [selectedClass, setSelectedClass] = useState("jss1a");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Class Timetable"
        description="View and manage weekly class schedules"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Academics", href: "/academics" },
          { label: "Timetable" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jss1a">JSS 1A</SelectItem>
                <SelectItem value="jss1b">JSS 1B</SelectItem>
                <SelectItem value="sss1a">SSS 1A</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Entry
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule - {selectedClass.toUpperCase()}</CardTitle>
          <CardDescription>Effective from Sept 1, 2024</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border rounded-md">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium w-32 border-r">
                    Time / Period
                  </th>
                  {DAYS.map((day) => (
                    <th
                      key={day}
                      className="px-4 py-3 font-medium border-l min-w-[160px]"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {PERIODS.map((period) => (
                  <tr
                    key={period.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 py-3 border-r bg-muted/20">
                      <div className="font-semibold">{period.time}</div>
                      <div className="text-xs text-muted-foreground">
                        {period.name}
                      </div>
                    </td>
                    {DAYS.map((day) => {
                      const entry =
                        MOCK_TIMETABLE[day as keyof typeof MOCK_TIMETABLE]?.[
                          period.id as keyof typeof MOCK_TIMETABLE
                        ];
                      const isBreak = period.name.includes("Break");

                      if (isBreak) {
                        return (
                          <td
                            key={day}
                            className="bg-muted/10 border-l p-2 text-center text-xs text-muted-foreground font-medium italic"
                          >
                            BREAK
                          </td>
                        );
                      }

                      return (
                        <td key={day} className="p-2 border-l relative group">
                          {entry ? (
                            <div className="flex flex-col gap-1 p-2 rounded-md bg-primary/5 hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all cursor-pointer">
                              <span className="font-semibold text-primary">
                                {entry.subject}
                              </span>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{entry.teacher}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>{entry.room}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="h-16 w-full flex items-center justify-center rounded-md border-2 border-dashed border-transparent hover:border-muted-foreground/20 text-muted-foreground/0 hover:text-muted-foreground/50 transition-all cursor-pointer">
                              <Plus className="h-4 w-4" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
