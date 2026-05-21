import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Chip, Stack } from "@mui/material";
import InteriorService from "../service/interiorService";
import GetImgDir from "../resources/function/GetImgDir";
import SelectMui from "../components/SelectMui";
import DialogInside from "../components/DialogInside";
import "../css/InteriorAllExample.css";

const InteriorAllExample = () => {
  const navigate = useNavigate();
  const [example, setExample] = useState([]);
  const [originList, setOriginList] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [tags, setTags] = useState([]);
  const [selectedExample, setSelectedExample] = useState(null);

  const handleNext = (data) => {
    navigate("/interior/article", {
      state: { company: data },
    });
  };

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
    let result = [...originList];

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
  }, [filterType, filterValue, originList, tags]);

  const handleReset = () => {
    setFilterType("");
    setFilterValue("");
    setExample(originList);
  };

  const getExampleImages = (item) => {
    return (
      item?.logo?.result?.filter(
        (record) => record.dir_d === item.ie_tag + "_" + item.ie_tag2,
      ) || []
    );
  };

  const getThumbnailImage = (item) => {
    const images = getExampleImages(item);
    return images.find((record) => record.img_tag === "THUMBNAIL") || images[0];
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

  const selectedImages = selectedExample ? getExampleImages(selectedExample) : [];

  return (
    <div className="interior-all-example-page">
      <div className="interior-all-example-toolbar">
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
      </div>

      <h2 className="interior-all-example-title">예시 조회 결과</h2>

      {Object.values(groupedExamples).map((group, idx) => (
        <div className="interior-example-group" key={idx}>
          <button
            className="interior-example-company"
            type="button"
            onClick={() => handleNext(group.company)}
          >
            {group.company.c_name}
          </button>

          <div className="interior-example-grid">
            {group.examples.map((item, exampleIdx) => {
              const thumbnail = getThumbnailImage(item);

              return (
                <button
                  className="interior-example-card"
                  key={exampleIdx}
                  type="button"
                  onClick={() => setSelectedExample(item)}
                >
                  <div className="interior-example-thumb">
                    {thumbnail ? (
                      <img
                        src={thumbnail.img_name}
                        alt={`${item.c_name} 예시`}
                      />
                    ) : (
                      <span>이미지 없음</span>
                    )}
                  </div>

                  <div className="interior-example-info">
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip label={item.ie_tag} size="small" />
                      <Chip label={item.ie_tag2} size="small" />
                    </Stack>
                    <p>{item.ie_content}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <DialogInside
        open={Boolean(selectedExample)}
        onClose={() => setSelectedExample(null)}
        maxWidth="md"
        fullWidth
        contentClassName="all-example-dialog-content"
      >
        <div className="all-example-dialog">
          <div className="all-example-dialog-images">
            {selectedImages.map((record, i) => (
              <img
                key={`${record.img_name}-${i}`}
                src={record.img_name}
                alt={`${selectedExample?.c_name} 예시`}
              />
            ))}
          </div>

          <div className="all-example-dialog-info">
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={selectedExample?.ie_tag} />
              <Chip label={selectedExample?.ie_tag2} />
            </Stack>
            <p>{selectedExample?.ie_content}</p>
          </div>
        </div>
      </DialogInside>
    </div>
  );
};

export default InteriorAllExample;
