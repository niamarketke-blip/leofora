import { NextRequest, NextResponse } from 'next/server';
import { importEuProductsFromProvider } from '../../../../lib/eu-import';

type AdminUser = { username: string; role: 'admin' | 'manager' } | null;

function decodeToken(token: string): AdminUser {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const parsed = JSON.parse(decoded);
    return { username: parsed.username, role: parsed.role };
  } catch {
    return null;
  }
}

function requireAuth(request: NextRequest): AdminUser {
  const header = request.headers.get('authorization') || '';
  const token = header.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  return decodeToken(token);
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const provider = String(body?.provider || 'bigbuy').toLowerCase();
    const limit = Math.max(1, Math.min(200, Number(body?.limit) || 40));
    const markupMultiplier = Math.max(1, Number(body?.markupMultiplier) || 1.55);
    const requiredCountries = Array.isArray(body?.requiredCountries)
      ? body.requiredCountries.map((c: any) => String(c).toUpperCase())
      : ['IE', 'NL'];
    const marginRules = body?.marginRules && typeof body.marginRules === 'object'
      ? body.marginRules
      : undefined;

    const result = await importEuProductsFromProvider({
      provider,
      limit,
      defaultMarkup: markupMultiplier,
      marginRules,
      requiredCountries,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Import failed.' }, { status: 500 });
  }
}
