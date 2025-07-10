// FeedbackForm.jsx
import { useState } from "react";
import { Dialog } from "@headlessui/react";
import Button from "@mui/material/Button";
import { useFeedback } from "../hooks/useFeedback"; // 위치 조정 필요

export default function FeedbackForm({ summaryId, onClose }) {
  const [type, setType] = useState("wrong_info");
  const [comment, setComment] = useState("");
  const { submitFeedback, loading } = useFeedback();

  const handleSubmit = async () => {
    await submitFeedback({ summaryId, type, comment });
    onClose();
  };

  return (
    <Dialog open={true} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white p-6 rounded shadow-md space-y-4 w-full max-w-md">
        <h2 className="text-lg font-bold">피드백 제출</h2>
        <select
          className="w-full border p-2 rounded"
          value={type}
          onChange={e => setType(e.target.value)}
        >
          <option value="wrong_info">잘못된 정보</option>
          <option value="bias">중립성 부족</option>
          <option value="source_issue">출처 문제</option>
          <option value="other">기타</option>
        </select>
        <textarea
          className="w-full border p-2 rounded"
          rows="4"
          placeholder="추가 의견을 작성해주세요"
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button variant="outlined" onClick={onClose}>취소</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            제출
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
