'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Box, 
  Typography, 
  Container, 
  Paper,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { getMyScripts, deleteScript, type Script } from '@/lib/scripts';

export default function MyScriptsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchScripts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMyScripts();
        setScripts(data);
      } catch (error) {
        console.error('스크립트 목록 조회 실패:', error);
        setError('스크립트 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchScripts();
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 스크립트를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteScript(id);
      setScripts(scripts.filter(script => script.id !== id));
    } catch (error) {
      console.error('스크립트 삭제 실패:', error);
      alert('스크립트 삭제에 실패했습니다.');
    }
  };

  if (authLoading) {
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
    <Container maxWidth="xl">
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            내 스크립트
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/my-scripts/new')}
          >
            새 스크립트
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : scripts.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              아직 작성한 스크립트가 없습니다.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push('/my-scripts/new')}
              sx={{ mt: 2 }}
            >
              새 스크립트 작성하기
            </Button>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {scripts.map((script) => (
              <Card key={script.id}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {script.title}
                  </Typography>
                  {script.description && (
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {script.description}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    마지막 수정: {new Date(script.updatedAt).toLocaleString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Tooltip title="수정">
                    <IconButton onClick={() => router.push(`/my-scripts/${script.id}/edit`)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="삭제">
                    <IconButton onClick={() => handleDelete(script.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </Container>
  );
} 