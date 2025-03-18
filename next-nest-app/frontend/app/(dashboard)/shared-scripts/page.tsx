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
} from "@mui/material";
import { Visibility as VisibilityIcon } from "@mui/icons-material";
import { getSharedScripts, type Script } from "@/lib/scripts";

export default function SharedScriptsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography variant="h4" component="h1">
            공유된 스크립트
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : scripts.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary">
              공유된 스크립트가 없습니다.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {scripts.map((script) => (
              <Card key={script.id}>
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      cursor: "pointer",
                      "&:hover": {
                        color: "primary.main",
                        textDecoration: "underline",
                      },
                    }}
                    onClick={() => router.push(`/shared-scripts/${script.id}`)}
                  >
                    {script.title}
                    {script.isPublic && (
                      <Chip
                        label="공개"
                        size="small"
                        color="primary"
                        sx={{ ml: 1, fontSize: "0.7rem" }}
                      />
                    )}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    작성자: {script.user?.email || "알 수 없음"}
                  </Typography>
                  {script.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      paragraph
                    >
                      {script.description}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    마지막 수정: {new Date(script.updatedAt).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </Container>
  );
}
