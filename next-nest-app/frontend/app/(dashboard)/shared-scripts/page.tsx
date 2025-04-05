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
  TextField,
  InputAdornment,
} from "@mui/material";
import { Visibility as VisibilityIcon, ContentCopy as ContentCopyIcon, Search as SearchIcon } from "@mui/icons-material";
import { getSharedScripts, searchScripts, type Script } from "@/lib/scripts";
import { createScript } from "@/lib/scripts";

export default function SharedScriptsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Script[]>([]);
  const isSuspended = user?.role === 'SUSPENDED';

  // 검색 모드인지 확인
  const isSearchMode = searchKeyword.trim() !== "";
  const displayScripts = isSearchMode ? searchResults : scripts;

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

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      setError(null);
      const results = await searchScripts(searchKeyword.trim());
      console.log("검색 결과:", results);
      setSearchResults(results || []);
    } catch (error) {
      console.error("스크립트 검색 실패:", error);
      setError("스크립트 검색에 실패했습니다.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCopyScript = async (script: Script) => {
    try {
      const newScript = await createScript({
        title: `${script.title} (복사본)`,
        description: script.description,
        code: script.code,
        isPublic: false,
        tags: script.tags,
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

      {/* 검색 영역 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            label="검색어"
            variant="outlined"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            placeholder="제목, 설명, 태그, 내용 검색"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleSearch}
                    disabled={isSearching}
                    edge="end"
                  >
                    {isSearching ? <CircularProgress size={24} /> : <SearchIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {isSearchMode && (
            <Button
              variant="outlined"
              onClick={() => {
                setSearchKeyword("");
                setSearchResults([]);
              }}
            >
              초기화
            </Button>
          )}
        </Stack>
      </Paper>

      {/* 검색 결과 정보 */}
      {isSearchMode && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1">
            '{searchKeyword}' 검색 결과: {searchResults.length}개
          </Typography>
        </Box>
      )}

      {loading || isSearching ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : displayScripts.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            {isSearchMode ? "검색 결과가 없습니다." : "공유받은 스크립트가 없습니다."}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {displayScripts.map((script) => (
            <Grid item xs={12} sm={6} md={4} key={script.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {script.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {script.description || '설명 없음'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    작성자: {script.user.name || script.user.email}
                  </Typography>
                  {script.tags && script.tags.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {script.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  )}
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
