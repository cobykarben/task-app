// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import OpenAI from "npm:openai";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Get image as base64 from request
    const { imageBase64, imageUrl } = await req.json();

    if (!imageBase64 && !imageUrl) {
      throw new Error("Image data is required");
    }

    console.log("🔄 Processing image with OpenAI Vision...");
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get user session
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("No user found");

    if (!OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

    // Prepare image data for OpenAI
    let imageDataUrl: string;
    if (imageBase64) {
      // Use base64 directly if it already includes data URL prefix
      if (imageBase64.startsWith("data:")) {
        imageDataUrl = imageBase64;
      } else {
        // Add data URL prefix if missing
        imageDataUrl = `data:image/jpeg;base64,${imageBase64}`;
      }
    } else if (imageUrl) {
      // If imageUrl is provided, use it directly
      imageDataUrl = imageUrl;
    } else {
      throw new Error("Invalid image data");
    }

    // Call OpenAI Vision API to extract task information
    const visionPrompt = `Analyze this handwritten sticky note image and extract ALL task information. 
Return ONLY a valid JSON object with this exact structure (replace the example values with actual extracted data):
{
  "title": "extracted task title",
  "description": "extracted description or null",
  "due_date": "YYYY-MM-DD or null",
  "label": "work/personal/shopping/home or null",
  "priority": "-- or ! or !! or !!!",
  "estimated_duration": 40
}

CRITICAL - Extract ALL fields that are visible in the image:
- Title: Extract the main task name (required)
- Description: Extract any additional notes, lists, or details
- Due Date: Convert dates like "1/15/2026" or "Jan 15, 2026" to "2026-01-15" format
- Label: Match to work, personal, shopping, or home based on task content
- Priority: See mapping below (REQUIRED - always return one of the four values)
- Estimated Duration: Extract time like "40 minutes" as integer 40, "2 hours" as 120, etc.

IMPORTANT - Priority mapping (use these EXACT values: "--", "!", "!!", "!!!"):

Priority detection order (check in this exact order):
1. If text contains "!!!" (three exclamation marks) OR "High Priority!!!" OR "urgent!!!" OR "asap!!!" → return "!!!"
2. If text contains "High Priority" OR "high priority" OR "urgent" OR "asap" OR "critical" OR "very urgent" (even without exclamation marks) → return "!!!"
3. If text contains "!!" (two exclamation marks) OR "important!!" → return "!!"
4. If text contains "!" (single exclamation mark) OR "Low Priority" OR "low priority" OR "whenever" → return "!"
5. If NO priority indicators found → return "--"

Examples:
- "High Priority!!!" → "!!!"
- "High Priority" → "!!!"
- "urgent" → "!!!"
- "important!!" → "!!"
- "Low priority!" → "!"
- No priority mentioned → "--"

Rules:
- Extract the main task/title clearly - this is required
- If a date is written, parse it to YYYY-MM-DD format (e.g., "Jan 15" becomes "2025-01-15", "next Friday" should be calculated to actual date)
- For labels, match to: work, personal, shopping, or home ONLY
- CRITICAL: NEVER use "priority" as a label value - if you see "priority" mentioned, it refers to the priority field, NOT the label field
- If the task is about shopping/buying things → "shopping"
- If the task is about work/business → "work"
- If the task is about personal/home life → "personal" or "home"
- If unclear, use null for label
- For estimated_duration, parse time mentions and convert to minutes as an INTEGER:
  * "40 minutes" → 40
  * "40 min" → 40
  * "40m" → 40
  * "2hr", "2 hours", "2h" → 120
  * "30 min", "30 minutes", "30m" → 30
  * "45 minutes" → 45
  * "1.5 hours" → 90
  * "1 hour" → 60
  * Always return an INTEGER (not a string), or null if no time found
- For due_date, parse dates in various formats:
  * "1/15/2026" → "2026-01-15"
  * "Jan 15, 2026" → "2026-01-15"
  * "01/15/2026" → "2026-01-15"
  * "January 15, 2026" → "2026-01-15"
  * Always use YYYY-MM-DD format
- Priority MUST be one of these exact strings: "--", "!", "!!", "!!!" (ALWAYS return one of these, never null)
- estimated_duration MUST be an integer (number, not string) or null
- You MUST extract ALL visible information from the image - do not skip fields that are clearly visible
- If you see "High Priority!!!" in the image, priority MUST be "!!!"
- If you see "40 minutes" in the image, estimated_duration MUST be 40 (as a number)
- If you see "1/15/2026" in the image, due_date MUST be "2026-01-15"
- Return ONLY the JSON object, no other text or explanation`;

    console.log("📤 Sending image to OpenAI Vision API...");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using mini for cost efficiency, can switch to "gpt-4o" for better accuracy
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: visionPrompt,
            },
            {
              type: "image_url",
              image_url: {
                url: imageDataUrl,
              },
            },
          ],
        },
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const responseText = completion.choices[0].message.content;
    console.log(`✨ OpenAI Response: ${responseText}`);

    // Parse JSON response
    let extractedData;
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = responseText?.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in OpenAI response");
      }
      extractedData = JSON.parse(jsonMatch[0]);
      console.log(`📋 Parsed JSON:`, JSON.stringify(extractedData, null, 2));
      console.log(`🔍 Extracted fields:`, {
        title: extractedData.title,
        description: extractedData.description,
        due_date: extractedData.due_date,
        label: extractedData.label,
        priority: extractedData.priority,
        estimated_duration: extractedData.estimated_duration,
      });
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      console.error("Raw response:", responseText);
      throw new Error("Failed to parse task information from image. Please ensure the image contains clear handwritten task information.");
    }

    // Validate extracted data
    if (!extractedData.title || extractedData.title.trim() === "") {
      throw new Error("Could not extract a valid task title from the image");
    }

    // Validate and prepare task data
    const validLabels = ["work", "personal", "shopping", "home"];
    const validPriorities = ["--", "!", "!!", "!!!"];
    
    // Parse estimated_duration - ensure it's an integer in minutes
    let estimatedDuration = null;
    if (extractedData.estimated_duration !== null && extractedData.estimated_duration !== undefined) {
      // Handle both string and number formats
      const duration = typeof extractedData.estimated_duration === 'number' 
        ? extractedData.estimated_duration 
        : parseInt(String(extractedData.estimated_duration));
      if (!isNaN(duration) && duration > 0) {
        estimatedDuration = duration;
        console.log(`⏱️ Parsed duration: ${estimatedDuration} minutes`);
      } else {
        console.warn(`⚠️ Invalid duration value: ${extractedData.estimated_duration}`);
      }
    } else {
      console.log(`⏱️ No duration found in extracted data`);
    }
    
    // Parse priority - default to "--" if invalid or missing
    const priority = extractedData.priority && validPriorities.includes(extractedData.priority)
      ? extractedData.priority
      : "--";
    console.log(`🎯 Priority extracted: "${extractedData.priority}" → Final: "${priority}"`);
    
    // Parse label - filter out "priority" if OpenAI mistakenly returns it
    let label = null;
    if (extractedData.label) {
      const labelLower = extractedData.label.toLowerCase().trim();
      // Explicitly reject "priority" as a label
      if (labelLower === "priority") {
        console.warn(`⚠️ OpenAI returned "priority" as label - rejecting it (priority is a separate field)`);
        label = null;
      } else if (validLabels.includes(labelLower)) {
        label = labelLower;
      } else {
        console.warn(`⚠️ Invalid label "${extractedData.label}" - setting to null`);
        label = null;
      }
    }
    console.log(`🏷️ Label extracted: "${extractedData.label}" → Final: "${label}"`);
    
    const taskData: any = {
      title: extractedData.title.trim(),
      description: extractedData.description?.trim() || null,
      label: label,
      due_date: extractedData.due_date || null,
      priority: priority,
      estimated_duration: estimatedDuration,
      created_via: "image_ocr",
      completed: false,
      user_id: user.id,
    };

    // Validate date format if provided
    if (taskData.due_date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(taskData.due_date)) {
        console.warn(`Invalid date format: ${taskData.due_date}, setting to null`);
        taskData.due_date = null;
      }
    }

    console.log(`📝 Final task data to save:`, JSON.stringify(taskData, null, 2));

    // Create the task
    const { data: task, error: taskError } = await supabaseClient
      .from("tasks")
      .insert(taskData)
      .select()
      .single();

    if (taskError) {
      console.error("Error creating task:", taskError);
      throw taskError;
    }

    console.log(`✅ Task created from image: ${task.title}`);

    return new Response(JSON.stringify(task), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("Error in create-task-from-image:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

