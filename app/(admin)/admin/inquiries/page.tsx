'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, Phone, Calendar, Briefcase, Tag, Clock, ChevronDown, ChevronUp, CheckCircle, XCircle, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

type Inquiry = {
  id: string
  company_name: string
  contact_name: string
  email: string
  phone: string | null
  niche: string | null
  brief: string
  budget_range: string | null
  platforms: string[] | null
  timeline: string | null
  status: 'new' | 'contacted' | 'converted' | 'declined'
  admin_note: string | null
  created_at: string
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'New Lead', color: 'bg-indigo-500/10 text-indigo-400' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-500/10 text-yellow-400' },
  { value: 'converted', label: 'Converted', color: 'bg-green-500/10 text-green-400' },
  { value: 'declined', label: 'Declined', color: 'bg-red-500/10 text-red-400' },
]

export default function BrandInquiriesPage() {
  const supabase = createClient()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchInquiries() {
      const { data, error } = await supabase
        .from('brand_inquiries')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        toast.error('Failed to load inquiries')
      } else {
        setInquiries(data || [])
      }
      setLoading(false)
    }

    fetchInquiries()
  }, [supabase])

  async function updateStatus(id: string, status: Inquiry['status']) {
    setUpdatingId(id)
    const { error } = await supabase
      .from('brand_inquiries')
      .update({ status })
      .eq('id', id)

    if (error) {
      toast.error('Update failed')
    } else {
      setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status } : inq))
      toast.success(`Inquiry marked as ${status}`)
    }
    setUpdatingId(null)
  }

  async function updateNote(id: string, admin_note: string) {
    const { error } = await supabase
      .from('brand_inquiries')
      .update({ admin_note })
      .eq('id', id)

    if (error) {
      toast.error('Failed to save note')
    } else {
      setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, admin_note } : inq))
    }
  }

  if (loading) return <p className="text-gray-400 text-sm">Loading inquiries…</p>

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Brand Leads</h2>
        <p className="text-gray-400 text-sm mt-1">Inquiries submitted via the &quot;For Brands&quot; signup page</p>
      </div>

      {!inquiries.length ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
          <p className="text-gray-400">No brand inquiries yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => (
            <InquiryCard
              key={inq.id}
              inquiry={inq}
              isExpanded={expandedId === inq.id}
              onToggle={() => setExpandedId(expandedId === inq.id ? null : inq.id)}
              onStatusChange={(status) => updateStatus(inq.id, status)}
              onNoteChange={(note) => updateNote(inq.id, note)}
              isUpdating={updatingId === inq.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function InquiryCard({
  inquiry, isExpanded, onToggle, onStatusChange, onNoteChange, isUpdating
}: {
  inquiry: Inquiry
  isExpanded: boolean
  onToggle: () => void
  onStatusChange: (status: Inquiry['status']) => void
  onNoteChange: (note: string) => void
  isUpdating: boolean
}) {
  const statusConfig = STATUS_OPTIONS.find(s => s.value === inquiry.status) || STATUS_OPTIONS[0]
  const [note, setNote] = useState(inquiry.admin_note || '')

  return (
    <div className={`bg-gray-900 border transition-all ${isExpanded ? 'border-gray-600 ring-1 ring-gray-600' : 'border-gray-800 hover:border-gray-700'} rounded-2xl overflow-hidden`}>
      {/* Header */}
      <div className="p-5 flex items-start justify-between cursor-pointer group" onClick={onToggle}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-white font-bold text-lg leading-none">{inquiry.company_name}</h3>
            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
          <div className="flex items-center gap-4 text-gray-400 text-xs mt-2">
            <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {inquiry.email}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {new Date(inquiry.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
          </div>
        </div>
        <div className="ml-4 shrink-0 flex items-center gap-3">
          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-700 group-hover:text-gray-500" />}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-gray-800 pt-5 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Contact Details */}
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-2">Contact Person</p>
                <p className="text-gray-100 text-sm font-medium">{inquiry.contact_name}</p>
                {inquiry.phone && (
                  <p className="text-gray-400 text-xs flex items-center gap-1.5 mt-1">
                    <Phone className="w-3 h-3" /> {inquiry.phone}
                  </p>
                )}
              </div>

              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-2">Requirements</p>
                <div className="flex flex-wrap gap-2">
                  {inquiry.niche && (
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-gray-800 text-gray-300 rounded-lg text-[10px]">
                      <Tag className="w-3 h-3" /> {inquiry.niche}
                    </span>
                  )}
                  {inquiry.timeline && (
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-gray-800 text-gray-300 rounded-lg text-[10px]">
                      <Calendar className="w-3 h-3" /> {inquiry.timeline}
                    </span>
                  )}
                  {inquiry.budget_range && (
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-gray-800 text-gray-300 rounded-lg text-[10px]">
                      <Briefcase className="w-3 h-3" /> {inquiry.budget_range}
                    </span>
                  )}
                </div>
                {inquiry.platforms && inquiry.platforms.length > 0 && (
                  <div className="mt-2 flex gap-1">
                    {inquiry.platforms.map(p => (
                      <span key={p} className="text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded">
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Brief */}
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-2">Campaign Brief</p>
              <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{inquiry.brief}</p>
              </div>
            </div>
          </div>

          {/* Admin Controls */}
          <div className="pt-6 border-t border-gray-800 flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-3 flex items-center gap-1.5">
                <MessageSquare className="w-3 h-3" /> Internal Notes
              </p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onBlur={() => onNoteChange(note)}
                placeholder="Add notes about your conversation with this brand..."
                className="w-full bg-gray-950 border border-gray-800 focus:border-indigo-500 rounded-xl p-3 text-sm text-gray-100 placeholder-gray-600 outline-none transition-colors h-24 resize-none"
              />
            </div>

            <div className="sm:w-48 shrink-0">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-3">Update Status</p>
              <div className="space-y-1.5">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    disabled={isUpdating || inquiry.status === opt.value}
                    onClick={() => onStatusChange(opt.value as any)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                      inquiry.status === opt.value
                        ? opt.color + ' ring-1 ring-current cursor-default'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                    }`}
                  >
                    {opt.label}
                    {inquiry.status === opt.value && <CheckCircle className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
