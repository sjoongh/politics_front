import { useEffect, useState } from "react";

/**
 * 공용 fetch 훅
 * @param {string} url - 데이터를 가져올 API 주소
 * @returns {[any[], Function]} [데이터 상태, 상태 업데이트 함수]
 */
export default function useFetchData(url) {
  const [data, setData] = useState([]);

  useEffect(() => {
    let ignore = false;
    fetch(url)
      .then(res => res.json())
      .then(json => {
        if (!ignore) setData(json);
      })
      .catch(err => console.warn(`Error fetching from ${url}:`, err));

    return () => { ignore = true };
  }, [url]);

  return [data, setData];
}
