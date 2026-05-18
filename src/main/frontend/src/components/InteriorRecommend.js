import React, { useEffect, useState } from "react";
import InteriorService from "../service/interiorService";
import { useNavigate } from "react-router-dom";
import GetImgDir from "../resources/function/GetImgDir";
import SelectMui from "./SelectMui";
import { Button } from "@mui/material";
import TextFieldMui from "./TextFieldMui";
import InteriorAnswerAi from "./InteriorAnswerAi";

const InteriorRecommend = ({ answers }) => {
  //알고리즘 적용시 리스트 컴포넌트
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [originList, setOriginList] = useState([]);
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState();
  const [filterType, setFilterType] = useState("");
  const [filterValue, setFilterValue] = useState("");

  const valueOptionMap = {
    housingType: [
      { value: "apt", title: "아파트" },
      { value: "villa", title: "빌라" },
      { value: "house", title: "주택" },
      { value: "officetel", title: "오피스텔" },
    ],

    purpose: [
      { value: "purchase", title: "집 구매 후" },
      { value: "existing", title: "기존 집 리모델링" },
      { value: "new_house", title: "새 집 입주" },
    ],

    spaces: [
      { value: "livingroom", title: "거실" },
      { value: "kitchen", title: "주방" },
      { value: "storage", title: "수납" },
      { value: "door", title: "중문/문" },
      { value: "window", title: "창문" },
      { value: "wallpaper", title: "벽지" },
      { value: "lighting", title: "조명" },
      { value: "tile", title: "타일" },
      { value: "floor", title: "마루" },
    ],

    budget: [
      { value: "1000", title: "1000만원 이하" },
      { value: "2000", title: "1000~2000만원" },
      { value: "3000", title: "2000~3000만원" },
      { value: "5000", title: "3000~5000만원" },
      { value: "10000", title: "5000만원 이상" },
    ],

    areaSize: [
      { value: "10_20", title: "10~20평" },
      { value: "30", title: "30평대" },
      { value: "40", title: "40평대" },
      { value: "50", title: "50평 이상" },
    ],
  };

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
      setOriginList(resultWithImages);
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

  const handleSearchFilter = () => {
    let result = [...originList];

    // 검색
    if (search && search.trim() !== "") {
      result = result.filter(
        (item) =>
          item.c_name?.includes(search) ||
          item.c_addr?.includes(search) ||
          item.c_tel?.includes(search),
      );
    }

    // 필터
    if (filterType && filterValue) {
      result = result.filter((company) => {
        return tags.some(
          (tag) =>
            tag.c_id === company.c_id &&
            tag.c_kind === company.c_kind &&
            tag.c_name === company.c_name &&
            tag.i_tag === filterType &&
            tag.i_text === filterValue,
        );
      });
    }

    setList(result);
  };

  const handleReset = () => {
    setSearch("");
    setFilterType("");
    setFilterValue("");
    setList(originList);
  };

  return (
    <div className="interior-list-section interior-recommend-section">
      <div className="interior-list-toolbar">
        <h3>결과</h3>
        <TextFieldMui
          name="search"
          label="검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearchFilter();
            }
          }}
        />
        <Button onClick={() => handleSearchFilter()}>검색</Button>

        <SelectMui
          label="필터 종류"
          name="filterType"
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setFilterValue("");
          }}
          option={[
            { value: "housingType", title: "주거 형태" },
            { value: "areaSize", title: "면적" },
            { value: "purpose", title: "목적" },
            { value: "spaces", title: "공간" },
            { value: "budget", title: "예산" },
          ]}
        />
        {filterType && (
          <SelectMui
            label="값"
            name="filterValue"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            option={valueOptionMap[filterType] || []}
          />
        )}
        <Button onClick={() => handleSearchFilter()}>필터 적용</Button>

        <Button onClick={handleReset}>초기화</Button>
      </div>

      <div className="interior-company-grid interior-recommend-grid">
        {list.slice(0, 3).map((item, idx) => (
          <div
            className="interior-company-card interior-recommend-card"
            key={idx}
            onClick={() => handleNext(item, answers)}
          >
            {item?.logo?.result?.[0] && (
            <img
              className="interior-company-image"
              src={
                item?.logo?.result.find((item) => item.img_tag === "PROFILE")
                  ?.img_name
              }
              alt={`${item.c_name} 로고`}
            />
            )}
            <div className="interior-company-info">
              <strong className="interior-company-name">{item.c_name}</strong>
              <span>id: {item.c_id}</span>
              <span>kind: {item.c_kind}</span>
              <span>tel: {item.c_tel}</span>
              <span>addr: {item.c_addr}</span>
              <div className="interior-recommend-ai">
                {/* <InteriorAnswerAi
                  answers={answers}
                  company={item}
                  tags={tags.filter(
                    (tag) =>
                      tag.c_id === item.c_id &&
                      tag.c_kind === item.c_kind &&
                      tag.c_name === item.c_name,
                  )}
                  score={item.score}
                /> */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InteriorRecommend;
