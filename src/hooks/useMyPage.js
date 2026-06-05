
import { useEffect } from "react";
import { useAppContext } from "../components/AppContext";
import api from "./api";

export function useMyPage(user) {
  const { logout } = useAppContext();

  // GET: 북마크, 관심사 (currently disabled)
  useEffect(() => {
    if (user) {
      // fetchBookmarks();
      // fetchPreferences();
    }
  }, [user]);

  const changePassword = async (newPassword) => {
    try {
      await api.put("/api/auth/password", {
        password: newPassword,
        email: user.email
      });
    } catch (err) {
      console.error("비밀번호 변경 실패:", err);
    }
  };

  const deleteAccount = async () => {
    try {
      await api.delete("/api/auth/delete", {
        params: { email: user.email }
    });
      logout();
    } catch (err) {
      console.error("회원 탈퇴 실패:", err);
    }
  };

  return {
    changePassword,
    deleteAccount,
  };
}
