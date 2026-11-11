import { counts, voteLabel } from '../hooks/issueShape';

/** 이슈 행 4줄째 소스 줄. 정부·법안·표결이 모두 0이면 none=true에 보도 수만 남긴다. digest 없으면 빈 줄. */
export function sourceLine(issue) {
  const c = counts(issue);
  if (!c) return { parts: [], none: false, media: 0 };
  const parts = [];
  if (c.gov) parts.push(`정부 ${c.gov}`);
  if (c.bill) parts.push(`법안 ${c.bill}`);
  if (c.vote) {
    const label = voteLabel(issue.digest && issue.digest.vote);
    parts.push(label ? `표결 ${label}` : `표결 ${c.vote}`);
  }
  const none = !c.gov && !c.bill && !c.vote;
  if (c.media || none) parts.push(`보도 ${c.media}`);
  return { parts, none, media: c.media };
}
