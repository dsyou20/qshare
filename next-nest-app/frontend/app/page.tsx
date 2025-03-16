'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return null;
  }

  if (user) {
    router.push('/my-scripts');
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <Typography variant="h2" component="h1" gutterBottom>
        QGIS Script Share
      </Typography>
      <Typography variant="h5" component="h2" gutterBottom color="text.secondary">
        QGIS 스크립트를 쉽게 공유하고 관리하세요
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => router.push('/register')}
          sx={{ mr: 2 }}
        >
          시작하기
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={() => router.push('/login')}
        >
          로그인
        </Button>
      </Box>
    </Box>
  );
} 