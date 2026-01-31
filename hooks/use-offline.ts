'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDraftStore } from '@/lib/stores/draft-store'

/**
 * Hook to manage offline state and draft synchronization
 */
export function useOffline() {
  const [isOnline, setIsOnline] = useState(true)
  const { getUnsyncedDrafts, markSynced, deleteDraft } = useDraftStore()

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine)

    // Event listeners for online/offline
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  /**
   * Sync all unsynced drafts when online
   * @param syncFn - Function to sync a single draft to the server
   */
  const syncDrafts = useCallback((syncFn) => {
    if (!isOnline) return

    const unsynced = getUnsyncedDrafts()
    
    for (const draft of unsynced) {
      try {
        syncFn(draft.data)
        markSynced(draft.type, draft.id)
      } catch (error) {
        console.error(`Failed to sync draft ${draft.id}:`, error)
      }
    }
  }, [isOnline, getUnsyncedDrafts, markSynced])

  /**
   * Clear a draft after successful server submission
   */
  const clearDraftAfterSync = useCallback((
    type: 'ca-scores' | 'exam-scores' | 'admission-form' | 'message',
    id: string
  ) => {
    deleteDraft(type, id)
  }, [deleteDraft])

  return {
    isOnline,
    isOffline: !isOnline,
    syncDrafts,
    clearDraftAfterSync,
    unsyncedCount: getUnsyncedDrafts().length,
  }
}

/**
 * Hook for auto-saving drafts with debounce
 */
export function useAutosaveDraft<T>(
  type: 'ca-scores' | 'exam-scores' | 'admission-form' | 'message',
  id: string,
  delay = 1000
) {
  const { saveDraft, getDraft, deleteDraft } = useDraftStore()
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const save = useCallback((data: T) => {
    saveDraft(type, id, data)
    setLastSaved(new Date())
  }, [type, id, saveDraft])

  const restore = useCallback((): T | undefined => {
    const draft = getDraft<T>(type, id)
    return draft?.data
  }, [type, id, getDraft])

  const clear = useCallback(() => {
    deleteDraft(type, id)
    setLastSaved(null)
  }, [type, id, deleteDraft])

  // Debounced save
  const debouncedSave = useCallback((data: T) => {
    const timeoutId = setTimeout(() => {
      save(data)
    }, delay)
    
    return () => clearTimeout(timeoutId)
  }, [save, delay])

  return {
    save,
    debouncedSave,
    restore,
    clear,
    lastSaved,
    hasDraft: !!getDraft(type, id),
  }
}
