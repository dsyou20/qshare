import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://192.168.100.176:16001/api';

interface ApiError {
  message?: string;
  status?: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const token = request.headers.get('Authorization');

  try {
    const response = await fetch(`${BACKEND_URL}/admin/${path}`, {
      headers: {
        'Authorization': token || '',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Admin API Error:', error);
    const apiError = error as ApiError;
    return NextResponse.json(
      { message: apiError.message || '서버 오류가 발생했습니다.' },
      { status: apiError.status || 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const token = request.headers.get('Authorization');
  const body = await request.json();

  try {
    const response = await fetch(`${BACKEND_URL}/admin/${path}`, {
      method: 'PUT',
      headers: {
        'Authorization': token || '',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Admin API Error:', error);
    const apiError = error as ApiError;
    return NextResponse.json(
      { message: apiError.message || '서버 오류가 발생했습니다.' },
      { status: apiError.status || 500 }
    );
  }
} 