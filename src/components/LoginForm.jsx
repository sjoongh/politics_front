import { useState } from "react";
import toast from 'react-hot-toast';
import {
  Button,
  TextField,
  Tabs,
  Tab,
  Paper,
  Typography,
  CircularProgress,
  Box,
  IconButton
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from "../hooks/useAuth";

export default function LoginForm({ onSuccess, onClose }) {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");

  const { login, register, loading } = useAuth();

  const handleRegister = (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error("휴대폰 번호는 필수입니다.");
      return;
    }

    // 확장된 회원정보 전달
    register({
      email,
      password,
      nickname,
      phone,
    }, () => setTab(0) // 회원가입 후 로그인 탭으로 전환
      );
  }

  return (
    <Box
        minHeight="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        bgcolor="background.default"
        onClick={(e) => {
          // 폼 외부 클릭 시 종료 (배경 클릭)
          if (e.target === e.currentTarget && onClose) onClose();
        }}
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,                       // (중요) 웹뷰 모달보다 높게
          bgcolor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* 카드 */}
        <Paper
          elevation={8}
          sx={{
            p: 4,
            width: { xs: '90%', sm: 400 },
            bgcolor: "background.paper",
            borderRadius: 3,
            position: 'relative',
          }}
          onClick={(e) => e.stopPropagation()} // 내부 클릭은 닫힘 방지
        >
          <IconButton
            sx={{ position: "absolute", top: 8, right: 8, color: "text.secondary" }}
            onClick={onClose}                  // X 버튼으로 닫기
          >
            <CloseIcon />
          </IconButton>

          {/* ... 탭/폼 내용 동일 ... */}
          <Typography variant="h5" align="center" sx={{ fontWeight: 800, color: 'primary.main', mb: 0.5 }}>
            브리핑 코리아
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 2 }}>
            로그인하고 맞춤 브리핑을 받아보세요
          </Typography>

          <Tabs
            value={tab}
            onChange={(_, newValue) => setTab(newValue)}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{ mb: 3 }}
          >
            <Tab label="로그인" />
            <Tab label="회원가입" />
          </Tabs>

          {tab === 0 ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                login(email, password, onSuccess);
              }}
            >
              <TextField
                label="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                margin="normal"
                autoComplete="username"
              />
              <TextField
                label="비밀번호"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                margin="normal"
                autoComplete="current-password"
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "로그인"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <TextField
                label="이메일"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                margin="normal"
                autoComplete="username"
              />
              <TextField
                label="비밀번호"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                margin="normal"
                autoComplete="new-password"
              />
              <TextField
                label="닉네임 (필수)"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                fullWidth
                margin="normal"
              />
              <TextField
                label="휴대폰 번호 (필수)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                fullWidth
                margin="normal"
                placeholder="010-1234-5678"
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "회원가입"}
              </Button>
            </form>
          )}
        </Paper>
      </Box>
  );
}
