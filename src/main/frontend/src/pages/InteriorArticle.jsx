import { useEffect, useState } from "react";

import InteriorService from "../service/interiorService";
import { useLocation, useNavigate } from "react-router-dom";
import InteriorBooking from "../components/InteriorBooking";
import GetImgDir from "../resources/function/GetImgDir";
import InteriorModelViewer from "../components/InteriorModelViewer";

//테스트용 파일
function InteriorArticle() {
  const location = useLocation();
  const company = location.state.company;
  const answers = location.state.answers;
  const navigate = useNavigate();
  const [article, setArticle] = useState([]);

  const [example, setExample] = useState([]);

  const handleNext = () => {
    navigate("/interior/question", {
      state: { company: company },
    });
  };

  useEffect(() => {
    const fetchArticle = async () => {
      const data = await InteriorService.fetchArticle(company);
      setArticle(Array.isArray(data) ? data : []);
    };
    const fetchExample = async () => {
      const data = await InteriorService.fetchExample(company);
      const companyList = Array.isArray(data) ? data : [];
      const listWithImages = await Promise.all(
        companyList.map(async (item) => {
          console.log("아이템" + item);
          const logo = await GetImgDir({
            kind: "I_EXAMPLE",
            returnType: "list",
            a: item.c_id,
            b: item.c_kind,
            c: item.c_name,
            d: item.ie_tag+"_"+item.ie_tag2,
            view: false,
          });
          return {
            ...item,
            logo,
          };
        }),
      );

      setExample(listWithImages);
    };

    fetchArticle();
    fetchExample();
  }, []);

  return (
    <div>
      <img
        src={company.logo.result[0].img_name}
        alt={`${company.c_name} 로고`}
        style={{ width: "100px", height: "100px", objectFit: "cover" }}
      />
      <h2>업체 상세 페이지</h2>
      <InteriorModelViewer/>

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
        <h3>예시 조회 결과</h3>
        {example.map((item, idx) => (
          <div>
            {item.logo.result.map((record, i) => (
              <img
                src={record.img_name}
                alt={`${item.c_name} 로고`}
                style={{ width: "100px", height: "100px", objectFit: "cover" }}
              />
            ))}
            id: {item.c_id}
            name: {item.c_name}
            kind: {item.c_kind}
            tag: {item.ie_tag}
            tag2: {item.ie_tag2}
            content: {item.ie_content}
          </div>
        ))}
      </div>

      {answers ? (
        <InteriorBooking company={company} answers={answers} />
      ) : (
        <button
          onClick={async () => {
            handleNext();
          }}
        >
          상담 신청
        </button>
      )}
    </div>
  );
}

export default InteriorArticle;
