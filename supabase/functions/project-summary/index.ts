import { createClient } from 'npm:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { project_id } = await req.json()
    
    if (!project_id) {
      return new Response(JSON.stringify({ error: 'project_id required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const [
      { count: tasks_count },
      { count: materials_count },
      { count: incidents_count },
      { count: inspections_count },
      { count: timesheets_count }
    ] = await Promise.all([
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('project_id', project_id),
      supabase.from('materials').select('*', { count: 'exact', head: true }).eq('project_id', project_id),
      supabase.from('incidents').select('*', { count: 'exact', head: true }).eq('project_id', project_id),
      supabase.from('inspections').select('*', { count: 'exact', head: true }).eq('project_id', project_id),
      supabase.from('timesheets').select('*', { count: 'exact', head: true }).eq('project_id', project_id)
    ])

    return new Response(JSON.stringify({
      project_id,
      counts: {
        tasks: tasks_count ?? 0,
        materials: materials_count ?? 0,
        incidents: incidents_count ?? 0,
        inspections: inspections_count ?? 0,
        timesheets: timesheets_count ?? 0
      },
      generated_at: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
})
