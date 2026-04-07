import { supabase } from './supabase'
import usecases from '../data/usecases.json'

/**
 * Data Access Layer for Supabase (Primary Table: tools)
 * Includes a mapping layer to convert flat database columns back to the 
 * nested JSON structure expected by the front-end components.
 */

function mapToolData(tool) {
  if (!tool) return null
  
  return {
    ...tool,
    // Map attributes back to nested object
    attributes: {
      pricing_model: tool.pricing_model,
      free_tier: tool.attr_free_tier,
      open_source: tool.attr_open_source,
      api_type: tool.attr_api_type,
      latency: tool.attr_latency
    },
    // Map pricing back to nested object
    pricing: {
      free_tier: tool.pricing_free_tier,
      paid: tool.pricing_paid,
      model: tool.pricing_model
    },
    // Ensure arrays are handled (Supabase might return null for these)
    features: tool.features || [],
    best_for: tool.best_for || [],
    integrates_with: tool.integrates_with || [],
    alternatives: tool.alternatives || [],
    // Map compatibility
    compatibility: {
      works_well_with: tool.works_well_with || [],
      commonly_used_with: tool.commonly_used_with || [],
      conflicts_with: tool.conflicts_with || []
    }
  }
}

export async function getProducts() {
  const { data, error } = await supabase
    .from('tools')
    .select('*')
  
  if (error) {
    console.error('Error fetching products (tools):', error)
    return []
  }
  
  return (data || []).map(mapToolData)
}

export async function getProductBySlug(slug) {
  const { data, error } = await supabase
    .from('tools')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) {
    console.error(`Error fetching product (tool) by slug ${slug}:`, error)
    return null
  }
  
  return mapToolData(data)
}

export async function getUsecases() {
  return usecases
}

export async function getUsecaseById(id) {
  return (usecases || []).find(u => u.id === id.toLowerCase()) || null
}
