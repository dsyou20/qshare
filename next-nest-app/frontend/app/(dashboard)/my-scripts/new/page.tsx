"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Box,
  Typography,
  Container,
  Paper,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import dynamic from "next/dynamic";
import type { MarkerSeverity } from "monaco-editor";
import { createScript } from "@/lib/scripts";

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

interface EditorError {
  startLineNumber: number;
  endLineNumber: number;
  message: string;
  severity: MarkerSeverity;
}

export default function NewScriptPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<EditorError[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleSave = async () => {
    try {
      if (!title.trim()) {
        setError("제목을 입력해주세요.");
        return;
      }

      const scriptData = {
        title: title.trim(),
        description: description.trim() || undefined,
        code: code.trim(),
        isPublic: false,
      };

      await createScript(scriptData);
      router.push("/my-scripts");
    } catch (error) {
      console.error("스크립트 생성 실패:", error);
      setError("스크립트 생성에 실패했습니다.");
    }
  };

  const handleEditorValidation = (markers: EditorError[]) => {
    setErrors(markers);
  };

  const hasErrors = errors.length > 0;

  if (authLoading) {
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

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          새 스크립트
        </Typography>

        <Box
          sx={{ mb: 2, display: "flex", gap: 1, justifyContent: "flex-end" }}
        >
          <Button
            variant="outlined"
            onClick={() => router.push("/my-scripts")}
            disabled={saving}
          >
            취소
          </Button>
          <Button
            variant="contained"
            startIcon={
              saving ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            onClick={handleSave}
            disabled={!title.trim() || hasErrors || saving}
          >
            {saving ? "저장 중..." : "저장"}
          </Button>
        </Box>

        <Stack spacing={3}>
          <Paper sx={{ p: 2 }}>
            <Stack spacing={2}>
              <TextField
                label="제목"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                required
                disabled={saving}
              />
              <TextField
                label="설명"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                multiline
                rows={2}
                disabled={saving}
              />
            </Stack>
          </Paper>

          {hasErrors && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Python 문법 오류가 있습니다:
              </Typography>
              {errors.map((error, index) => (
                <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                  • 라인 {error.startLineNumber}: {error.message}
                </Typography>
              ))}
            </Alert>
          )}

          <Paper sx={{ height: "calc(100vh - 400px)" }}>
            <MonacoEditor
              height="100%"
              defaultLanguage="python"
              defaultValue={code}
              onChange={(value) => setCode(value || "")}
              onValidate={handleEditorValidation}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                readOnly: saving,
              }}
            />
          </Paper>
        </Stack>
      </Box>
    </Container>
  );
}
