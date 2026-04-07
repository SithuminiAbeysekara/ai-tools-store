import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

/**
 * Enriches a tool's data using LLM if foundational fields are missing.
 */
export async function enrichToolData(product) {
  // If we already have the core descriptive data, don't enrich
  const hasData = product.features?.length > 0 && 
                  product.best_for?.length > 0 && 
                  product.integrates_with?.length > 0;
  
  if (hasData) return product;

  try {
    const prompt = `
      You are an AI System Architect. Generate professional architectural metadata for the following technology:
      NAME: ${product.name}
      CATEGORY: ${product.category}
      CURRENT DESCRIPTION: ${product.description || 'None'}

      Return ONLY a JSON object with the following fields:
      - tagline: A one-sentence high-impact tagline.
      - description: A concise 2-3 sentence technical description.
      - features: An array of 4-6 technical core capabilities.
      - best_for: An array of 3-4 use cases or ecosystem roles.
      - integrates_with: An array of 5-8 common companion tools/technologies.
      - agent_summary: A 2-sentence summary explaining why an autonomous agent would choose this tool.

      JSON Format:
      {
        "tagline": "...",
        "description": "...",
        "features": ["...", "..."],
        "best_for": ["...", "..."],
        "integrates_with": ["...", "..."],
        "agent_summary": "..."
      }
    `;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    const enrichment = JSON.parse(completion.choices[0].message.content);

    // Merge only missing or empty fields
    return {
      ...product,
      tagline: product.tagline || enrichment.tagline,
      description: product.description || enrichment.description,
      features: product.features?.length ? product.features : enrichment.features,
      best_for: product.best_for?.length ? product.best_for : enrichment.best_for,
      integrates_with: product.integrates_with?.length ? product.integrates_with : enrichment.integrates_with,
      agent_summary: product.agent_summary || enrichment.agent_summary
    };
  } catch (error) {
    console.error('Enrichment Error:', error);
    return product; // Fallback to original if LLM fails
  }
}
