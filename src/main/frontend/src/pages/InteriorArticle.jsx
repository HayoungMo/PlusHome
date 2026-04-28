
import { useState } from "react";

import InteriorService from "../service/interiorService";


//테스트용 파일
function InteriorArticle() {

    const [article, setArticle] = useState([]);

    const [example, setExample] = useState([]); 

    return (
      <div>
        <div>
          <button
            onClick={async () => {
              const data = await InteriorService.fetchArticle();
              setArticle(data);
            }}
          >
            데이터 조회
          </button>
        </div>

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
          <button
            onClick={async () => {
              const data = await InteriorService.fetchExample();
              setExample(data);
            }}
          >
            데이터 조회
          </button>
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

      </div>
    );

};

export default InteriorArticle;
