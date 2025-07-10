import { useAppContext } from "./AppContext";
import Button from "@mui/material/Button";
import NotificationsIcon from "@mui/icons-material/Notifications";
import useFetchData from "../hooks/useFetchData";

export default function NotificationList() {
  const [notifications, setNotifications] = useFetchData("/api/notifications");

  const markAsRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error("읽음 처리 실패:", err);
    }
  };

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <NotificationsIcon /> 구독 알림
      </h2>
      {notifications.length === 0 ? (
        <p className="text-sm text-gray-500">새로운 알림이 없습니다.</p>
      ) : (
        <ul className="list-disc pl-5">
          {notifications.map((note, i) => (
            <li key={i} className="text-sm flex justify-between items-start gap-2">
              <div>
                <span>{note.message}</span>
                {note.tags && (
                  <div className="text-xs text-gray-500 mt-1">
                    {note.tags.map((tag, j) => (
                      <span key={j} className="mr-1">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <Button size="small" onClick={() => markAsRead(note.id)}>읽음</Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}