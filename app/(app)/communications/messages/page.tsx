"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Inbox,
  Send,
  Archive,
  MoreVertical,
  Paperclip,
  CheckCheck,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { fetchMessages } from "@/lib/api";
import type { Message } from "@/types";

export default function MessagesPage() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);

  const { data: messages, isLoading } = useQuery({
    queryKey: ["messages"],
    queryFn: fetchMessages,
  });

  // Select first message by default if none selected
  if (!selectedMessage && messages && messages.length > 0) {
    setSelectedMessage(messages[0]);
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-lg border bg-background md:flex-row overflow-hidden">
      {/* Sidebar List */}
      <div className="w-full md:w-[320px] lg:w-[400px] flex flex-col border-r">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Messages</h2>
            <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
              <DialogTrigger asChild>
                <Button size="icon" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Message</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>To</Label>
                    <Input placeholder="Select recipient..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input placeholder="Message subject" />
                  </div>
                  <div className="space-y-2">
                    <Label>Message</Label>
                    <Textarea
                      placeholder="Type your message here..."
                      className="min-h-[150px]"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setComposeOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => setComposeOpen(false)}>
                      Send Message
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search messages..." className="pl-8" />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="flex flex-col">
            {messages?.map((message) => (
              <button
                key={message.id}
                onClick={() => setSelectedMessage(message)}
                className={`flex flex-col gap-2 p-4 text-left transition-colors hover:bg-muted/50 border-b last:border-0 ${
                  selectedMessage?.id === message.id ? "bg-muted" : ""
                }`}
              >
                <div className="flex w-full flex-col gap-1">
                  <div className="flex items-center">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">{message.senderName}</div>
                      {!message.readAt && (
                        <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <div className="ml-auto text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(message.sentAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                  <div className="text-xs font-medium">{message.subject}</div>
                </div>
                <div className="line-clamp-2 text-xs text-muted-foreground">
                  {message.content.substring(0, 300)}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Message View */}
      {selectedMessage ? (
        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarFallback>{selectedMessage.senderName[0]}</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <div className="font-semibold">
                  {selectedMessage.senderName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedMessage.subject}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground mr-2">
                {format(new Date(selectedMessage.sentAt), "PPP p")}
              </div>
              <Button variant="ghost" size="icon">
                <Archive className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Separator />
          <ScrollArea className="flex-1 p-4">
            <div className="max-w-3xl space-y-4 text-sm leading-relaxed">
              <p>{selectedMessage.content}</p>
            </div>
          </ScrollArea>
          <Separator />
          <div className="p-4">
            <form className="flex flex-col gap-4">
              <Textarea
                placeholder={`Reply to ${selectedMessage.senderName}...`}
                className="min-h-[100px]"
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" size="icon">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </div>
                <Button>
                  <Send className="mr-2 h-4 w-4" />
                  Send Reply
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground">
          <Inbox className="h-12 w-12 mb-4" />
          <p>Select a message to read</p>
        </div>
      )}
    </div>
  );
}
