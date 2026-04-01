'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Check } from 'lucide-react'

interface Creator {
  id: string
  full_name: string
  username: string | null
  avatar_url: string | null
  followers_count: number | null
}

interface CreatorPickerProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
  isOpen: boolean
  onClose: () => void
}

export default function CreatorPicker({ selectedIds, onChange, isOpen, onClose }: CreatorPickerProps) {
  const [creators, setCreators] = useState<Creator[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (!isOpen) return
    
    setLoading(true)
    supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url, followers_count')
      .eq('role', 'creator')
      .order('followers_count', { ascending: false, nullsFirst: true })
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching creators:', error)
        } else {
          setCreators(data ?? [])
        }
        setLoading(false)
      })
  }, [isOpen, supabase])

  const filtered = creators.filter((c) =>
    (c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username?.toLowerCase().includes(searchQuery.toLowerCase())) ?? false
  )

  const toggle = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg max-h-[70vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-white font-semibold">Select Creators</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 w-8 h-8 rounded-full hover:bg-gray-800 flex items-center justify-center transition-colors">
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or username…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Creator list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-gray-400 text-sm">Loading creators…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-gray-400 text-sm">
                {searchQuery ? 'No creators found' : 'No creators available'}
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filtered.map((creator) => (
                <button
                  key={creator.id}
                  type="button"
                  onClick={() => toggle(creator.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    selectedIds.includes(creator.id)
                      ? 'bg-indigo-600/20 border border-indigo-500/30'
                      : 'bg-gray-800/50 border border-transparent hover:bg-gray-700/50'
                  }`}>
                  {/* Checkbox */}
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                      selectedIds.includes(creator.id)
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'border-gray-600 bg-transparent'
                    }`}>
                    {selectedIds.includes(creator.id) && <Check className="w-3 h-3 text-white" />}
                  </div>

                  {/* Avatar & info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{creator.full_name || 'Unnamed'}</p>
                    <p className="text-gray-400 text-xs truncate">
                      {creator.username ? `@${creator.username}` : 'No username'}
                      {creator.followers_count && ` · ${creator.followers_count.toLocaleString()} followers`}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex items-center justify-between">
          <p className="text-gray-400 text-xs">
            {selectedIds.length > 0 ? `${selectedIds.length} selected` : 'No creators selected'}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
