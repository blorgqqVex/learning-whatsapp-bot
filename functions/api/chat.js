export async function onRequestOptions(context) {
  return new Response(null, { headers: corsHeaders() });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const target = env.N8N_WEBHOOK_URL;
  if (!target) {
    return new Response('Missing N8N_WEBHOOK_URL', { status: 500, headers: corsHeaders() });
  }

  // Forward the JSON body to your private n8n Production webhook
  const incoming = await request.text();
  const forwarded = await fetch(target, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: incoming
  });

  // Mirror content-type if present
  const ct = forwarded.headers.get('content-type') || 'application/json; charset=utf-8';
  return new Response(forwarded.body, {
    status: forwarded.status,
    headers: new Headers({ ...Object.fromEntries(corsHeaders()), 'content-type': ct })
  });
}

function corsHeaders() {
  return new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
}
