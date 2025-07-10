import { useAppContext } from "./AppContext";
import SummaryCard from "./SummaryCard";

export default function Favorites() {
  const { user, favorites } = useAppContext();

  return (
    <div>
      {user ? (
        <>
          <p className="text-lg font-bold">{user.id}님의 즐겨찾기</p>
          <div className="space-y-4">
            {favorites.map((item, i) => (
              <SummaryCard key={i} item={item} onTagClick={() => {}} />
            ))}
          </div>
        </>
      ) : (
        <p>로그인이 필요합니다.</p>
      )}
    </div>
  );
}
