'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Box, 
  Typography, 
  Container, 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Visibility as ViewIcon,
} from '@mui/icons-material';

interface SharedScript {
  id: number;
  title: string;
  description: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export default function SharedScriptsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [scripts, setScripts] = useState<SharedScript[]>([]);
  const [loadingScripts, setLoadingScripts] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      // TODO: API 호출로 공유 스크립트 목록 가져오기
      const mockScripts: SharedScript[] = [
        {
          id: 1,
          title: '공유 스크립트 1',
          description: '이것은 공유된 스크립트입니다.',
          author: '홍길동',
          createdAt: '2024-03-20',
          updatedAt: '2024-03-20',
        },
        {
          id: 2,
          title: '공유 스크립트 2',
          description: '이것은 또 다른 공유 스크립트입니다.',
          author: '김철수',
          createdAt: '2024-03-21',
          updatedAt: '2024-03-21',
        },
      ];
      setScripts(mockScripts);
      setLoadingScripts(false);
    }
  }, [user]);

  const handleViewScript = (id: number) => {
    // TODO: 스크립트 상세 페이지로 이동
    console.log('스크립트 보기:', id);
  };

  if (loading || loadingScripts) {
    return (
      <Container>
        <Typography>로딩 중...</Typography>
      </Container>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          공유 스크립트
        </Typography>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>제목</TableCell>
                <TableCell>설명</TableCell>
                <TableCell>작성자</TableCell>
                <TableCell>생성일</TableCell>
                <TableCell>수정일</TableCell>
                <TableCell align="right">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scripts.map((script) => (
                <TableRow key={script.id}>
                  <TableCell>{script.title}</TableCell>
                  <TableCell>{script.description}</TableCell>
                  <TableCell>{script.author}</TableCell>
                  <TableCell>{new Date(script.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(script.updatedAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="보기">
                      <IconButton onClick={() => handleViewScript(script.id)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
} 