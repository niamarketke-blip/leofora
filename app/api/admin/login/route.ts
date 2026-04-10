import { NextRequest, NextResponse } from 'next/server';

const users: Record<string, { password: string; role: 'admin' | 'manager' }> = {
  admin: { password: 'admin123', role: 'admin' },
  manager: { password: 'manager123', role: 'manager' },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = String(body.username || '').trim();
    const password = String(body.password || '');

    if (!username || !password || !users[username] || users[username].password !== password) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const user = users[username];
    const token = Buffer.from(JSON.stringify({ username, role: user.role, issued: Date.now() })).toString('base64');

    return NextResponse.json({ user: { username, role: user.role }, token });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to authenticate' }, { status: 500 });
  }
}
