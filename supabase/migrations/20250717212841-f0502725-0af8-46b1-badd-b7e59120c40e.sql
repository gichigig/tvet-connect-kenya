-- AI Chatbot Tutor Conversations
CREATE TABLE chatbot_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_area TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Chatbot Messages
CREATE TABLE chatbot_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'bot')),
    message TEXT NOT NULL,
    resources JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Anonymous Feedback System
CREATE TABLE anonymous_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feedback_type TEXT NOT NULL CHECK (feedback_type IN ('unit', 'lecturer', 'facility', 'general')),
    subject_id TEXT,  -- Unit code, lecturer ID, etc.
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    feedback_text TEXT NOT NULL,
    sentiment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    academic_period TEXT
);

-- Enable RLS
ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Chatbot
CREATE POLICY "Users can view their own conversations"
ON chatbot_conversations
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own conversations"
ON chatbot_conversations
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view messages in their conversations"
ON chatbot_messages
FOR SELECT
USING (EXISTS (
    SELECT 1 FROM chatbot_conversations
    WHERE chatbot_conversations.id = chatbot_messages.conversation_id
    AND chatbot_conversations.user_id = auth.uid()
));

CREATE POLICY "Users can create messages in their conversations"
ON chatbot_messages
FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM chatbot_conversations
    WHERE chatbot_conversations.id = chatbot_messages.conversation_id
    AND chatbot_conversations.user_id = auth.uid()
));

-- RLS Policies for Anonymous Feedback
-- Anyone can submit anonymous feedback
CREATE POLICY "Anyone can create anonymous feedback"
ON anonymous_feedback
FOR INSERT
WITH CHECK (true);

-- Only administrators can view all feedback
CREATE POLICY "Administrators can view all feedback"
ON anonymous_feedback
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

-- Add sentiment analysis function 
CREATE OR REPLACE FUNCTION public.analyze_sentiment()
RETURNS TRIGGER AS $$
BEGIN
    -- Simple sentiment analysis based on keywords
    -- In a real system, this would use a more sophisticated algorithm or API
    IF NEW.feedback_text ~* '(excellent|great|good|love|amazing|helpful)' THEN
        NEW.sentiment = 'positive';
    ELSIF NEW.feedback_text ~* '(bad|terrible|awful|hate|useless|poor)' THEN
        NEW.sentiment = 'negative';
    ELSE
        NEW.sentiment = 'neutral';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for sentiment analysis
CREATE TRIGGER analyze_feedback_sentiment
BEFORE INSERT ON anonymous_feedback
FOR EACH ROW
EXECUTE FUNCTION public.analyze_sentiment();