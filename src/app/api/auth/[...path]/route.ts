const BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL
)?.replace(/\/+$/, '');

const ALLOWED_AUTH_PATHS = new Set([
  'login',
  'register',
  'forgot-password',
  'reset-password',
]);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  if (path.length !== 1 || !ALLOWED_AUTH_PATHS.has(path[0])) {
    return Response.json({ message: 'Not found.' }, { status: 404 });
  }

  if (!BASE_URL) {
    return Response.json(
      { message: 'The authentication backend is not configured.' },
      { status: 503 },
    );
  }

  const headers = new Headers({ 'Content-Type': 'application/json' });
  const authorization = request.headers.get('authorization');
  if (authorization) {
    headers.set('Authorization', authorization);
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/api/auth/${path[0]}`, {
      method: 'POST',
      headers,
      body: await request.text(),
      cache: 'no-store',
    });
  } catch {
    return Response.json(
      { message: 'Could not reach the authentication backend. Please try again.' },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers();
  const contentType = response.headers.get('content-type');
  if (contentType) {
    responseHeaders.set('Content-Type', contentType);
  }

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}
