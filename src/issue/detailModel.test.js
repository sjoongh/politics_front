import { officialRecords, timelineItems, pressModel, stanceRows, proposerChips } from './detailModel';

const D = {
  events: [],
  source_panels: {
    assembly_vote: [{ id: 'v', title: '표결: X', published_at: '2026-11-10', vote: { yes: 1, no: 0, abstain: 0, result: '가결' } }],
    assembly_bill: [{ id: 'b', title: 'X 개정안', published_at: '2026-10-01', bill: { proposers: ['김의원', '박의원'] } }],
    government: [],
  },
  perspectives: { breakdown: { counts: { left: 2, center: 0, right: 0, foreign: 0, official: 1, unknown: 0 }, total: 3, blindspot: 'right' } },
  digest: { stance: [{ actor: '정부', position: 'explain', basis: 'official' }, { actor: 'A', position: 'support', basis: 'press' }] },
};

test('records merged desc with kind', () => expect(officialRecords(D).map((r) => r.kind)).toEqual(['vote', 'bill']));
test('timeline from records', () => expect(timelineItems(D)).toHaveLength(2));
test('timeline needs two', () => expect(timelineItems({ events: [], source_panels: { assembly_vote: [], assembly_bill: [], government: [] } })).toEqual([]));
test('timeline merges manual events and sorts asc', () => {
  const t = timelineItems({ ...D, events: [{ id: 'e', date: '2026-11-12', headline: '처리' }] });
  expect(t.map((x) => x.date)).toEqual(['2026-10-01', '2026-11-10', '2026-11-12']);
});
test('press model folds official and words blindspot', () => {
  const p = pressModel(D);
  expect(p.counts.unknown).toBe(1); expect(p.total).toBe(3);
  expect(p.blindspotText).toBe('수집된 보도 중 보수 성향 매체 없음');
});
test('press model without perspectives', () => expect(pressModel({}).total).toBe(0));
test('stance rows include press in detail', () => expect(stanceRows(D)).toHaveLength(2));
test('proposer chips match member names, max 8', () => {
  const members = [{ id: 'm1', name: '김의원' }, { id: 'm2', name: '이의원' }];
  expect(proposerChips(D, members)).toEqual([{ id: 'm1', name: '김의원' }]);
});
