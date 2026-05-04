import React, { useEffect, useState } from "react";
import InteriorService from "../service/interiorService";
import { useNavigate } from "react-router-dom";
import GetImgDir from "../resources/function/GetImgDir";

const InteriorRecommend = ({answers}) => {
  //알고리즘 적용시 리스트 컴포넌트
  const navigate = useNavigate();
  const [list, setList] = useState([]);

  const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const companies = await InteriorService.fetchList();
      const tags = await InteriorService.fetchArticleList();

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
            d: "LOGO",
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
    <div>
      <div>
        <h3>추천 받은 결과</h3>
        {list.map((item, idx) => (
          <div key={idx} onClick={() => handleNext(item, answers)}>
            {item.logo.result[0] && (
              <img
                src={item.logo.result[0].img_name}
                alt={`${item.c_name} 로고`}
                style={{ width: "100px", height: "100px", objectFit: "cover" }}
              />
            )}
            id: {item.c_id}
            name: {item.c_name}
            kind: {item.c_kind}
            tel: {item.c_tel}
            addr: {item.c_addr}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InteriorRecommend;
