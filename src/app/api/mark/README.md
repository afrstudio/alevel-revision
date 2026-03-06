# Marking API

This API route handles marking handwritten answers via camera photos.

## Configuration

Add one of these to `.env.local`:

### Option 1: OpenAI (GPT-4 Vision)
```
OPENAI_API_KEY=sk-...
```

### Option 2: Supabase Edge Function
```
SUPABASE_MARK_FUNCTION_URL=https://your-project.supabase.co/functions/v1/mark
SUPABASE_ANON_KEY=your-anon-key
```

## Request Format
```json
{
  "image": "data:image/jpeg;base64,...",
  "subject": "Maths" | "Biology" | "Chemistry",
  "questionContext": "optional question text"
}
```

## Response Format
```json
{
  "score": 3,
  "totalMarks": 5,
  "feedback": "detailed feedback...",
  "criteriaMatched": ["M1: ...", "M2: ..."],
  "criteriaMissed": ["M3: ..."]
}
```
