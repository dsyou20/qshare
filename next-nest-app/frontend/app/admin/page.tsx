'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Collapse,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  AdminPanelSettings as AdminIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { makeUserAdmin, removeAdminRole } from '@/lib/scripts';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  token?: string;
}

interface Script {
  id: number;
  title: string;
  content: string;
  description: string;
  isPublic: boolean;
  useCount: number;
  createdAt: string;
  author: {
    id: number;
    email: string;
    name: string;
  };
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalScripts: 0, totalShares: 0, totalFavorites: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [expandedScripts, setExpandedScripts] = useState<number[]>([]);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const config = {
        headers: getAuthHeader()
      };
      
      const [usersRes, scriptsRes, statsRes] = await Promise.all([
        axios.get('/api/admin/users', config),
        axios.get('/api/admin/scripts', config),
        axios.get('/api/admin/stats', config),
      ]);
      setUsers(usersRes.data);
      setScripts(scriptsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleMakeAdmin = async (userId: number) => {
    try {
      await makeUserAdmin(userId);
      fetchData();
      alert('관리자 권한이 부여되었습니다.');
    } catch (error) {
      console.error('관리자 권한 부여 실패:', error);
      alert('관리자 권한 부여에 실패했습니다.');
    }
  };

  const handleRemoveAdmin = async (userId: number) => {
    try {
      await removeAdminRole(userId);
      fetchData();
      alert('관리자 권한이 해제되었습니다.');
    } catch (error) {
      console.error('관리자 권한 해제 실패:', error);
      alert('관리자 권한 해제에 실패했습니다.');
    }
  };

  const handleChangePassword = async () => {
    if (!selectedUser) return;
    
    try {
      await axios.put(`/api/admin/users/${selectedUser.id}/change-password`, 
        { newPassword },
        { headers: getAuthHeader() }
      );
      setPasswordDialog(false);
      setSelectedUser(null);
      setNewPassword('');
      alert('비밀번호가 변경되었습니다.');
    } catch (error) {
      console.error('비밀번호 변경 실패:', error);
      alert('비밀번호 변경에 실패했습니다.');
    }
  };

  const handleSuspendUser = async (userId: number) => {
    try {
      const config = {
        headers: getAuthHeader()
      };
      await axios.put(`/api/admin/users/${userId}/suspend`, {}, config);
      fetchData();
      alert('계정이 정지되었습니다.');
    } catch (error) {
      console.error('계정 정지 실패:', error);
      alert('계정 정지에 실패했습니다.');
    }
  };

  const handleUnsuspendUser = async (userId: number) => {
    try {
      const config = {
        headers: getAuthHeader()
      };
      await axios.put(`/api/admin/users/${userId}/unsuspend`, {}, config);
      fetchData();
      alert('계정 정지가 해제되었습니다.');
    } catch (error) {
      console.error('계정 정지 해제 실패:', error);
      alert('계정 정지 해제에 실패했습니다.');
    }
  };

  const handleExpandScript = (scriptId: number) => {
    setExpandedScripts(prev => 
      prev.includes(scriptId) 
        ? prev.filter(id => id !== scriptId)
        : [...prev, scriptId]
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        관리자 페이지
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                총 사용자
              </Typography>
              <Typography variant="h5">{stats.totalUsers}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                총 스크립트
              </Typography>
              <Typography variant="h5">{stats.totalScripts}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                총 공유
              </Typography>
              <Typography variant="h5">{stats.totalShares}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                총 즐겨찾기
              </Typography>
              <Typography variant="h5">{stats.totalFavorites}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ mb: 4 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="사용자 관리" />
          <Tab label="스크립트 관리" />
        </Tabs>

        {activeTab === 0 && (
          <List>
            {users.map((user) => (
              <ListItem key={user.id} divider>
                <ListItemText
                  primary={user.email}
                  secondary={
                    <>
                      이름: {user.name} | 역할: {user.role} | 
                      가입일: {new Date(user.createdAt).toLocaleDateString()}
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      onClick={() => {
                        setSelectedUser(user);
                        setPasswordDialog(true);
                      }}
                    >
                      비밀번호 변경
                    </Button>
                    {user.role !== 'ADMIN' && (
                      <>
                        <Button
                          size="small"
                          startIcon={<AdminIcon />}
                          onClick={() => handleMakeAdmin(user.id)}
                        >
                          관리자로 변경
                        </Button>
                        {user.role === 'SUSPENDED' ? (
                          <Button
                            size="small"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => handleUnsuspendUser(user.id)}
                          >
                            정지 해제
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            color="error"
                            startIcon={<BlockIcon />}
                            onClick={() => handleSuspendUser(user.id)}
                          >
                            계정 정지
                          </Button>
                        )}
                      </>
                    )}
                    {user.role === 'ADMIN' && (
                      <Button
                        size="small"
                        color="warning"
                        startIcon={<AdminIcon sx={{ transform: 'rotate(180deg)' }} />}
                        onClick={() => handleRemoveAdmin(user.id)}
                      >
                        관리자 권한 해제
                      </Button>
                    )}
                  </Stack>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}

        {activeTab === 1 && (
          <List>
            {scripts.map((script) => (
              <Box key={script.id}>
                <ListItem divider>
                  <ListItemText
                    primary={script.title}
                    secondary={
                      <>
                        작성자: {script.author.name} | 공개: {script.isPublic ? '예' : '아니오'} | 
                        사용 횟수: {script.useCount} | 
                        작성일: {new Date(script.createdAt).toLocaleDateString()}
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleExpandScript(script.id)}
                      size="small"
                    >
                      {expandedScripts.includes(script.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Collapse in={expandedScripts.includes(script.id)} timeout="auto" unmountOnExit>
                  <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      설명
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {script.description || '설명 없음'}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      스크립트 내용
                    </Typography>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        bgcolor: 'background.paper',
                        maxHeight: '300px',
                        overflow: 'auto',
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                        fontSize: '0.875rem'
                      }}
                    >
                      {script.content}
                    </Paper>
                  </Box>
                </Collapse>
              </Box>
            ))}
          </List>
        )}
      </Paper>

      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)}>
        <DialogTitle>비밀번호 변경</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="새 비밀번호"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>취소</Button>
          <Button onClick={handleChangePassword} variant="contained">
            변경
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 