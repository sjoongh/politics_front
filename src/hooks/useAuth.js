import { useState } from "react";
import { useAppContext } from "../components/AppContext";
import api from "./api";

export function useAuth() {
  const { setUser } = useAppContext();
  const [loading, setLoading] = useState(false);

  const login = async (email, password, onSuccess) => {
    if (!email || !password) return alert("EMAIL와 PW를 입력하세요.");
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", { email, password });
      
      const data = res.data;
      // 추후에는 access token을 저장하는 로직 추가 해야함
      setUser(data.data.user);
      if (onSuccess) onSuccess();
    } catch (err) {
      alert(err.message || "로그인 실패");
    } finally {
      setLoading(false);
    }
  };

  const register = async (userInfo, onSuccess) => {
    if (!userInfo || !userInfo.email || !userInfo.password || !userInfo.nickname || !userInfo.phone) {
      return alert("ID와 PW를 입력하세요.");
    }
    setLoading(true);
    try {
      await api.post("/api/auth/register", {
        email: userInfo.email,
        password: userInfo.password,
        nickname: userInfo.nickname,
        phone: userInfo.phone,
      });

      alert("회원가입 완료. 로그인 해주세요.");
      if (onSuccess) onSuccess();
    } catch (err) {
      alert(err.message || "회원가입 실패");
    } finally {
      setLoading(false);
    }
  };

  return { login, register, loading };
}
