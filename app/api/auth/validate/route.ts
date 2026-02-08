import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    try {
      jwt.verify(token, JWT_SECRET);
      return NextResponse.json({ valid: true });
    } catch (err) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}