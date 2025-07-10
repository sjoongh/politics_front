import { useState } from "react";
import { useAppContext } from "./AppContext";
import { useComments } from "../hooks/useComments";

export default function CommentSection({ summaryId }) {
  const { user } = useAppContext();
  const [newComment, setNewComment] = useState("");
  const { comments, submitComment, deleteComment } = useComments(summaryId, user);

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    submitComment(newComment);
    setNewComment("");
  };

  return (
    <div className="mt-4 border-t pt-2 text-sm">
      <h4 className="font-bold mb-1">💬 댓글</h4>
      {comments.map(c => (
        <div key={c.id} className="mb-1 flex justify-between items-center">
          <span><b>{c.userId}</b>: {c.content}</span>
          {user?.id === "admin" && (
            <button onClick={() => deleteComment(c.id)} className="text-red-500 text-xs">삭제</button>
          )}
        </div>
      ))}
      {user ? (
        <div className="flex mt-2 gap-2">
          <input
            placeholder="댓글 입력"
            className="border p-1 flex-1"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button onClick={handleSubmit} className="bg-gray-700 text-white px-2 py-1 rounded text-sm">작성</button>
        </div>
      ) : (
        <p className="text-xs text-gray-500 mt-2">※ 로그인 후 댓글 작성 가능</p>
      )}
    </div>
  );
}
