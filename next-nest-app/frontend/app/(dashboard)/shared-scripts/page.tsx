"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
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
  Chip,
  Grid,
} from "@mui/material";
import { Visibility as VisibilityIcon, ContentCopy as ContentCopyIcon } from "@mui/icons-material";
import { getSharedScripts, type Script } from "@/lib/scripts";
import { createScript } from "@/lib/scripts";

export default function SharedScriptsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isSuspended = user?.role === 'SUSPENDED';

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchScripts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getSharedScripts();
        setScripts(data);
      } catch (error) {
        console.error("공유된 스크립트 목록 조회 실패:", error);
        setError("공유된 스크립트 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchScripts();
    }
  }, [user]);

  const handleCopyScript = async (script: Script) => {
    try {
      const newScript = await createScript({
        title: `${script.title} (복사본)`,
        description: script.description,
        code: script.code,
        isPublic: false,
      });
      router.push(`/my-scripts/${newScript.id}`);
    } catch (error) {
      console.error("스크립트 복제 실패:", error);
      alert("스크립트 복제에 실패했습니다.");
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
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1">
          공유 스크립트
        </Typography>
      </Box>

      {isSuspended && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          계정이 정지되어 스크립트 작성이 제한됩니다.
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : scripts.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            공유받은 스크립트가 없습니다.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {scripts.map((script) => (
            <Grid item xs={12} sm={6} md={4} key={script.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {script.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {script.description || '설명 없음'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    작성자: {script.user.name || script.user.email}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="스크립트 보기">
                      <IconButton onClick={() => router.push(`/shared-scripts/${script.id}`)}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    {!isSuspended && (
                      <Tooltip title="스크립트 복제">
                        <IconButton onClick={() => handleCopyScript(script)}>
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
