import { useState } from "react";
import {
  Button,
  TextField,
  Tabs,
  Tab,
  Paper,
  Typography,
  CircularProgress,
  Box,
  createTheme,
  ThemeProvider,
  IconButton
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from "../hooks/useAuth";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
  },
  typography: {
    fontFamily: `'Noto Sans KR', sans-serif`,
  },
});

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
      alert("휴대폰 번호는 필수입니다.");
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
    <ThemeProvider theme={darkTheme}>
      <Box
        minHeight="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        bgcolor="background.default"
        onClick={(e) => {
          // 폼 외부 클릭 시 종료 (배경 클릭)
          if (e.target.id === 'login-overlay' && onClose) onClose();
        }}
        id="login-overlay"
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 2,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton
            sx={{ position: "absolute", top: 8, right: 8, color: "white" }}
            onClick={onClose}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h4" align="center" gutterBottom>
            POLITICS NEWS
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
    </ThemeProvider>
  );
}
