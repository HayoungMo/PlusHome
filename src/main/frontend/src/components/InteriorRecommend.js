import React, { useEffect, useState } from "react";
import InteriorService from "../service/interiorService";
import { useNavigate } from "react-router-dom";
import GetImgDir from "../resources/function/GetImgDir";
import InteriorAnswerAi from "./InteriorAnswerAi";
import "../css/InteriorRecommend.css";

const InteriorRecommend = ({ answers, fromChatbot = false }) => {
  //알고리즘 적용시 리스트 컴포넌트
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [tags, setTags] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
      const companies = await InteriorService.fetchList();
      const tags = await InteriorService.fetchArticleList();
      setTags(Array.isArray(tags) ? tags : []);

      const result = recommendCompanies(
        Array.isArray(companies) ? companies : [],
        Array.isArray(tags) ? tags : [],
        answers,
      );

      const companyList = Array.isArray(result) ? result : [];
      const resultWithImages = await Promise.all(
        companyList.map(async (item) => {
          console.log("아이템" + item);
          const logo = await GetImgDir({
            kind: "LOGO",
            returnType: "list",
            a: item.c_id,
            b: item.c_kind,
            c: item.c_name,
            d: "Logo",
            view: false,
          });
          return {
            ...item,
            logo,
          };
        }),
      );

      setList(resultWithImages);
    };

    if (answers) {
      fetchData();
    }
  }, [answers]);

  const handleNext = (company, answers) => {
    navigate("/interior/article", {
      state: { company: company, answers: answers },
    });
  };

  const getScoreMap = (tags, answers) => {
    const weight = {
      spaces: 5,
      housingType: 4,
      budget: 3,
      areaSize: 2,
      houseCondition: 2,
      purpose: 2,
      schedule: 1,
    };

    const scoreMap = {};

    tags.forEach((tag) => {
      const key = `${tag.c_id}_${tag.c_name}_${tag.c_kind}`;
      const tagName = tag.i_tag;
      const tagText = tag.i_text;

      if (!scoreMap[key]) scoreMap[key] = 0;

      if (tagName === "spaces") {
        if (answers.spaces.includes(tagText)) {
          scoreMap[key] += weight.spaces;
        }
      } else {
        if (answers[tagName] === tagText) {
          scoreMap[key] += weight[tagName] || 0;
        }
      }
    });

    return scoreMap;
  };

  const recommendCompanies = (companies, tags, answers) => {
    const scoreMap = getScoreMap(tags, answers);

    return companies
      .map((company) => {
        const key = `${company.c_id}_${company.c_name}_${company.c_kind}`;

        return {
          ...company,
          score: scoreMap[key] || 0,
        };
      })
      .filter((company) => company.score > 0)
      .sort((a, b) => b.score - a.score);
  };

  return (
    <div className="interior-list-section interior-recommend-section">    

      <div className="interior-company-grid interior-recommend-grid">
        {/* 결과 없을때 메세지 보여줌 - 0528 모하영 */}
        {list.length === 0 ?(
          <p>선택한 조건과 가까운 업체를 찾지 못했습니다.</p>
        ) : (
        list.slice(0, 3).map((item, idx) => (
          <div
            className="interior-company-card interior-recommend-card"
            key={idx}
            onClick={() => handleNext(item, answers)}
          >
            {item?.logo?.result?.[0] && (
            <img
              className="interior-company-image"
              src={
                item?.logo?.result.find((item) => item.img_tag === "LOGO")
                  ?.img_name
              }
              alt={`${item.c_name} 로고`}
            />
            )}
            <span className="interior-recommend-score">
              match {item.score}
            </span>
            <div className="interior-company-info">
              <strong className="interior-company-name">{item.c_name}</strong>
              <span>id: {item.c_id}</span>
              <span>kind: {item.c_kind}</span>
              <span>tel: {item.c_tel}</span>
              <span>addr: {item.c_addr}</span>
              <div className="interior-recommend-ai">
                <InteriorAnswerAi
                  answers={answers}
                  company={item}
                  tags={tags.filter(
                    (tag) =>
                      tag.c_id === item.c_id &&
                      tag.c_kind === item.c_kind &&
                      tag.c_name === item.c_name,
                  )}
                  score={item.score}
                />
              </div>
            </div>

          </div>
          ))
        )}
      </div>

      {list.length === 0 && (
        <div className="interior-recommend-empty">
          추천 조건에 맞는 업체가 없습니다.
        </div>
      )}
    </div>
  );
};

export default InteriorRecommend;
