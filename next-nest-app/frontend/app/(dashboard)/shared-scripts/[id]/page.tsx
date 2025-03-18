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
  Alert,
  CircularProgress,
  Chip,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ContentCopy as ContentCopyIcon,
} from "@mui/icons-material";
import dynamic from "next/dynamic";
import { getScript, createScript, type Script } from "@/lib/scripts";

const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.Editor),
  {
    ssr: false,
    loading: () => (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography>에디터 로딩 중...</Typography>
      </Box>
    ),
  }
);

export default function SharedScriptDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [script, setScript] = useState<Script | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchScript = async () => {
      try {
        setLoading(true);
        setError(null);
        const scriptData = await getScript(params.id);

        console.log("불러온 공유 스크립트 데이터:", scriptData);
        setScript(scriptData);
      } catch (error) {
        console.error("스크립트 조회 실패:", error);
        setError("스크립트를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchScript();
    }
  }, [user, params.id]);

  const handleCopyScript = async () => {
    if (!script) return;
    if (!confirm("이 스크립트를 내 스크립트로 복제하시겠습니까?")) {
      return;
    }

    try {
      setCopying(true);
      console.log("복제할 스크립트 데이터:", script);

      // 스크립트 내용 확인 (code 또는 content 필드)
      let scriptCode = "";

      if (script.code) {
        scriptCode = script.code;
      } else if ((script as any).content) {
        // content 필드가 있는 경우
        scriptCode = (script as any).content;
      } else {
        alert("스크립트 코드를 찾을 수 없습니다.");
        return;
      }

      // 내용이 비어있는지 확인
      if (!scriptCode.trim()) {
        alert("스크립트 내용이 비어있습니다.");
        return;
      }

      const newScript = await createScript({
        title: `${script.title} (복제됨)`,
        description: script.description,
        code: scriptCode,
        isPublic: false,
      });

      alert("스크립트가 성공적으로 복제되었습니다.");
      router.push(`/my-scripts/${newScript.id}`);
    } catch (error) {
      console.error("스크립트 복제 실패:", error);
      setError("스크립트 복제에 실패했습니다.");
    } finally {
      setCopying(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Container>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/shared-scripts")}
          >
            목록으로 돌아가기
          </Button>
        </Box>
      </Container>
    );
  }

  if (!script) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Alert severity="warning">스크립트를 찾을 수 없습니다.</Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/shared-scripts")}
            sx={{ mt: 2 }}
          >
            목록으로 돌아가기
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4 }}>
        <Box sx={{ mb: 3, display: "flex", alignItems: "center" }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/shared-scripts")}
            sx={{ mr: 2 }}
          >
            목록으로
          </Button>
          <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
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
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="내 스크립트로 복제">
              <IconButton
                onClick={handleCopyScript}
                color="primary"
                disabled={copying}
              >
                {copying ? <CircularProgress size={24} /> : <ContentCopyIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            작성자: {script.user?.email || "알 수 없음"}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            마지막 수정: {new Date(script.updatedAt).toLocaleString()}
          </Typography>
        </Paper>

        <Stack spacing={3}>
          {script.description && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                설명
              </Typography>
              <Typography variant="body1">{script.description}</Typography>
            </Paper>
          )}

          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              스크립트 내용
            </Typography>
            <Box
              sx={{ height: "calc(100vh - 350px)", border: "1px solid #ddd" }}
            >
              <MonacoEditor
                height="100%"
                defaultLanguage="python"
                value={script.code}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  readOnly: true,
                  domReadOnly: true,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </Box>
          </Paper>
        </Stack>
      </Box>
    </Container>
  );
}
