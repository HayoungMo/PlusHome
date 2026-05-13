import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import InteriorService from "../service/interiorService";
import GetImgDir from "../resources/function/GetImgDir";
import SelectMui from "../components/SelectMui";
import { Button } from "@mui/material";

const InteriorAllExample = () => {
  const navigate = useNavigate();
  const [example, setExample] = useState([]);
    const [originList, setOriginList] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [filterValue, setFilterValue] = useState("");
    const [tags, setTags] = useState([]);
  const handleNext = (data) => {
    navigate("/interior/article", {
      state: { company: data },
    });
  };
  const [selectedImg, setSelectedImg] = useState(null);
  useEffect(() => {
    const fetchExample = async () => {
      const data = await InteriorService.fetchAllInteriorExample();
      setTags(Array.isArray(data) ? data : []);
      const companyList = Array.isArray(data) ? data : [];
      const listWithImages = await Promise.all(
        companyList.map(async (item) => {
          const logo = await GetImgDir({
            kind: "I_EXAMPLE",
            returnType: "list",
            a: item.c_id,
            b: item.c_kind,
            c: item.c_name,
            d: item.ie_tag + "_" + item.ie_tag2,
            view: false,
          });
          if (!logo?.result?.length) {
            return item;
          }
          return {
            ...item,
            logo,
          };
        }),
      );

      setExample(listWithImages);
      setOriginList(listWithImages);
    };
    fetchExample();
  }, []);

    const tagOptions1 = [
      { value: "apt", title: "아파트" },
      { value: "villa", title: "빌라" },
      { value: "house", title: "단독주택" },
      { value: "officetel", title: "오피스텔" },
    ];
    const tagOptions2 = [
      { value: "kitchen", title: "키친" },
      { value: "bath", title: "바스" },
      { value: "storage", title: "수납" },
      { value: "door", title: "중문/문" },
      { value: "window", title: "창문" },
      { value: "wallpaper", title: "벽지" },
      { value: "lighting", title: "조명" },
      { value: "tile", title: "타일" },
      { value: "floor", title: "마루" },
    ];
    useEffect(() => {
      const handleFilter = () => {
        let result = [...originList];

        // 필터
        if (filterType && filterValue) {
          result = result.filter((company) => {
            return tags.some(
              (tag) =>
                tag.c_id === company.c_id &&
                tag.c_kind === company.c_kind &&
                tag.c_name === company.c_name &&
                tag.ie_tag === filterType &&
                tag.ie_tag2 === filterValue,
            );
          });
        }

        setExample(result);
      };
      handleFilter();
    },[filterValue]);
    
      const handleReset = () => {
        setFilterType("");
        setFilterValue("");
        setExample(originList);
      };
  return (
    <div>
      <SelectMui
        label="tag1"
        name="filterType"
        value={filterType}
        onChange={(e) => {
          setFilterType(e.target.value);
          setFilterValue("");
        }}
        option={tagOptions1}
      />
      {filterType && (
        <SelectMui
          label="tag2"
          name="filterValue"
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          option={tagOptions2}
        />
      )}
              <Button onClick={handleReset}>초기화</Button>
      예시 조회 결과
      {example.map((item, idx) => (
        <div key={idx}>
          <div onClick={() => handleNext(item)}>
            name: {item?.c_name}
            tag: {item?.ie_tag}
            tag2: {item?.ie_tag2}
            content: {item?.ie_content}
          </div>
          {/* 이미지 출력 */}
          {item?.logo?.result
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
        </div>
      ))}
    </div>
  );
};

export default InteriorAllExample;
