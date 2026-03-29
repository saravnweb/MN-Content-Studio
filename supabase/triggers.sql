-- ============================================================
-- Paste this into Supabase SQL Editor and click Run
-- Run AFTER schema.sql
-- ============================================================

-- Enable Realtime on the notifications table
-- (Supabase dashboard: Database → Replication → supabase_realtime → add notifications)
-- OR run:
-- Add to realtime only if not already added (safe to re-run)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
EXCEPTION WHEN duplicate_object THEN
  NULL; -- already added, ignore
END $$;

-- Add missing notification type (if schema.sql was already run without it)
ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'new_application',
    'application_accepted',
    'application_rejected',
    'application_negotiating',
    'new_campaign',
    'submission_approved',
    'submission_revision_requested'
  ));

-- ============================================================
-- Trigger: When application status changes → notify creator
-- ============================================================

CREATE OR REPLACE FUNCTION notify_creator_on_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_campaign RECORD;
  v_title TEXT;
  v_body TEXT;
  v_type TEXT;
BEGIN
  -- Only fire on status changes, not inserts
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    SELECT title, brand_name INTO v_campaign
    FROM campaigns
    WHERE id = NEW.campaign_id;

    IF NEW.status = 'accepted' THEN
      v_type := 'application_accepted';
      v_title := 'Application Accepted!';
      v_body := 'Your application for ' || v_campaign.title || ' from ' || v_campaign.brand_name || ' was accepted.';
    ELSIF NEW.status = 'rejected' THEN
      v_type := 'application_rejected';
      v_title := 'Application Update';
      v_body := 'Your application for ' || v_campaign.title || ' was not selected this time.';
    ELSIF NEW.status = 'negotiating' THEN
      v_type := 'application_negotiating';
      v_title := 'Negotiation in Progress';
      v_body := 'The admin wants to discuss your application for ' || v_campaign.title || '.';
    END IF;

    IF v_type IS NOT NULL THEN
      INSERT INTO notifications (user_id, type, title, body, payload)
      VALUES (
        NEW.creator_id,
        v_type,
        v_title,
        v_body,
        jsonb_build_object('campaign_id', NEW.campaign_id, 'application_id', NEW.id)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_application_status_change ON applications;
CREATE TRIGGER on_application_status_change
  AFTER UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_creator_on_status_change();

-- ============================================================
-- Trigger: When admin reviews submission → notify creator
-- ============================================================

CREATE OR REPLACE FUNCTION notify_creator_on_submission_review()
RETURNS TRIGGER AS $$
DECLARE
  v_campaign_title TEXT;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.submission_status IS DISTINCT FROM NEW.submission_status THEN
    SELECT title INTO v_campaign_title FROM campaigns WHERE id = NEW.campaign_id;

    IF NEW.submission_status = 'approved' THEN
      INSERT INTO notifications (user_id, type, title, body, payload)
      VALUES (
        NEW.creator_id,
        'submission_approved',
        'Content Approved!',
        'Your submission for "' || v_campaign_title || '" has been approved.',
        jsonb_build_object('campaign_id', NEW.campaign_id, 'application_id', NEW.id)
      );
    ELSIF NEW.submission_status = 'revision_requested' THEN
      INSERT INTO notifications (user_id, type, title, body, payload)
      VALUES (
        NEW.creator_id,
        'submission_revision_requested',
        'Revision Requested',
        'Admin has requested a revision on your submission for "' || v_campaign_title || '".',
        jsonb_build_object('campaign_id', NEW.campaign_id, 'application_id', NEW.id)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_submission_review ON applications;
CREATE TRIGGER on_submission_review
  AFTER UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_creator_on_submission_review();
