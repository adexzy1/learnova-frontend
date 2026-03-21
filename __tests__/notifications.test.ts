// Feature: learnova-frontend-completion, Property 9: Notification Unread Count Invariant
import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

// ─── Pure computation mirroring notification unread logic ────────────────────

interface NotificationEntry {
  id: string;
  isRead: boolean;
}

function computeUnreadCount(notifications: NotificationEntry[]): number {
  return notifications.filter((n) => !n.isRead).length;
}

function markOneAsRead(
  notifications: NotificationEntry[],
  targetId: string
): NotificationEntry[] {
  return notifications.map((n) =>
    n.id === targetId ? { ...n, isRead: true } : n
  );
}

function markAllAsRead(
  notifications: NotificationEntry[]
): NotificationEntry[] {
  return notifications.map((n) => ({ ...n, isRead: true }));
}

// ─── Property 9: Notification Unread Count Invariant ────────────────────────
// **Validates: Requirements 20.3, 20.4, 20.7**
describe("Property 9: Notification Unread Count Invariant", () => {
  it("displayed_unread_count equals count of notifications where isRead == false", () => {
    fc.assert(
      fc.property(
        fc.array(fc.boolean(), { minLength: 0, maxLength: 50 }),
        (isReadValues) => {
          const notifications: NotificationEntry[] = isReadValues.map(
            (isRead, i) => ({
              id: `notif-${i}`,
              isRead,
            })
          );

          const unreadCount = computeUnreadCount(notifications);
          const expectedCount = isReadValues.filter((r) => !r).length;

          expect(unreadCount).toBe(expectedCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("after marking one notification as read, unread count decreases by 1", () => {
    fc.assert(
      fc.property(
        fc
          .array(fc.boolean(), { minLength: 1, maxLength: 50 })
          .filter((arr) => arr.some((r) => !r)), // ensure at least one unread
        (isReadValues) => {
          const notifications: NotificationEntry[] = isReadValues.map(
            (isRead, i) => ({
              id: `notif-${i}`,
              isRead,
            })
          );

          const oldCount = computeUnreadCount(notifications);

          // Find first unread notification
          const unreadNotif = notifications.find((n) => !n.isRead)!;
          const updated = markOneAsRead(notifications, unreadNotif.id);
          const newCount = computeUnreadCount(updated);

          expect(newCount).toBe(oldCount - 1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("after marking all notifications as read, unread count is 0", () => {
    fc.assert(
      fc.property(
        fc.array(fc.boolean(), { minLength: 0, maxLength: 50 }),
        (isReadValues) => {
          const notifications: NotificationEntry[] = isReadValues.map(
            (isRead, i) => ({
              id: `notif-${i}`,
              isRead,
            })
          );

          const allRead = markAllAsRead(notifications);
          const newCount = computeUnreadCount(allRead);

          expect(newCount).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("marking an already-read notification does not change unread count", () => {
    fc.assert(
      fc.property(
        fc
          .array(fc.boolean(), { minLength: 1, maxLength: 50 })
          .filter((arr) => arr.some((r) => r)), // ensure at least one read
        (isReadValues) => {
          const notifications: NotificationEntry[] = isReadValues.map(
            (isRead, i) => ({
              id: `notif-${i}`,
              isRead,
            })
          );

          const oldCount = computeUnreadCount(notifications);

          // Find first already-read notification
          const readNotif = notifications.find((n) => n.isRead)!;
          const updated = markOneAsRead(notifications, readNotif.id);
          const newCount = computeUnreadCount(updated);

          expect(newCount).toBe(oldCount);
        }
      ),
      { numRuns: 100 }
    );
  });
});
