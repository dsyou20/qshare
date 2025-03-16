'use client';

import { Inter } from 'next/font/google';
import { AppBar, Toolbar, Typography, Button, Container, Box, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { logout } from '@/lib/auth';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

function NavBar() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          QGIS Script Share
        </Typography>
        {user ? (
          <>
            <Button color="inherit" onClick={() => router.push('/my-scripts')}>
              내 스크립트
            </Button>
            <Button color="inherit" onClick={() => router.push('/shared-scripts')}>
              공유된 스크립트
            </Button>
            <Button color="inherit" onClick={() => router.push('/favorites')}>
              즐겨찾기
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              로그아웃
            </Button>
          </>
        ) : (
          <>
            <Button color="inherit" onClick={() => router.push('/login')}>
              로그인
            </Button>
            <Button color="inherit" onClick={() => router.push('/register')}>
              회원가입
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <AuthProvider>
          <NavBar />
          <Container component="main" sx={{ mt: 4 }}>
            {children}
          </Container>
        </AuthProvider>
      </body>
    </html>
  );
}

export default RootLayout;
