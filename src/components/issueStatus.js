const STATUS_CLASS = {
  '진행중': 'bk-badge',
  '가결': 'bk-badge bk-badge--success',
  '부결': 'bk-badge bk-badge--alert',
  '계류': 'bk-badge bk-badge--warning',
  '종결': 'bk-badge bk-badge--muted',
  '소강': 'bk-badge bk-badge--muted',
};

export function statusBadgeClass(status) {
  return STATUS_CLASS[status] || 'bk-badge';
}
