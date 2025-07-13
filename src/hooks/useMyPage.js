
import { useState, useEffect } from "react";
import api from "./api";

export function useMyPage(user) {
  const [bookmarks, setBookmarks] = useState([]);
  const [preferences, setPreferences] = useState({ keywords: [], politicians: [], parties: [] });
  const [notificationOn, setNotificationOn] = useState(user?.notificationOn ?? true);
  const [loading, setLoading] = useState(false);

  // GET: 북마크, 관심사
  const fetchBookmarks = async () => {
    try {
      const res = await api.get("/api/bookmarks/list");
      setBookmarks(res.data || []);
    } catch (err) {
      console.error("북마크 불러오기 실패:", err);
    }
  };

  const fetchPreferences = async () => {
    try {
      const res = await api.get("/api/user/preferences");
      setPreferences(res.data || { keywords: [], politicians: [], parties: [] });
    } catch (err) {
      console.error("관심사 불러오기 실패:", err);
    }
  };

  const updateNotification = async (newValue) => {
    try {
      await api.patch("/api/auth/profile", { enabled: newValue });
      setNotificationOn(newValue);
    } catch (err) {
      console.error("알림 설정 실패:", err);
      throw err;
    }
  };

  const changePassword = async (newPassword) => {
    try {
      await api.post("/api/auth/profile", { password: newPassword });
      alert("비밀번호가 변경되었습니다.");
    } catch (err) {
      alert("비밀번호 변경 실패: " + (err.response?.data?.detail || err.message));
    }
  };

  const deleteAccount = async () => {
    try {
      await api.delete("/api/auth/delete");
      alert("회원 탈퇴가 완료되었습니다.");
      window.location.reload(); // 또는 로그아웃 처리
    } catch (err) {
      alert("회원 탈퇴 실패: " + (err.response?.data?.detail || err.message));
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookmarks();
      fetchPreferences();
    }
  }, [user]);

  return {
    bookmarks,
    preferences,
    notificationOn,
    loading,
    fetchBookmarks,
    fetchPreferences,
    updateNotification,
    changePassword,
    deleteAccount,
  };
}
