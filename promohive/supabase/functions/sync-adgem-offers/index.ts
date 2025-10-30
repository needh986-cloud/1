import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

serve(async (req) => {
  // CORS preflight
  if (req?.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*"
      }
    });
  }
  
  try {
    // Get environment variables
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const ADGEM_API_KEY = Deno.env.get('ADGEM_API_KEY');
    const ADGEM_PUBLISHER_ID = Deno.env.get('ADGEM_PUBLISHER_ID');
    
    if (!ADGEM_API_KEY || !ADGEM_PUBLISHER_ID) {
      throw new Error('AdGem credentials not configured. Please add ADGEM_API_KEY and ADGEM_PUBLISHER_ID to your Supabase secrets.');
    }
    
    // Create Supabase client
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Fetch offers from AdGem API
    // Note: Replace this URL with the actual AdGem API endpoint
    const adgemResponse = await fetch(
      `https://api.adgem.com/v1/publisher/${ADGEM_PUBLISHER_ID}/offers`,
      {
        headers: {
          'Authorization': `Bearer ${ADGEM_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!adgemResponse.ok) {
      throw new Error(`AdGem API error: ${adgemResponse.status} ${adgemResponse.statusText}`);
    }
    
    const adgemOffers = await adgemResponse.json();
    
    // Process and insert/update offers
    let inserted = 0;
    let updated = 0;
    let errors = 0;
    
    for (const offer of adgemOffers.offers || []) {
      try {
        // Check if offer exists
        const { data: existing } = await supabase
          .from('adgem_offers')
          .select('id')
          .eq('external_id', offer.id)
          .single();
        
        const offerData = {
          external_id: offer.id,
          title: offer.name || offer.title,
          description: offer.description,
          real_value: parseFloat(offer.payout || 0),
          currency: offer.currency || 'USD',
          countries: offer.countries || [],
          device_types: offer.device_types || ['mobile', 'desktop'],
          category: offer.category || 'general',
          external_url: offer.click_url || offer.url,
          requirements: {
            min_level: offer.min_level || 0,
            ...offer.requirements
          },
          is_active: offer.status === 'active',
          updated_at: new Date().toISOString()
        };
        
        if (existing) {
          // Update existing offer
          const { error } = await supabase
            .from('adgem_offers')
            .update(offerData)
            .eq('id', existing.id);
          
          if (error) throw error;
          updated++;
        } else {
          // Insert new offer
          const { error } = await supabase
            .from('adgem_offers')
            .insert(offerData);
          
          if (error) throw error;
          inserted++;
        }
      } catch (error) {
        console.error(`Error processing offer ${offer.id}:`, error);
        errors++;
      }
    }
    
    // Deactivate offers not in the latest fetch
    const activeOfferIds = (adgemOffers.offers || []).map((o: any) => o.id);
    if (activeOfferIds.length > 0) {
      await supabase
        .from('adgem_offers')
        .update({ is_active: false })
        .not('external_id', 'in', `(${activeOfferIds.join(',')})`);
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: 'AdGem offers synced successfully',
      stats: {
        total: adgemOffers.offers?.length || 0,
        inserted,
        updated,
        errors
      }
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
    
  } catch (error) {
    console.error("Sync AdGem offers error:", error);
    
    return new Response(JSON.stringify({
      error: error.message || 'Failed to sync AdGem offers',
      details: error.toString()
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
});
