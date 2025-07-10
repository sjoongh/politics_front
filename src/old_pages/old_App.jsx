import { useEffect, useState } from "react";
import { Tabs, Tab, Box, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { AppProvider, useAppContext } from "./components/AppContext";
import SummaryCard from "./components/SummaryCard";
import LoginForm from "./components/LoginForm";
import NotificationList from "./components/NotificationList";
import Favorites from "./components/Favorites";
import TagChart from "./components/TagChart";

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const { user } = useAppContext();
  const [tabIndex, setTabIndex] = useState(0);
  const [todaySummaries, setTodaySummaries] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentTags, setRecentTags] = useState([]);
  const [title, setTitle] = useState("");
  const [article, setArticle] = useState("");
  const [tags, setTags] = useState("");
  const [link, setLink] = useState("");
  const [subscribedTags, setSubscribedTags] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetch("/api/summaries/today")
      .then(res => res.json())
      .then(setTodaySummaries);

    fetch("/api/summaries/tags")
      .then(res => res.json())
      .then(setRecentTags);
  }, []);

  useEffect(() => {
    if (subscribedTags.length === 0) return;
    const tagParam = subscribedTags.join(",");
    fetch(`/api/notifications?tags=${encodeURIComponent(tagParam)}`)
      .then(res => res.json())
      .then(setNotifications);
  }, [subscribedTags]);

  const handleChangeTab = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleSubmitSummary = async () => {
    if (!title || !article) return alert("제목과 원문을 입력하세요.");
    const payload = {
      title,
      summary: article,
      tags: tags.split(",").map(t => t.trim()),
      link,
      createdAt: new Date().toISOString()
    };
    const res = await fetch("/api/summaries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      alert("요약이 저장되었습니다.");
      setTitle(""); setArticle(""); setTags(""); setLink("");
    } else {
      alert("요약 저장 실패");
    }
  };

  const handleSearch = async () => {
    const res = await fetch(`/api/summaries/search?keyword=${encodeURIComponent(searchKeyword)}`);
    const data = await res.json();
    setSearchResults(data);
  };

  const handleTagClick = async (tag) => {
    setSearchKeyword(tag);
    const res = await fetch(`/api/summaries/search?tag=${encodeURIComponent(tag)}`);
    const data = await res.json();
    setSearchResults(data);
    setTabIndex(1); // search 탭으로 전환
  };

  return (
    <main className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-4">오늘의 정치 요약</h1>

      <Tabs value={tabIndex} onChange={handleChangeTab} centered>
        <Tab label="오늘의 요약" />
        <Tab label="인물/정당 검색" />
        <Tab label="마이페이지" />
        <Tab label="로그인" />
        <Tab label="알림" />
        <Tab label="통계" />
        <Tab label="관리자" />
      </Tabs>

      <TabPanel value={tabIndex} index={0}>
        {todaySummaries.map((item, i) => (
          <SummaryCard key={i} item={item} onTagClick={handleTagClick} />
        ))}
      </TabPanel>

      <TabPanel value={tabIndex} index={1}>
        <div className="space-y-4">
          <div className="flex gap-2 mb-2">
            <TextField
              placeholder="정당명 또는 의원명을 입력하세요"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <Button onClick={handleSearch} variant="contained">검색</Button>
          </div>
          <div className="text-sm text-gray-500 mb-2">🔥 인기 태그:</div>
          <div className="flex flex-wrap gap-2 mb-4">
            {recentTags.map((tag, i) => (
              <Button
                key={i}
                size="small"
                variant="outlined"
                onClick={() => handleTagClick(tag)}
              >
                #{tag}
              </Button>
            ))}
          </div>
          {searchResults.map((item, i) => (
            <SummaryCard key={i} item={item} onTagClick={handleTagClick} />
          ))}
        </div>
      </TabPanel>

      <TabPanel value={tabIndex} index={2}>
        <Favorites />
      </TabPanel>

      <TabPanel value={tabIndex} index={3}>
        <LoginForm />
      </TabPanel>

      <TabPanel value={tabIndex} index={4}>
        <NotificationList notifications={notifications} setNotifications={setNotifications} />
      </TabPanel>

      <TabPanel value={tabIndex} index={5}>
        <TagChart />
      </TabPanel>

      <TabPanel value={tabIndex} index={6}>
        {user?.id === "admin" ? (
          <div className="space-y-2">
            <TextField fullWidth label="제목" value={title} onChange={e => setTitle(e.target.value)} />
            <TextField fullWidth multiline minRows={4} label="기사 원문" value={article} onChange={e => setArticle(e.target.value)} />
            <TextField fullWidth label="태그 (쉼표 구분)" value={tags} onChange={e => setTags(e.target.value)} />
            <TextField fullWidth label="링크" value={link} onChange={e => setLink(e.target.value)} />
            <Button variant="contained" color="primary" onClick={handleSubmitSummary}>요약 요청</Button>
          </div>
        ) : (
          <Typography>관리자 권한이 필요합니다.</Typography>
        )}
      </TabPanel>
    </main>
  );
}

export default function WrappedApp() {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  );
}
