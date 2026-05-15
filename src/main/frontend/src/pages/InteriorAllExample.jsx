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
  }, [filterValue]);

  const handleReset = () => {
    setFilterType("");
    setFilterValue("");
    setExample(originList);
  };

  const groupedExamples = example.reduce((acc, item) => {
    const key = `${item.c_id}_${item.c_kind}_${item.c_name}`;

    if (!acc[key]) {
      acc[key] = {
        company: {
          c_id: item.c_id,
          c_kind: item.c_kind,
          c_name: item.c_name,
        },
        examples: [],
      };
    }

    acc[key].examples.push(item);

    return acc;
  }, {});
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
      {Object.values(groupedExamples).map((group, idx) => (
        <div
          key={idx}
          style={{
            marginBottom: "50px",
            borderBottom: "1px solid #ddd",
            paddingBottom: "30px",
          }}
        >
          {/* 업체 정보 */}
          <div
            style={{
              marginBottom: "20px",
              cursor: "pointer",
            }}
            onClick={() => handleNext(group.company)}
          >
            <h2>{group.company.c_name}</h2>
          </div>

          {/* 같은 업체의 시공 예시 */}
          <div
            style={{
              display: "flex",
            }}
          >
            {group.examples.map((item, exampleIdx) => (
              <div
                key={exampleIdx}
                style={{
                  width: "250px",
                  border: "1px solid #ccc",
                  borderRadius: "12px",
                  overflow: "hidden",
                  padding: "10px",
                }}
              >
                {/* 이미지 */}
                {item?.logo?.result
                  ?.filter(
                    (record) =>
                      record.dir_d === item.ie_tag + "_" + item.ie_tag2,
                  )
                  ?.map((record, i) => (
                    <img
                      key={i}
                      src={record.img_name}
                      alt={`${item.c_name} 예시`}
                      onClick={() => setSelectedImg(record.img_name)}
                    />
                  ))}

                {/* 설명 */}
                <div>
                  <p>{item.ie_tag}</p>
                  <p>{item.ie_tag2}</p>
                  <p>{item.ie_content}</p>
                </div>
              </div>
            ))}
          </div>
          
        </div>
      ))}
      {/* 확대 이미지 */}
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
              maxWidth: "95%",
              maxHeight: "95%",
              objectFit: "contain",
            }}
          />
        </div>    
)}  
      </div>
      
  );
};

export default InteriorAllExample;
