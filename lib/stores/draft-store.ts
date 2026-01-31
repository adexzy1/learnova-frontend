import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Offline-safe drafts for CA scores, exam scores, and long forms
interface Draft<T = unknown> {
  id: string
  type: 'ca-scores' | 'exam-scores' | 'admission-form' | 'message'
  data: T
  savedAt: string
  syncedAt?: string
  isSynced: boolean
}

interface DraftStore {
  drafts: Draft[]
  
  // Save a draft
  saveDraft: <T>(type: Draft['type'], id: string, data: T) => void
  
  // Get a draft by type and id
  getDraft: <T>(type: Draft['type'], id: string) => Draft<T> | undefined
  
  // Get all drafts of a type
  getDraftsByType: <T>(type: Draft['type']) => Draft<T>[]
  
  // Mark draft as synced
  markSynced: (type: Draft['type'], id: string) => void
  
  // Delete a draft
  deleteDraft: (type: Draft['type'], id: string) => void
  
  // Clear all drafts of a type
  clearDraftsByType: (type: Draft['type']) => void
  
  // Get unsynced drafts
  getUnsyncedDrafts: () => Draft[]
}

export const useDraftStore = create<DraftStore>()(
  persist(
    (set, get) => ({
      drafts: [],

      saveDraft: (type, id, data) => {
        set((state) => {
          const existingIndex = state.drafts.findIndex(
            d => d.type === type && d.id === id
          )
          
          const newDraft: Draft = {
            id,
            type,
            data,
            savedAt: new Date().toISOString(),
            isSynced: false,
          }

          if (existingIndex >= 0) {
            const updatedDrafts = [...state.drafts]
            updatedDrafts[existingIndex] = newDraft
            return { drafts: updatedDrafts }
          }

          return { drafts: [...state.drafts, newDraft] }
        })
      },

      getDraft: (type, id) => {
        return get().drafts.find(d => d.type === type && d.id === id)
      },

      getDraftsByType: (type) => {
        return get().drafts.filter(d => d.type === type)
      },

      markSynced: (type, id) => {
        set((state) => ({
          drafts: state.drafts.map(d =>
            d.type === type && d.id === id
              ? { ...d, isSynced: true, syncedAt: new Date().toISOString() }
              : d
          ),
        }))
      },

      deleteDraft: (type, id) => {
        set((state) => ({
          drafts: state.drafts.filter(d => !(d.type === type && d.id === id)),
        }))
      },

      clearDraftsByType: (type) => {
        set((state) => ({
          drafts: state.drafts.filter(d => d.type !== type),
        }))
      },

      getUnsyncedDrafts: () => {
        return get().drafts.filter(d => !d.isSynced)
      },
    }),
    {
      name: 'sms-drafts-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
