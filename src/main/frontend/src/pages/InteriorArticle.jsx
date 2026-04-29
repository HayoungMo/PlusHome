import { useEffect, useState } from "react";

import InteriorService from "../service/interiorService";
import { useLocation } from "react-router-dom";
import InteriorBooking from "../components/InteriorBooking";

//테스트용 파일
function InteriorArticle() {
  const location = useLocation();
  const company = location.state.data;
  const answers = location.state.answers;

  const [article, setArticle] = useState([]);

  const [example, setExample] = useState([]);

  useEffect(() => {
    const fetchArticle = async () => {
      const data = await InteriorService.fetchArticle(company);
      setArticle(Array.isArray(data) ? data : []);
    };
    const fetchExample = async () => {
      const data = await InteriorService.fetchExample(company);
      setExample(Array.isArray(data) ? data : []);    };

    fetchArticle();
    fetchExample();
  }, []);

  return (
    <div>
      <div>
        <h3>상세 조회 결과</h3>
        {article.map((item, idx) => (
          <div key={idx}>
            id: {item.c_id}
            name: {item.c_name}
            kind: {item.c_kind}
            tag: {item.i_tag}
            text: {item.i_text}
          </div>
        ))}
      </div>

      <div>
        <button onClick={async () => {}}>데이터 조회</button>
      </div>

      <div>
        <h3>예시 조회 결과</h3>
        {example.map((item, idx) => (
          <div key={idx}>
            id: {item.c_id}
            name: {item.c_name}
            kind: {item.c_kind}
            tag: {item.ie_tag}
            tag2: {item.ie_tag2}
            content: {item.ie_content}
          </div>
        ))}
      </div>

      <InteriorBooking company={company} answers={answers} />
    </div>
  );
}

export default InteriorArticle;
