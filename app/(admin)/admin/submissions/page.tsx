import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ReviewSubmission from '../campaigns/[id]/ReviewSubmission'

export default async function SubmissionsPage() {
  const supabase = createClient()

  const { data: submissions } = await supabase
    .from('applications')
    .select(`
      id, submission_url, submission_status, admin_submission_note, submission_submitted_at,
      creator:profiles(full_name, platform, followers_count, platform_url),
      campaign:campaigns(id, title, brand_name)
    `)
    .neq('submission_status', 'not_submitted')
    .order('submission_submitted_at', { ascending: false })

  const needsReview = submissions?.filter((s) => s.submission_status === 'submitted') ?? []
  const revisionRequested = submissions?.filter((s) => s.submission_status === 'revision_requested') ?? []
  const approved = submissions?.filter((s) => s.submission_status === 'approved') ?? []

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Submissions</h2>
        <p className="text-gray-500 text-sm mt-1">
          {needsReview.length} needs review · {revisionRequested.length} revision requested · {approved.length} approved
        </p>
      </div>

      {!submissions?.length ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-500 text-sm">No content submissions yet</p>
        </div>
      ) : (
        <div className="space-y-8">
          {needsReview.length > 0 && (
            <Section title="Needs Review" submissions={needsReview} />
          )}
          {revisionRequested.length > 0 && (
            <Section title="Revision Requested" submissions={revisionRequested} />
          )}
          {approved.length > 0 && (
            <Section title="Approved" submissions={approved} />
          )}
        </div>
      )}
    </div>
  )
}

function Section({ title, submissions }: { title: string; submissions: any[] }) {
  return (
    <div>
      <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">{title}</h3>
      <div className="space-y-3">
        {submissions.map((s) => (
          <SubmissionCard key={s.id} submission={s} />
        ))}
      </div>
    </div>
  )
}

function SubmissionCard({ submission: s }: { submission: any }) {
  const submittedAt = s.submission_submitted_at
    ? new Date(s.submission_submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-white font-medium text-sm">{s.creator?.full_name ?? '—'}</p>
          <p className="text-gray-500 text-xs mt-0.5 capitalize">
            {s.creator?.platform}
            {s.creator?.followers_count ? ` · ${s.creator.followers_count.toLocaleString('en-IN')} followers` : ''}
          </p>
          {s.creator?.platform_url && (
            <a href={s.creator.platform_url} target="_blank" rel="noopener noreferrer"
              className="text-indigo-400 text-xs hover:underline mt-0.5 block truncate max-w-xs">
              {s.creator.platform_url}
            </a>
          )}
        </div>
        <div className="text-right shrink-0">
          <Link href={`/admin/campaigns/${s.campaign?.id}`}
            className="text-indigo-400 text-xs hover:underline font-medium">
            {s.campaign?.brand_name} · {s.campaign?.title}
          </Link>
          {submittedAt && (
            <p className="text-gray-600 text-xs mt-0.5">{submittedAt}</p>
          )}
        </div>
      </div>

      <ReviewSubmission
        applicationId={s.id}
        submissionUrl={s.submission_url}
        currentStatus={s.submission_status}
      />
    </div>
  )
}
