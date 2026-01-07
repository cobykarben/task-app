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
    const visionPrompt = `Analyze this handwritten sticky note image and extract task information. 
Return ONLY a valid JSON object with this exact structure:
{
  "title": "the task title or name",
  "description": "any additional description or notes (optional, can be null)",
  "due_date": "YYYY-MM-DD format if a date is mentioned, otherwise null",
  "label": "one of these exact values if mentioned: work, personal, priority, shopping, home, or null if not specified",
  "priority": "one of these exact values: '--', '!', '!!', '!!!', or '--' if not specified",
  "estimated_duration": "integer number of minutes, or null if not specified"
}

Rules:
- Extract the main task/title clearly - this is required
- If a date is written, parse it to YYYY-MM-DD format (e.g., "Jan 15" becomes "2025-01-15", "next Friday" should be calculated to actual date)
- For labels, match to: work, personal, priority, shopping, or home
- For priority, look for indicators and map to symbols:
  * "!!!", "urgent", "asap", "very urgent", "critical" → "!!!"
  * "!!", "high priority", "important", multiple exclamation points → "!!"
  * "!", "low priority", single exclamation, "whenever" → "!"
  * If no priority indicators found or unclear, use "--"
- For estimated_duration, parse time mentions like:
  * "2hr", "2 hours", "2h" → 120 (minutes)
  * "30 min", "30 minutes", "30m" → 30 (minutes)
  * "1.5 hours" → 90 (minutes)
  * Convert all time to minutes as an integer
  * If no time estimate found, use null
- If information is unclear or missing, use null for that field (except title and priority which defaults to "--")
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
    const validLabels = ["work", "personal", "priority", "shopping", "home"];
    const validPriorities = ["--", "!", "!!", "!!!"];
    
    // Parse estimated_duration - ensure it's an integer in minutes
    let estimatedDuration = null;
    if (extractedData.estimated_duration) {
      const duration = parseInt(extractedData.estimated_duration);
      if (!isNaN(duration) && duration > 0) {
        estimatedDuration = duration;
      }
    }
    
    // Parse priority - default to "--" if invalid or missing
    const priority = extractedData.priority && validPriorities.includes(extractedData.priority)
      ? extractedData.priority
      : "--";
    
    const taskData: any = {
      title: extractedData.title.trim(),
      description: extractedData.description?.trim() || null,
      label: extractedData.label && validLabels.includes(extractedData.label)
        ? extractedData.label
        : null,
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

    console.log(`📝 Extracted task data:`, taskData);

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

