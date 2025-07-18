-- Calendar Events & Reminders System
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    event_type TEXT NOT NULL,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern TEXT,
    parent_event_id UUID REFERENCES calendar_events(id),
    related_unit_code TEXT,
    related_resource_id UUID,
    related_resource_type TEXT
);

-- Reminders Table
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_sent BOOLEAN DEFAULT false,
    notification_type TEXT[] DEFAULT ARRAY['app']::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own calendar events"
ON calendar_events
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own calendar events"
ON calendar_events
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own calendar events"
ON calendar_events
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own calendar events"
ON calendar_events
FOR DELETE
USING (user_id = auth.uid());

CREATE POLICY "Users can view their own reminders"
ON reminders
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own reminders"
ON reminders
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reminders"
ON reminders
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own reminders"
ON reminders
FOR DELETE
USING (user_id = auth.uid());