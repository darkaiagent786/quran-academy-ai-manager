export default async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const countries = body.countries || ["USA","Canada","UK","Australia","Germany","Italy","France","Netherlands","Belgium","Switzerland","UAE","Kuwait"];
    const services = body.services || ["Nazra","Noorani Qaida","Tajweed","Hifz","Basic Islamic Studies","Girls Courses","Translation"];
    const key = process.env.OPENAI_API_KEY;
    if (!key) return new Response(JSON.stringify({error:"OPENAI_API_KEY is not configured on Netlify."}), {status:500,headers:{"content-type":"application/json"}});
    const prompt = `You are the research agent for an online Quran academy. Find fresh, legitimate PUBLIC opportunities where a parent/student is actively seeking an online Quran teacher/tutor. Target markets: ${countries.join(", ")}. Services: ${services.join(", ")}. Use public web sources. Prioritize recent/active requests. Do not invent names, phone numbers, emails or URLs. Do not include posts that explicitly prohibit outreach. Return ONLY JSON: {"leads":[{"title":"","name":"","country":"","need":"","source_name":"","source_url":"","fit_score":0,"reason":"","suggested_message":""}]} with maximum 15 leads. The academy teaches by WhatsApp or Zoom. Trial first. Packages: 10 hours=$100, 20 hours=$200, 30 hours=$300.`;
    const resp = await fetch("https://api.openai.com/v1/responses", {method:"POST",headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.OPENAI_MODEL || "gpt-5",tools:[{type:"web_search_preview"}],input:prompt})});
    if(!resp.ok) return new Response(JSON.stringify({error:`OpenAI error ${resp.status}: ${await resp.text()}`}),{status:500,headers:{"content-type":"application/json"}});
    const data=await resp.json(); let text=data.output_text||"";
    if(!text && Array.isArray(data.output)) for(const item of data.output) for(const c of (item.content||[])) if(c.text) text+=c.text;
    const m=text.match(/\{[\s\S]*\}/); if(!m) throw new Error("No JSON returned by model.");
    return new Response(JSON.stringify(JSON.parse(m[0])),{status:200,headers:{"content-type":"application/json"}});
  } catch(e){return new Response(JSON.stringify({error:e.message}),{status:500,headers:{"content-type":"application/json"}})}
};