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
  Modal,
  TextField,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormGroup,
  Tabs,
  Tab,
  Divider,
  Badge,
  Link,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  ContentCopy as ContentCopyIcon,
  PersonRemove as PersonRemoveIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import {
  getMyScripts,
  getSharedScripts,
  deleteScript,
  shareScript,
  searchUsers,
  getShares,
  removeShare,
  createScript,
  type Script,
  type User,
  type ShareScriptDto,
  type ShareInfo,
} from "@/lib/scripts";
import { logout } from "@/lib/auth";

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 1,
};

export default function MyScriptsPage() {
  const router = useRouter();
  const { user, loading: authLoading, setUser } = useAuth();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [sharedScripts, setSharedScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharedScriptsLoading, setSharedScriptsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [shareWithAll, setShareWithAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);
  const [currentShares, setCurrentShares] = useState<User[]>([]);
  const [sharesLoading, setSharesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [myScriptSearch, setMyScriptSearch] = useState("");
  const [sharedScriptSearch, setSharedScriptSearch] = useState("");
  const filteredMyScripts = scripts.filter(
    (script) =>
      script.title.toLowerCase().includes(myScriptSearch.toLowerCase()) ||
      script.description
        ?.toLowerCase()
        .includes(myScriptSearch.toLowerCase()) ||
      false
  );
  const filteredSharedScripts = sharedScripts.filter(
    (script) =>
      script.title.toLowerCase().includes(sharedScriptSearch.toLowerCase()) ||
      script.description
        ?.toLowerCase()
        .includes(sharedScriptSearch.toLowerCase()) ||
      false ||
      script.user?.email
        ?.toLowerCase()
        .includes(sharedScriptSearch.toLowerCase()) ||
      false
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchScripts = async () => {
      try {
        setLoading(true);
        const scripts = await getMyScripts();
        console.log("내 스크립트 데이터:", scripts);
        setScripts(scripts);
      } catch (error) {
        console.error("스크립트 목록 조회 실패:", error);
        setError("스크립트 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    const fetchSharedScripts = async () => {
      try {
        setSharedScriptsLoading(true);
        const scripts = await getSharedScripts();
        console.log("공유 스크립트 데이터:", scripts);
        setSharedScripts(scripts);
      } catch (error) {
        console.error("공유 스크립트 목록 조회 실패:", error);
        setError("공유 스크립트 목록을 불러오는데 실패했습니다.");
      } finally {
        setSharedScriptsLoading(false);
      }
    };

    if (user) {
      fetchScripts();
      fetchSharedScripts();
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const delayDebounceFn = setTimeout(async () => {
        try {
          setSearchLoading(true);
          const results = await searchUsers(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error("사용자 검색 실패:", error);
        } finally {
          setSearchLoading(false);
        }
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleDelete = async (id: string) => {
    if (!confirm("정말로 이 스크립트를 삭제하시겠습니까?")) {
      return;
    }

    try {
      await deleteScript(id);
      setScripts(scripts.filter((script) => script.id !== id));
    } catch (error) {
      console.error("스크립트 삭제 실패:", error);
      alert("스크립트 삭제에 실패했습니다.");
    }
  };

  const handleOpenShareModal = async (script: Script) => {
    setSelectedScript(script);
    setShareWithAll(script.isPublic);
    setSelectedUsers([]);
    setShareModalOpen(true);

    // 현재 공유 상태 불러오기
    try {
      setSharesLoading(true);
      const sharesInfo = await getShares(script.id);
      setCurrentShares(sharesInfo.shares);
      setShareWithAll(sharesInfo.script.isPublic);
    } catch (error) {
      console.error("공유 정보 조회 실패:", error);
    } finally {
      setSharesLoading(false);
    }
  };

  const handleCloseShareModal = () => {
    setShareModalOpen(false);
    setSelectedScript(null);
    setShareWithAll(false);
    setSelectedUsers([]);
    setSearchQuery("");
    setSearchResults([]);
    setShareSuccess(null);
  };

  const handleAddUser = (user: User) => {
    if (!selectedUsers.some((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
      setSearchQuery("");
    }
  };

  const handleRemoveUser = (userId: number) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
  };

  const handleShareScript = async () => {
    if (!selectedScript) return;

    const shareData: ShareScriptDto = {
      shareWithAll,
      userIds: selectedUsers.map((u) => u.id),
    };

    try {
      // 서버에 공유 설정 저장
      const result = await shareScript(selectedScript.id, shareData);

      // 스크립트 목록 갱신 (public 상태 변경 가능성)
      const updatedScripts = scripts.map((script) =>
        script.id === selectedScript.id
          ? { ...script, isPublic: shareWithAll }
          : script
      );
      setScripts(updatedScripts);

      // 공유 설정 변경에 따라 공유된 스크립트 목록 갱신
      if (
        shareWithAll ||
        selectedUsers.length > 0 ||
        currentShares.length > 0
      ) {
        // 새로운 공유 설정이 있으면 (공개 또는 사용자 공유) 목록에 추가
        if (!sharedScripts.some((script) => script.id === selectedScript.id)) {
          // 내 스크립트를 공유 목록에 표시하지 않도록 필터링
          if (selectedScript.user?.id !== user?.id) {
            setSharedScripts([...sharedScripts, selectedScript]);
          }
        }
      } else {
        // 공유 설정이 모두 취소된 경우 목록에서 제거
        const updatedSharedScripts = sharedScripts.filter(
          (script) => script.id !== selectedScript.id
        );
        setSharedScripts(updatedSharedScripts);
      }

      // 현재 공유 상태 다시 불러오기
      try {
        setSharesLoading(true);
        const sharesInfo = await getShares(selectedScript.id);
        setCurrentShares(sharesInfo.shares);
        setShareWithAll(sharesInfo.script.isPublic);
      } catch (error) {
        console.error("공유 정보 조회 실패:", error);
      } finally {
        setSharesLoading(false);
      }

      setShareSuccess(
        shareWithAll || selectedUsers.length > 0
          ? "스크립트가 성공적으로 공유되었습니다."
          : "공유 설정이 변경되었습니다."
      );

      setTimeout(() => {
        setShareSuccess(null);
      }, 3000);
    } catch (error) {
      console.error("스크립트 공유 설정 변경 실패:", error);
      setError("스크립트 공유 설정 변경에 실패했습니다.");
    }
  };

  const handleCancelPublic = async () => {
    if (!selectedScript) return;

    try {
      await shareScript(selectedScript.id, { shareWithAll: false });
      setShareWithAll(false);

      // 스크립트 목록 갱신 (public 상태 변경)
      const updatedScripts = scripts.map((script) =>
        script.id === selectedScript.id
          ? { ...script, isPublic: false }
          : script
      );
      setScripts(updatedScripts);

      // 공개 취소된 스크립트가 공개 상태였다면 공유된 스크립트 목록에서도 제거
      if (selectedScript.isPublic) {
        // 이 스크립트가 공개가 아닌 상태로 다른 사용자와 직접 공유된 경우에는
        // 공유된 스크립트 목록에 남아있을 수 있으므로 완전히 제거하지 않음
        const updatedSharedScripts = sharedScripts.filter((script) => {
          // 이 스크립트가 다른 공유 상태(개인 공유)로 목록에 남아있는지 확인
          if (script.id === selectedScript.id) {
            return currentShares.length > 0;
          }
          return true;
        });
        setSharedScripts(updatedSharedScripts);
      }

      setShareSuccess("공개 설정이 해제되었습니다.");

      setTimeout(() => {
        setShareSuccess(null);
      }, 3000);
    } catch (error) {
      console.error("공개 설정 해제 실패:", error);
      setError("공개 설정 해제에 실패했습니다.");
    }
  };

  const handleCancelShare = async (userId: number) => {
    if (!selectedScript) return;

    try {
      // 서버에 공유 취소 요청
      await removeShare(selectedScript.id, userId);

      // 화면에서 공유 목록 업데이트
      setCurrentShares(currentShares.filter((u) => u.id !== userId));

      // 공유 목록이 비어있고, 공개도 아니라면 공유된 스크립트 목록에서 제거
      if (currentShares.length === 1 && !shareWithAll) {
        // 스크립트 목록 갱신
        const updatedScripts = scripts.map((script) =>
          script.id === selectedScript.id
            ? { ...script, isPublic: false }
            : script
        );
        setScripts(updatedScripts);

        // 공유된 스크립트 목록 업데이트
        const updatedSharedScripts = sharedScripts.filter(
          (script) => script.id !== selectedScript.id
        );
        setSharedScripts(updatedSharedScripts);
      }

      setShareSuccess("해당 사용자와의 공유가 취소되었습니다.");

      setTimeout(() => {
        setShareSuccess(null);
      }, 3000);
    } catch (error) {
      console.error("공유 취소 실패:", error);
      setError("공유 취소에 실패했습니다.");
    }
  };

  const handleCancelAllShares = async () => {
    if (!selectedScript || !confirm("모든 사용자와의 공유를 취소하시겠습니까?"))
      return;

    try {
      // 개별 사용자 공유 취소
      if (currentShares.length > 0) {
        const cancelPromises = currentShares.map((user) =>
          removeShare(selectedScript.id, user.id)
        );
        await Promise.all(cancelPromises);
      }

      // 공개 설정도 취소 (확실히 서버에 저장)
      if (shareWithAll) {
        await shareScript(selectedScript.id, {
          shareWithAll: false,
          userIds: [],
        });
        setShareWithAll(false);
      }

      // 스크립트 목록 갱신 (public 상태 변경)
      const updatedScripts = scripts.map((script) =>
        script.id === selectedScript.id
          ? { ...script, isPublic: false }
          : script
      );
      setScripts(updatedScripts);

      // 공유된 스크립트 목록에서 이 스크립트 제거
      const updatedSharedScripts = sharedScripts.filter(
        (script) => script.id !== selectedScript.id
      );
      setSharedScripts(updatedSharedScripts);

      // 현재 공유 목록 비우기
      setCurrentShares([]);
      setShareSuccess("모든 공유가 취소되었습니다.");

      setTimeout(() => {
        setShareSuccess(null);
      }, 3000);
    } catch (error) {
      console.error("공유 일괄 취소 실패:", error);
      setError("공유 취소에 실패했습니다.");
    }
  };

  const handleCopyScript = async (script: Script) => {
    if (!confirm("이 스크립트를 내 스크립트로 복제하시겠습니까?")) {
      return;
    }

    try {
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

      // 내 스크립트 목록 새로고침
      const updatedScripts = await getMyScripts();
      setScripts(updatedScripts);

      alert("스크립트가 성공적으로 복제되었습니다.");
    } catch (error) {
      console.error("스크립트 복제 실패:", error);
      alert("스크립트 복제에 실패했습니다.");
    }
  };

  // 빠른 공유 취소 처리 (스크립트 카드에서 직접 호출)
  const handleQuickCancelShare = async (scriptId: string) => {
    if (!confirm("이 스크립트의 공유를 취소하시겠습니까?")) return;

    try {
      // 서버에 모든 공유 취소 요청
      const script = scripts.find((s) => s.id === scriptId);

      if (script) {
        // 공개 설정 해제
        await shareScript(scriptId, {
          shareWithAll: false,
          userIds: [], // 빈 배열로 설정하여 모든 공유 취소
        });

        // 개별 공유된 사용자 목록 조회 후 각각 취소
        const sharesInfo = await getShares(scriptId);
        if (sharesInfo.shares.length > 0) {
          const cancelPromises = sharesInfo.shares.map((user) =>
            removeShare(scriptId, user.id)
          );
          await Promise.all(cancelPromises);
        }

        // 스크립트 목록 갱신 (public 상태 변경)
        const updatedScripts = scripts.map((s) =>
          s.id === scriptId ? { ...s, isPublic: false } : s
        );
        setScripts(updatedScripts);

        // 공유된 스크립트 목록에서 이 스크립트 제거
        const updatedSharedScripts = sharedScripts.filter(
          (s) => s.id !== scriptId
        );
        setSharedScripts(updatedSharedScripts);

        // 성공 메시지 표시
        alert("모든 공유가 취소되었습니다.");
      }
    } catch (error) {
      console.error("공유 취소 실패:", error);
      alert("공유 취소에 실패했습니다.");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // 로그아웃 후 AuthContext의 user 상태를 null로 업데이트
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("로그아웃 실패:", error);
      setError("로그아웃에 실패했습니다.");
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
      {/* 로그아웃 버튼과 환영합니다 링크를 화면 우상단에 고정 */}
      <Box
        sx={{
          position: "fixed",
          top: 16,
          right: 24,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Link
          href="/dashboard"
          color="primary"
          sx={{
            textDecoration: "none",
            fontWeight: 500,
            cursor: "pointer",
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          환영합니다
        </Link>
        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          로그아웃
        </Button>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            position: "relative",
          }}
        >
          <Typography variant="h4" component="h1">
            스크립트 관리
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push("/my-scripts/new")}
          >
            새 스크립트
          </Button>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
          >
            <Tab label="내 스크립트" />
            <Tab
              label={
                <Badge
                  color="primary"
                  badgeContent={sharedScripts.length}
                  max={99}
                  showZero={false}
                >
                  공유된 스크립트
                </Badge>
              }
            />
          </Tabs>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {activeTab === 0 && (
          <>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="스크립트 제목 또는 설명 검색"
              value={myScriptSearch}
              onChange={(e) => setMyScriptSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                endAdornment: myScriptSearch ? (
                  <IconButton
                    size="small"
                    onClick={() => setMyScriptSearch("")}
                  >
                    <CloseIcon />
                  </IconButton>
                ) : null,
              }}
              sx={{ mb: 2 }}
            />

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : scripts.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="h6" color="text.secondary">
                  아직 작성한 스크립트가 없습니다.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => router.push("/my-scripts/new")}
                  sx={{ mt: 2 }}
                >
                  새 스크립트 작성하기
                </Button>
              </Paper>
            ) : filteredMyScripts.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="h6" color="text.secondary">
                  검색 결과가 없습니다.
                </Typography>
              </Paper>
            ) : (
              <Stack spacing={2}>
                {filteredMyScripts.map((script) => (
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
                        onClick={() => router.push(`/my-scripts/${script.id}`)}
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
                        마지막 수정:{" "}
                        {new Date(script.updatedAt).toLocaleString()}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Tooltip title="수정">
                        <IconButton
                          onClick={() =>
                            router.push(`/my-scripts/${script.id}/edit`)
                          }
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="삭제">
                        <IconButton
                          onClick={() => handleDelete(script.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="공유">
                        <IconButton
                          onClick={() => handleOpenShareModal(script)}
                          color="primary"
                        >
                          <ShareIcon />
                        </IconButton>
                      </Tooltip>
                      {script.isPublic && (
                        <Tooltip title="공유 취소">
                          <IconButton
                            onClick={() => handleQuickCancelShare(script.id)}
                            color="error"
                          >
                            <CloseIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </CardActions>
                  </Card>
                ))}
              </Stack>
            )}
          </>
        )}

        {activeTab === 1 && (
          <>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="스크립트 제목, 설명 또는 작성자 검색"
              value={sharedScriptSearch}
              onChange={(e) => setSharedScriptSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                endAdornment: sharedScriptSearch ? (
                  <IconButton
                    size="small"
                    onClick={() => setSharedScriptSearch("")}
                  >
                    <CloseIcon />
                  </IconButton>
                ) : null,
              }}
              sx={{ mb: 2 }}
            />

            {sharedScriptsLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : sharedScripts.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="h6" color="text.secondary">
                  공유된 스크립트가 없습니다.
                </Typography>
              </Paper>
            ) : filteredSharedScripts.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="h6" color="text.secondary">
                  검색 결과가 없습니다.
                </Typography>
              </Paper>
            ) : (
              <Stack spacing={2}>
                {filteredSharedScripts.map((script) => (
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
                        onClick={() => router.push(`/my-scripts/${script.id}`)}
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
                        마지막 수정:{" "}
                        {new Date(script.updatedAt).toLocaleString()}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Tooltip title="복제">
                        <IconButton
                          onClick={() => handleCopyScript(script)}
                          color="primary"
                        >
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                ))}
              </Stack>
            )}
          </>
        )}
      </Box>

      <Dialog
        open={shareModalOpen}
        onClose={handleCloseShareModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          스크립트 공유
          <IconButton
            onClick={handleCloseShareModal}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {shareSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {shareSuccess}
            </Alert>
          )}

          <Typography variant="subtitle1" gutterBottom>
            {selectedScript?.title}
          </Typography>

          <Paper sx={{ p: 2, my: 2, bgcolor: "background.default" }}>
            <Typography
              variant="subtitle2"
              gutterBottom
              fontWeight="bold"
              color="primary"
            >
              공개 설정
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={shareWithAll}
                    onChange={(e) => setShareWithAll(e.target.checked)}
                  />
                }
                label="모든 사용자와 공유 (공개)"
              />
            </Box>
          </Paper>

          <Paper sx={{ p: 2, my: 2, bgcolor: "background.default" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="subtitle2" fontWeight="bold" color="primary">
                공유 중인 사용자 ({currentShares.length}명)
              </Typography>
              {currentShares.length > 0 && (
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  startIcon={<CloseIcon />}
                  onClick={handleCancelAllShares}
                >
                  모든 공유 취소
                </Button>
              )}
            </Box>

            {sharesLoading ? (
              <CircularProgress size={24} sx={{ ml: 1 }} />
            ) : currentShares.length > 0 ? (
              <List dense sx={{ bgcolor: "background.paper", borderRadius: 1 }}>
                {currentShares.map((user) => (
                  <ListItem key={user.id}>
                    <ListItemText
                      primary={user.name || user.email}
                      secondary={user.name ? user.email : undefined}
                    />
                    <ListItemSecondaryAction>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleCancelShare(user.id)}
                        startIcon={<PersonRemoveIcon />}
                      >
                        공유 취소
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ py: 2 }}
              >
                현재 공유 중인 사용자가 없습니다
              </Typography>
            )}
          </Paper>

          <Paper sx={{ p: 2, my: 2, bgcolor: "background.default" }}>
            <Typography
              variant="subtitle2"
              gutterBottom
              fontWeight="bold"
              color="primary"
            >
              새 사용자와 공유
            </Typography>

            <Autocomplete
              freeSolo
              options={searchResults}
              loading={searchLoading}
              getOptionLabel={(option: any) =>
                typeof option === "string"
                  ? option
                  : `${option.name || ""} (${option.email})`
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="사용자 검색 (이름 또는 이메일)"
                  variant="outlined"
                  fullWidth
                  onChange={(e) => setSearchQuery(e.target.value)}
                  value={searchQuery}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: searchLoading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : (
                      params.InputProps.endAdornment
                    ),
                  }}
                />
              )}
              onChange={(_, value) => {
                if (value && typeof value !== "string") {
                  handleAddUser(value);
                }
              }}
              value={searchQuery}
              renderOption={(props, option) => (
                <li {...props}>
                  {option.name
                    ? `${option.name} (${option.email})`
                    : option.email}
                </li>
              )}
            />

            {selectedUsers.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  추가할 사용자: {selectedUsers.length}명
                </Typography>
                <List
                  dense
                  sx={{ bgcolor: "background.paper", borderRadius: 1 }}
                >
                  {selectedUsers.map((user) => (
                    <ListItem key={user.id}>
                      <ListItemText
                        primary={user.name || user.email}
                        secondary={user.name ? user.email : undefined}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveUser(user.id)}
                        >
                          <CloseIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Paper>
        </DialogContent>
        <DialogActions
          sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider" }}
        >
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleCloseShareModal}
            startIcon={<CloseIcon />}
            size="large"
          >
            닫기
          </Button>
          <Button
            onClick={handleShareScript}
            variant="contained"
            color="primary"
            startIcon={<ShareIcon />}
            size="large"
          >
            적용하기
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
