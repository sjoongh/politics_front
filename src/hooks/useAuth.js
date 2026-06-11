import { useState } from "react";
import toast from 'react-hot-toast';
import { useAppContext } from "../components/AppContext";
import api from "./api";

export function useAuth() {
  const { setUser } = useAppContext();
  const [loading, setLoading] = useState(false);

  const login = async (email, password, onSuccess) => {
    if (!email || !password) return toast.error("이메일과 비밀번호를 입력하세요.");
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", { email, password });
      
      const data = res.data;
      if (data.data?.access_token) {
        localStorage.setItem('access_token', data.data.access_token);
      }
      setUser(data.data.user);
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.message || "로그인 실패");
    } finally {
      setLoading(false);
    }
  };

  const register = async (userInfo, onSuccess) => {
    if (!userInfo || !userInfo.email || !userInfo.password || !userInfo.nickname || !userInfo.phone) {
      return toast.error("모든 필수 정보를 입력하세요.");
    }
    setLoading(true);
    try {
      await api.post("/api/auth/register", {
        email: userInfo.email,
        password: userInfo.password,
        nickname: userInfo.nickname,
        phone: userInfo.phone,
      });

      toast.success("회원가입 완료. 로그인 해주세요.");
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.message || "회원가입 실패");
    } finally {
      setLoading(false);
    }
  };

  return { login, register, loading };
}
