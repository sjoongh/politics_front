import { Card, CardContent, Typography, IconButton, Button, Chip, Box } from "@mui/material";
import { Favorite as FavoriteIcon } from "@mui/icons-material";
import { useAppContext } from "./AppContext";
import CommentSection from "./CommentSection";
import { useState } from "react";
import FeedbackForm from "./FeedbackForm";

export default function SummaryCard({ item, onTagClick }) {
  const { favorites, setFavorites } = useAppContext();
  const [showFeedback, setShowFeedback] = useState(false);

  const handleFavorite = () => {
    const exists = favorites.find(f => f.title === item.title);
    if (!exists) setFavorites([...favorites, item]);
  };

  const handleCopyUrl = () => {
    const url = window.location.origin + "/summary/" + encodeURIComponent(item.id);
    navigator.clipboard.writeText(url);
    alert("URL이 복사되었습니다!");
  };

  const handleTwitterShare = () => {
    const tweet = `정치 요약: "${item.title}"\n원문 보기: ${item.link}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
    window.open(twitterUrl, "_blank");
  };

  const handleKakaoShare = () => {
    if (window.Kakao?.Share) {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: item.title,
          description: item.summary,
          link: {
            webUrl: item.link,
            mobileWebUrl: item.link
          }
        },
        buttons: [
          {
            title: '원문 보기',
            link: {
              webUrl: item.link,
              mobileWebUrl: item.link
            }
          }
        ]
      });
    } else {
      alert("카카오 SDK가 로드되지 않았습니다.");
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between">
          <Box>
            <Typography variant="h6">{item.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {item.summary}
            </Typography>
          </Box>
          <IconButton onClick={handleFavorite} color="error">
            <FavoriteIcon />
          </IconButton>
        </Box>

        {item.tags && (
          <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
            {item.tags.map((tag, j) => (
              <Chip
                key={j}
                label={`#${tag}`}
                size="small"
                variant="outlined"
                onClick={() => onTagClick(tag)}
              />
            ))}
          </Box>
        )}

        <Typography
          variant="body2"
          component="a"
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ display: "block", mt: 1, color: "primary.main", textDecoration: "underline" }}
        >
          원문 보기
        </Typography>

        <Box mt={2} display="flex" gap={2}>
          <Button size="small" onClick={handleCopyUrl}>URL 복사</Button>
          <Button size="small" onClick={handleTwitterShare}>트위터 공유</Button>
          <Button size="small" onClick={handleKakaoShare}>카카오톡 공유</Button>
          <Button size="small" color="error" onClick={() => setShowFeedback(true)}>피드백</Button>
        </Box>
      </CardContent>

      <CommentSection summaryId={item.id} />

      {showFeedback && (
        <FeedbackForm summaryId={item.id} onClose={() => setShowFeedback(false)} />
      )}
    </Card>
  );
}
