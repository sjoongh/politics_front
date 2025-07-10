export const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('날짜 포맷 에러:', error);
    return dateString;
  }
};

export const formatDateTime = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('날짜시간 포맷 에러:', error);
    return dateString;
  }
};

export const getRelativeTime = (dateString) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMilliseconds = now - date;
    const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return '오늘';
    } else if (diffInDays === 1) {
      return '어제';
    } else if (diffInDays < 7) {
      return `${diffInDays}일 전`;
    } else {
      return formatDate(dateString);
    }
  } catch (error) {
    console.error('상대시간 계산 에러:', error);
    return dateString;
  }
};

export const getCurrentDate = () => {
  return new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getCurrentTime = () => {
  return new Date().toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};