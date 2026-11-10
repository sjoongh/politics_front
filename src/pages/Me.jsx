import React from 'react';
import { useNavigate } from 'react-router';
import LoginForm from '../components/LoginForm';
import MyPage from '../components/MyPage';
import ForYouFeed from '../components/ForYouFeed';
import { useAppContext } from '../components/AppContext';
import { useForYou } from '../hooks/useNewsHooks';
import { useReader } from '../layout/AppFrame';

export default function Me() {
  const { user, logout } = useAppContext();
  const navigate = useNavigate();
  const forYou = useForYou(!!user);
  const { openArticle } = useReader();
  if (!user) return <LoginForm inline onSuccess={() => navigate('/me', { replace: true })} />;
  return (
    <div className="me">
      <section>
        <h2 className="section-title">맞춤 이슈·기사</h2>
        <ForYouFeed result={forYou.result} loading={forYou.loading} onDetailClick={(type, content) => openArticle(content, [])} onGoSettings={null} />
      </section>
      <MyPage user={user} />
      <div style={{ padding: '24px 0' }}>
        <button type="button" className="btn btn--outline" onClick={() => { logout(); navigate('/', { replace: true }); }}>로그아웃</button>
      </div>
    </div>
  );
}
