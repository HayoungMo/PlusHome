import { useEffect, useState } from "react";

import InteriorService from "../service/interiorService";
import { useLocation, useNavigate } from "react-router-dom";
import InteriorBooking from "../components/InteriorBooking";
import GetImgDir from "../resources/function/GetImgDir";
import InteriorModelViewer from "../components/InteriorModelViewer";
import InteriorReviewList from "../components/InteriorReviewList";

//테스트용 파일
function InteriorArticle() {
  const location = useLocation();
  const company = location.state.company;
  const answers = location.state.answers;
  const navigate = useNavigate();
  const [article, setArticle] = useState([]);

  const [example, setExample] = useState([]);

  const [selectedImg, setSelectedImg] = useState(null);

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
          const logo = await GetImgDir({
            kind: "I_EXAMPLE",
            returnType: "list",
            a: item.c_id,
            b: item.c_kind,
            c: item.c_name,
            d: item.ie_tag+"_"+item.ie_tag2,
            view: false,
          });
           if (!logo?.result?.length) {
             return null;
           }
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
      업체 상세 페이지
      {company?.logo?.result?.map((item, idx) => (
        <div key={idx}>
          {item.img_tag === "PROFILE" && (
            <img src={item.img_name} alt={`${company.c_name} 로고`} />
          )}

          {item.img_tag === "MODEL" && (
            <InteriorModelViewer src={item.img_name} />
          )}
        </div>
      ))}
      <div>
        상세 조회 결과
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
        예시 조회 결과
        {example.map((item, idx) => (
          <div key={idx}>
            {/* 이미지 출력 */}
            {item.logo?.result
              .filter(
                (record) => record.dir_d === item.ie_tag + "_" + item.ie_tag2,
              )
              .map((record, i) => (
                <div>
                  <img
                    src={record.img_name}
                    alt={`${item.c_name} 예시`}
                    onClick={() => setSelectedImg(record.img_name)}
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                    }}
                  />
                </div>
              ))}
            {selectedImg && (
              <div
                onClick={() => setSelectedImg(null)}
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  backgroundColor: "rgba(0,0,0,0.7)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 9999,
                }}
              >
                <img
                  src={selectedImg}
                  alt="확대 이미지"
                  style={{
                    minWidth: "80%",
                    minHeight: "80%",
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
            )}

            <div>id: {item.c_id}</div>
            <div>name: {item.c_name}</div>
            <div>kind: {item.c_kind}</div>
            <div>tag: {item.ie_tag}</div>
            <div>tag2: {item.ie_tag2}</div>
            <div>content: {item.ie_content}</div>
          </div>
        ))}
      </div>
      <InteriorReviewList company={company} />
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
