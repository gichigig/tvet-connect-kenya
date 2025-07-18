import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { submissionId, text } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Analyzing text for AI detection:', { submissionId, textLength: text.length });

    // Call OpenAI to detect AI-generated content
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI content detector. Analyze the given text and determine if it was likely written by AI or by a human. 
            
            Consider factors like:
            - Writing patterns and style consistency
            - Vocabulary usage and complexity
            - Sentence structure variation
            - Natural flow and coherence
            - Presence of AI-like phrases or patterns
            - Repetitive structures
            - Lack of personal voice or experience
            
            Respond with a JSON object containing:
            - "isAI": boolean (true if likely AI-generated, false if likely human)
            - "confidence": number between 0-100 (confidence percentage)
            - "reasoning": string explaining your analysis
            - "flags": array of specific indicators found
            
            Be thorough but fair in your analysis.`
          },
          {
            role: 'user',
            content: `Please analyze this text for AI detection:\n\n${text}`
          }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiAnalysis = JSON.parse(data.choices[0].message.content);

    console.log('AI Analysis result:', aiAnalysis);

    // Determine status based on AI confidence
    let status = 'human';
    if (aiAnalysis.isAI && aiAnalysis.confidence >= 70) {
      status = 'ai_detected';
    } else if (aiAnalysis.isAI && aiAnalysis.confidence >= 50) {
      status = 'flagged_for_review';
    }

    // Update submission in database
    const { error: updateError } = await supabase
      .from('assignment_submissions')
      .update({
        ai_detection_status: status,
        ai_confidence_score: aiAnalysis.confidence,
        ai_detection_details: aiAnalysis,
        final_status: status === 'human' ? 'ready_for_marking' : 'requires_review'
      })
      .eq('id', submissionId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error('Failed to update submission status');
    }

    return new Response(JSON.stringify({
      success: true,
      result: {
        status,
        confidence: aiAnalysis.confidence,
        isAI: aiAnalysis.isAI,
        reasoning: aiAnalysis.reasoning,
        flags: aiAnalysis.flags
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI essay detector:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});