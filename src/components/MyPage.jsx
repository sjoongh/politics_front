import { useState } from "react";
import {
  Typography, Avatar, List, ListItem, ListItemText,
  Divider, Switch, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField
} from "@mui/material";
import BookmarkIcon from '@mui/icons-material/Bookmark';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { useMyPage } from "../hooks/useMyPage";

export default function MyPage({ user }) {
  const {
    bookmarks,
    preferences,
    notificationOn,
    updateNotification,
    changePassword,
    deleteAccount,
  } = useMyPage(user);

  const [changePwOpen, setChangePwOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleNotificationToggle = async () => {
    try {
      await updateNotification(!notificationOn);
    } catch (err) {
      alert("알림 설정 변경 실패: " + err.message);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      return alert("비밀번호가 일치하지 않습니다.");
    }
    try {
      await changePassword(newPassword);
      alert("비밀번호가 변경되었습니다.");
      setChangePwOpen(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      alert("비밀번호 변경 실패: " + err.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("정말로 회원 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    try {
      await deleteAccount();
      alert("회원 탈퇴가 완료되었습니다.");
      window.location.reload();
    } catch (err) {
      alert("회원 탈퇴 실패: " + err.message);
    }
  };

  return (
    <div style={{
      minHeight: "60vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--color-background)",
      padding: "32px 0"
    }}>
      <div style={{
        background: "var(--color-surface)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-md)",
        border: "1px solid var(--color-card-border)",
        maxWidth: "420px",
        width: "100%",
        margin: "0 auto",
        padding: "32px"
      }}>
        {/* 프로필 */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: "#21808d", mr: 2 }}>
            {user?.nickname?.[0] || user?.email?.[0] || "U"}
          </Avatar>
          <div>
            <Typography variant="h5" style={{ fontWeight: 600 }}>{user?.nickname || user?.email || "사용자"}</Typography>
            <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
            <Typography variant="caption" color="text.secondary">
              가입일: {user?.createdAt?.slice(0, 10) || "-"}
            </Typography>
          </div>
        </div>

        <Divider sx={{ my: 2 }} />

        {/* 북마크 */}
        <Typography variant="subtitle1" gutterBottom>
          <BookmarkIcon fontSize="small" sx={{ mr: 1 }} />
          북마크한 뉴스
        </Typography>
        <List dense>
          {bookmarks.length > 0 ? bookmarks.map((item) => (
            <ListItem key={item.id} button component="a" href={item.source_url} target="_blank">
              <ListItemText primary={item.title} secondary={item.source} />
            </ListItem>
          )) : <Typography variant="body2" color="text.secondary">북마크한 뉴스가 없습니다.</Typography>}
        </List>

        <Divider sx={{ my: 2 }} />

        {/* 관심사 */}
        <Typography variant="subtitle1" gutterBottom>관심 키워드/정치인/정당</Typography>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
          {preferences.keywords.map(k => <span key={k} className="topic-tag">{k}</span>)}
          {preferences.politicians.map(p => <span key={p} className="topic-tag" style={{ background: "var(--color-success)" }}>{p}</span>)}
          {preferences.parties.map(p => <span key={p} className="topic-tag" style={{ background: "var(--color-warning)" }}>{p}</span>)}
        </div>

        <Divider sx={{ my: 2 }} />

        {/* 알림 설정 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <NotificationsActiveIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="subtitle1" display="inline">알림 설정</Typography>
          </div>
          <Switch checked={notificationOn} onChange={handleNotificationToggle} />
        </div>

        <Divider sx={{ my: 2 }} />

        {/* 비밀번호 변경 / 회원 탈퇴 */}
        <Button variant="outlined" color="primary" fullWidth sx={{ mt: 1 }} onClick={() => setChangePwOpen(true)}>
          비밀번호 변경
        </Button>
        <Button variant="outlined" color="error" fullWidth sx={{ mt: 2 }} onClick={handleDeleteAccount}>
          회원 탈퇴
        </Button>

        {/* 비밀번호 변경 모달 */}
        <Dialog open={changePwOpen} onClose={() => setChangePwOpen(false)}>
          <DialogTitle>비밀번호 변경</DialogTitle>
          <DialogContent>
            <TextField
              label="새 비밀번호"
              type="password"
              fullWidth
              margin="dense"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <TextField
              label="비밀번호 확인"
              type="password"
              fullWidth
              margin="dense"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setChangePwOpen(false)}>취소</Button>
            <Button onClick={handleChangePassword} variant="contained" color="primary">변경</Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}