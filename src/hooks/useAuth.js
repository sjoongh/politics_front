import { useState } from "react";
import { useAppContext } from "../components/AppContext";
import api from "./api";

export function useAuth() {
  const { setUser } = useAppContext();
  const [loading, setLoading] = useState(false);

  const login = async (id, pw) => {
    if (!id || !pw) return alert("ID와 PW를 입력하세요.");
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", { id, pw });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "로그인 실패");

      setUser({ id: data.id });
      alert("로그인 성공");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userInfo) => {
    if (!userInfo || !userInfo.email || !userInfo.password || !userInfo.nickname || !userInfo.phone) {
      return alert("ID와 PW를 입력하세요.");
    }
    setLoading(true);
    try {
      console.log("회원가입 정보:", userInfo);
      const res = await api.post("/api/auth/register", {
        email: userInfo.email,
        password: userInfo.password,
        nickname: userInfo.nickname,
        phone: userInfo.phone,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "회원가입 실패");

      alert("회원가입 완료. 로그인 해주세요.");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { login, register, loading };
}
