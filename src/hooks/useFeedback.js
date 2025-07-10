// useFeedback.js
import { useState } from "react";

export function useFeedback() {
  const [loading, setLoading] = useState(false);

  const submitFeedback = async ({ summaryId, type, comment }) => {
    if (!comment) {
      alert("피드백 내용을 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summaryId,
          type,
          comment,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "피드백 제출 실패");

      alert("피드백이 제출되었습니다.");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { submitFeedback, loading };
}
