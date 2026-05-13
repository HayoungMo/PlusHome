import React, { useEffect, useState } from "react";
import InteriorService from "../service/interiorService";
import { useNavigate } from "react-router-dom";
import GetImgDlr from "../resources/function/GetImgDir";
import TextFieldMui from "./TextFieldMui";
import SelectMui from "./SelectMui";
import { Button } from "@mui/material";

const InteriorList = () => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [tags, setTags] = useState([]);
  const [originList, setOriginList] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterValue, setFilterValue] = useState("");

  const handleNext = (data) => {
    navigate("/interior/article", {
      state: { company: data },
    });
  };
  const valueOptionMap = {
    housingType: [
      { value: "apt", title: "아파트" },
      { value: "villa", title: "빌라" },
      { value: "house", title: "주택" },
      { value: "officetel", title: "오피스텔" },
    ],

    purpose: [
      { value: "신혼집", title: "신혼집" },
      { value: "반려동물", title: "반려동물" },
    ],

    spaces: [
      { value: "livingroom", title: "거실" },
      { value: "kitchen", title: "주방" },
    ],

    budget: [
      { value: "100만원 이하", title: "100만원 이하" },
      { value: "300만원 이하", title: "300만원 이하" },
      { value: "500만원 이하", title: "500만원 이하" },
    ],
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await InteriorService.fetchList();
      const tagData = await InteriorService.fetchArticleList();

      setTags(Array.isArray(tagData) ? tagData : []);

      const companyList = Array.isArray(data) ? data : [];
      const listWithImages = await Promise.all(
        companyList.map(async (item) => {
          console.log("아이템" + item);
          const logo = await GetImgDlr({
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
      console.log(listWithImages);
      setList(listWithImages);
      setOriginList(listWithImages);
    };

    fetchData();
  }, []);

  useEffect(() => {
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
    handleSearchFilter();
  },[search, filterValue]);

  const handleReset = () => {
    setSearch("");
    setFilterType("");
    setFilterValue("");
    setList(originList);
  };
  return (
    <div>
      <div>
        <h3>결과</h3>

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

        <Button onClick={handleReset}>초기화</Button>

        {list.map((item, idx) => (
          <div key={idx} onClick={() => handleNext(item)}>
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
      <TextFieldMui
        name="search"
        label="검색"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
};

export default InteriorList;
