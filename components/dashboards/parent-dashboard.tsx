"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  CreditCard,
  FileText,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";

// Mock Children Data
const MY_CHILDREN = [
  {
    id: "student-1",
    name: "John Doe",
    class: "JSS 1A",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  },
  {
    id: "student-2",
    name: "Jane Smith",
    class: "SSS 2B",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
  },
];

export default function ParentDashboard() {
  const [selectedChild, setSelectedChild] = useState(MY_CHILDREN[0].id);

  const currentChild = MY_CHILDREN.find((c) => c.id === selectedChild);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Parent Portal</h2>
          <p className="text-muted-foreground">
            Monitor your children's progress and stay connected.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Viewing:
          </span>
          <Select value={selectedChild} onValueChange={setSelectedChild}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MY_CHILDREN.map((child) => (
                <SelectItem key={child.id} value={child.id}>
                  {child.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Academic Results
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Published</div>
            <p className="text-xs text-muted-foreground">First Term 2024/25</p>
          </CardContent>
        </Card>
        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Outstanding Fees
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">₦25,000</div>
            <p className="text-xs text-muted-foreground">Due in 5 days</p>
          </CardContent>
        </Card>
        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95%</div>
            <p className="text-xs text-muted-foreground">
              Current Term Average
            </p>
          </CardContent>
        </Card>
        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2 New</div>
            <p className="text-xs text-muted-foreground">From Class Teacher</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Child Profile - {currentChild?.name}</CardTitle>
            <CardDescription>
              {currentChild?.class} • 12 Years Old
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-6">
              <Avatar className="h-32 w-32 border-4 border-muted">
                <AvatarImage src={currentChild?.avatar} />
                <AvatarFallback>{currentChild?.name[0]}</AvatarFallback>
              </Avatar>
              <div className="space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Admission Number
                    </p>
                    <p className="font-medium">ADM/2023/104</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Class Teacher
                    </p>
                    <p className="font-medium">Mrs. Sarah Williams</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Date of Birth
                    </p>
                    <p className="font-medium">10th May, 2012</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">House</p>
                    <p className="font-medium">Blue House</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm">View Full Profile</Button>
                  <Button size="sm" variant="outline">
                    Update Info
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: "Mid-Term Break",
                  date: "Oct 24 - Oct 28",
                  type: "Holiday",
                },
                {
                  title: "PTA Meeting",
                  date: "Nov 5, 10:00 AM",
                  type: "Meeting",
                },
                { title: "Sports Day", date: "Nov 15", type: "Event" },
              ].map((event, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex flex-col items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary font-bold text-xs uppercase">
                    <span>{event.date.split(" ")[0]}</span>
                    <span className="text-lg">
                      {event.date.split(" ")[1].replace(",", "")}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <Badge variant="secondary" className="text-[10px] h-5">
                      {event.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
