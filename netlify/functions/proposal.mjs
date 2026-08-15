export default async (req) => {
  try {
    const {lead} = await req.json(); const key=process.env.OPENAI_API_KEY;
    if(!key) return new Response(JSON.stringify({error:"OPENAI_API_KEY is not configured on Netlify."}),{status:500,headers:{"content-type":"application/json"}});
    const prompt=`Write a concise, warm, professional response for this online Quran academy lead. Services: Quran Reading/Nazra, Noorani Qaida, Tajweed, Hifz, Basic Islamic Studies, Girls Courses, Translation. Classes are via WhatsApp or Zoom. Offer a trial class first. Packages: 10 hours/month=$100; 20 hours/month=$200; 30 hours/month=$300. Lead: ${JSON.stringify(lead)}. Do not invent facts. Do not mention AI. Return only the message.`;
    const resp=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.OPENAI_MODEL||"gpt-5",input:prompt})});
    if(!resp.ok) return new Response(JSON.stringify({error:`OpenAI error ${resp.status}: ${await resp.text()}`}),{status:500,headers:{"content-type":"application/json"}});
    const data=await resp.json(); let text=data.output_text||"";
    if(!text && Array.isArray(data.output)) for(const item of data.output) for(const c of (item.content||[])) if(c.text) text+=c.text;
    return new Response(JSON.stringify({message:text.trim()}),{status:200,headers:{"content-type":"application/json"}});
  } catch(e){return new Response(JSON.stringify({error:e.message}),{status:500,headers:{"content-type":"application/json"}})}
};