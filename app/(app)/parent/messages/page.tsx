"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { AxiosResponse } from "axios";
import apiClient from "@/lib/api-client";
import { COMMUNICATIONS_ENDPOINTS } from "@/lib/api-routes";
import { queryKeys } from "@/app/constants/queryKeys";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import { Mail, MailOpen, Pencil } from "lucide-react";
import type { PaginatedResponse } from "@/types";

// ─── Extended Message type with isRead ───────────────────────────────────────

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientIds: string[];
  subject: string;
  content: string;
  status: "sent" | "delivered" | "read";
  sentAt: string;
  readAt?: string;
  isRead: boolean;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function MessagesSkeleton() {
  return (
    <Card>
      <CardContent className="p-6 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Compose Dialog ───────────────────────────────────────────────────────────

interface ComposeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ComposeDialog({ open, onOpenChange }: ComposeDialogProps) {
  const queryClient = useQueryClient();
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!to.trim() || !subject.trim() || !body.trim()) return;
    setSending(true);
    try {
      await apiClient.post(COMMUNICATIONS_ENDPOINTS.MESSAGES_CREATE, {
        to: to.trim(),
        subject: subject.trim(),
        content: body.trim(),
      });
      toast.success("Message sent.");
      queryClient.invalidateQueries({ queryKey: [queryKeys.MESSAGES] });
      setTo("");
      setSubject("");
      setBody("");
      onOpenChange(false);
    } catch {
      toast.error("Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="compose-to">To</Label>
            <Input
              id="compose-to"
              placeholder="Recipient name or email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="compose-subject">Subject</Label>
            <Input
              id="compose-subject"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="compose-body">Message</Label>
            <Textarea
              id="compose-body"
              placeholder="Write your message…"
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={sending}>
              {sending ? "Sending…" : "Send"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Reply Dialog ─────────────────────────────────────────────────────────────

interface ReplyDialogProps {
  message: Message;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ReplyDialog({ message, open, onOpenChange }: ReplyDialogProps) {
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    try {
      const url = COMMUNICATIONS_ENDPOINTS.MESSAGES_REPLY.replace(":id", message.id);
      await apiClient.post(url, { content: body.trim() });
      toast.success("Reply sent.");
      queryClient.invalidateQueries({ queryKey: [queryKeys.MESSAGES] });
      setBody("");
      onOpenChange(false);
    } catch {
      toast.error("Failed to send reply.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Reply to: {message.subject}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="reply-body">Message</Label>
            <Textarea
              id="reply-body"
              placeholder="Write your reply…"
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={sending}>
              {sending ? "Sending…" : "Reply"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Message Detail Panel ─────────────────────────────────────────────────────

interface MessageDetailProps {
  message: Message;
  onClose: () => void;
}

function MessageDetail({ message, onClose }: MessageDetailProps) {
  const [replyOpen, setReplyOpen] = useState(false);

  return (
    <>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">{message.subject}</h2>
              <p className="text-sm text-muted-foreground">
                From: <span className="font-medium text-foreground">{message.senderName}</span>
                {" · "}
                {format(new Date(message.sentAt), "MMM d, yyyy h:mm a")}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button size="sm" variant="outline" onClick={() => setReplyOpen(true)}>
                Reply
              </Button>
              <Button size="sm" variant="ghost" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
          <div className="rounded-md bg-muted/40 p-4 text-sm whitespace-pre-wrap">
            {message.content}
          </div>
        </CardContent>
      </Card>

      <ReplyDialog
        message={message}
        open={replyOpen}
        onOpenChange={setReplyOpen}
      />
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ParentMessagesPage() {
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);

  const { data: messagesResponse, isLoading } = useQuery<
    AxiosResponse<PaginatedResponse<Message>>
  >({
    queryKey: [queryKeys.MESSAGES],
    queryFn: () => apiClient.get(COMMUNICATIONS_ENDPOINTS.MESSAGES_GET),
  });

  const messages = messagesResponse?.data?.data ?? [];
  const unreadCount = messages.filter((m) => !m.isRead).length;

  async function handleSelectMessage(message: Message) {
    setSelectedMessage(message);
    if (!message.isRead) {
      try {
        const url = COMMUNICATIONS_ENDPOINTS.MESSAGES_MARK_READ.replace(":id", message.id);
        await apiClient.patch(url);
        queryClient.invalidateQueries({ queryKey: [queryKeys.MESSAGES] });
      } catch {
        // silently fail — don't block reading
      }
    }
  }

  const headerActions = (
    <Button size="sm" onClick={() => setComposeOpen(true)}>
      <Pencil className="mr-2 h-4 w-4" />
      Compose
    </Button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        actions={
          <>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-sm">
                {unreadCount} unread
              </Badge>
            )}
            {headerActions}
          </>
        }
      />

      {isLoading ? (
        <MessagesSkeleton />
      ) : messages.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">No messages yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Message list */}
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y">
                {messages.map((message) => {
                  const isSelected = selectedMessage?.id === message.id;
                  return (
                    <li
                      key={message.id}
                      onClick={() => handleSelectMessage(message)}
                      className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50 ${
                        isSelected ? "bg-muted/70" : ""
                      } ${!message.isRead ? "font-semibold" : ""}`}
                    >
                      <span className="mt-0.5 flex-shrink-0 text-muted-foreground">
                        {message.isRead ? (
                          <MailOpen className="h-4 w-4" />
                        ) : (
                          <Mail className="h-4 w-4 text-primary" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm">{message.senderName}</span>
                          <span className="flex-shrink-0 text-xs text-muted-foreground">
                            {format(new Date(message.sentAt), "MMM d")}
                          </span>
                        </div>
                        <p className="truncate text-sm text-muted-foreground">
                          {message.subject}
                        </p>
                        <p className="truncate text-xs text-muted-foreground/70">
                          {message.content}
                        </p>
                      </div>
                      {!message.isRead && (
                        <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                      )}
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          {/* Detail panel */}
          {selectedMessage && (
            <MessageDetail
              message={selectedMessage}
              onClose={() => setSelectedMessage(null)}
            />
          )}
        </div>
      )}

      <ComposeDialog open={composeOpen} onOpenChange={setComposeOpen} />
    </div>
  );
}
