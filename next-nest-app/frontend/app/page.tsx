'use client';

import { useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState<string>('');

  const handleClick = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL}/api/hi`);
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      let errorMessage = '에러가 발생했습니다: ';
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        errorMessage += '서버 연결에 실패했습니다. 서버가 실행 중인지 확인해주세요.';
      } else if (!response?.ok) {
        errorMessage += `서버 응답 에러 (${response.status}): ${response.statusText}`;
      } else if (error instanceof SyntaxError) {
        errorMessage += '잘못된 JSON 응답입니다.';
      } else {
        errorMessage += `${error.message || '알 수 없는 에러가 발생했습니다.'}`;
      }
      
      setMessage(errorMessage);
      console.error('API 호출 에러:', error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-4">
      <button
        onClick={handleClick}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        백엔드 API 호출
      </button>
      {message && (
        <p className="text-xl">
          {message}
        </p>
      )}
    </main>
  );
}
