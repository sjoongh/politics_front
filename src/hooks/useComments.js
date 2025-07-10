// useComments.js
import { useState, useEffect } from "react";

export function useComments(summaryId, user) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!summaryId) return;

    const fetchComments = async () => {
      const res = await fetch(`/api/comments/${summaryId}`);
      const data = await res.json();
      setComments(data);
    };

    fetchComments();
  }, [summaryId]);

  const submitComment = async (content) => {
    if (!user || !content.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summaryId,
          userId: user.id,
          content,
        }),
      });

      if (!res.ok) throw new Error("댓글 등록 실패");
      const data = await res.json();
      setComments(prev => [...prev, data]);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (id) => {
    if (user?.id !== "admin") return;
    const res = await fetch(`/api/comments/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setComments(prev => prev.filter(c => c.id !== id));
    } else {
      alert("댓글 삭제 실패");
    }
  };

  return { comments, submitComment, deleteComment, loading };
}
