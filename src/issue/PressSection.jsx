import React, { useState } from 'react';
import BiasBar from './BiasBar';
import { shortDate } from './format';
import { getIssueArticles } from '../hooks/issues';
import './issue.css';

const LEAN = [['left', '진보'], ['center', '중도'], ['right', '보수'], ['foreign', '외신'], ['official', '공식'], ['unknown', '미분류']];

/** 수집된 보도 분포 + 성향별 기사 행. 첫 30건은 상세 응답, 이후는 커서로 더 보기. */
export default function PressSection({ issueId, model, articles, articlesCursor, onOpenArticle }) {
  const [extra, setExtra] = useState({ items: [], cursor: articlesCursor || null, loading: false });
  const all = [...(articles || []), ...extra.items];
  const more = async () => {
    if (!extra.cursor || extra.loading) return;
    setExtra((s) => ({ ...s, loading: true }));
    try {
      const page = await getIssueArticles(issueId, extra.cursor);
      setExtra((s) => ({ items: [...s.items, ...page.items], cursor: page.nextCursor, loading: false }));
    } catch (_) { setExtra((s) => ({ ...s, loading: false })); }
  };
  if (!model || model.total === 0) return null;
  const grouped = {};
  for (const a of all) {
    const g = (model.groups && Object.keys(model.groups).find((k) => (model.groups[k] || []).some((x) => x.source_url === a.source_url))) || 'unknown';
    (grouped[g] = grouped[g] || []).push(a);
  }
  return (
    <div>
      <BiasBar counts={model.counts} total={model.total} />
      {model.blindspotText && <p className="press__blind">{model.blindspotText}</p>}
      {LEAN.map(([k, label]) => (grouped[k] && grouped[k].length ? (
        <div className="press__group" key={k}>
          <div className="press__label">{label} {grouped[k].length}</div>
          <div>
            {grouped[k].map((a) => (
              <button type="button" key={a.id || a.source_url} className="press__item" onClick={() => onOpenArticle(a, all)}>
                <span>{a.source}{a.published_at ? ` · ${shortDate(a.published_at)}` : ''}</span>{a.title}
              </button>
            ))}
          </div>
        </div>
      ) : null))}
      {extra.cursor && (
        <div className="press__more"><button type="button" className="btn btn--outline btn--sm" disabled={extra.loading} onClick={more}>더 보기</button></div>
      )}
    </div>
  );
}
