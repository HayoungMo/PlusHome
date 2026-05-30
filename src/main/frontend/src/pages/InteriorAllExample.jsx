import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Chip, Pagination, Stack, Typography } from "@mui/material";
import InteriorService from "../service/interiorService";
import GetImgDir from "../resources/function/GetImgDir";
import DialogInside from "../components/DialogInside";
import "../css/InteriorAllExample.css";
import MultiFilterBar from "../components/MultiFilterBar";
import Loading from "../components/Loading";
import { formatInteriorAnswerValue } from "../resources/function/interiorAnswerFormat";

const PAGE_SIZE = 6;

const InteriorAllExample = () => {
  const navigate = useNavigate();
  const [example, setExample] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [pageNum, setPageNum] = useState(1);
  const [pageInfo, setPageInfo] = useState({
    totalCount: 0,
    totalPage: 0,
    pageSize: PAGE_SIZE,
  });
  const [selectedExample, setSelectedExample] = useState(null);
  const [exampleImageIndex, setExampleImageIndex] = useState(0);

  const tagOptions1 = [
    { value: "apt", title: "아파트" },
    { value: "villa", title: "빌라" },
    { value: "house", title: "단독주택" },
    { value: "officetel", title: "오피스텔" },
  ];

  const tagOptions2 = [
    { value: "kitchen", title: "키친" },
    { value: "bath", title: "욕실" },
    { value: "storage", title: "수납" },
    { value: "door", title: "중문/문" },
    { value: "window", title: "창문" },
    { value: "wallpaper", title: "벽지" },
    { value: "lighting", title: "조명" },
    { value: "tile", title: "타일" },
    { value: "floor", title: "마루" },
  ];

  const formatOptions = (options = []) =>
    options.map((option) => ({
      ...option,
      title: formatInteriorAnswerValue(option.value),
    }));

  const filterGroups = [
    {
      key: "housingType",
      label: "주거 유형",
      options: formatOptions(tagOptions1),
    },
    {
      key: "spaces",
      label: "공간",
      options: formatOptions(tagOptions2),
    },
  ];

  const handleFilterChange = (selectedFilters) => {
    setFilterType(selectedFilters.housingType || "");
    setFilterValue(selectedFilters.spaces || "");
    setPageNum(1);
  };

  const handleNext = (data) => {
    navigate("/interior/article", {
      state: { company: data },
    });
  };

  useEffect(() => {
    const fetchExample = async () => {
      const data = await InteriorService.fetchPagedInteriorExample({
        pageNum,
        pageSize: PAGE_SIZE,
        filterType,
        filterValue,
      });
      const companyList = Array.isArray(data?.list) ? data.list : [];

      const listWithImages = await Promise.all(
        companyList.map(async (item) => {
          const logo = await GetImgDir({
            kind: "I_EXAMPLE",
            returnType: "list",
            a: item.c_id,
            b: item.c_kind,
            c: item.c_name,
            d: item.ie_index,
            view: false,
          });

          return {
            ...item,
            logo,
          };
        }),
      );

      setExample(listWithImages);
      setPageInfo({
        totalCount: data?.totalCount || 0,
        totalPage: data?.totalPage || 0,
        pageSize: data?.pageSize || PAGE_SIZE,
      });
    };

    fetchExample();
  }, [pageNum, filterType, filterValue]);

  const handleReset = () => {
    setFilterType("");
    setFilterValue("");
    setPageNum(1);
  };

  const getExampleImages = (item) => {
    return (
      item?.logo?.result?.filter(
        (record) => record.dir_d === String(item.ie_index),
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

  const handleExampleOpen = (item) => {
    setSelectedExample(item);
    setExampleImageIndex(0);
  };

  const handleExampleClose = () => {
    setSelectedExample(null);
    setExampleImageIndex(0);
  };

  const handlePrevImage = () => {
    setExampleImageIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNextImage = () => {
    setExampleImageIndex((prev) => Math.min(prev + 1, selectedImages.length - 1));
  };

  return (
    <div className="interior-all-example-page">
      <div className="interior-all-example-toolbar">
        <MultiFilterBar
          groups={filterGroups}
          selectedValues={{
            housingType: filterType,
            spaces: filterValue,
          }}
          onChange={handleFilterChange}
          onReset={handleReset}
        />
      </div>
      {(filterType || filterValue) && (
        <>
          <h2 className="interior-all-example-title">예시 조회 결과</h2>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            총 {pageInfo.totalCount}개 예시
          </Typography>
        </>
      )}
      {Object.values(groupedExamples).map((group) => (
        <div
          className="interior-example-group"
          key={`${group.company.c_id}-${group.company.c_kind}-${group.company.c_name}`}
        >
          <button
            className="interior-example-company"
            type="button"
            onClick={() => handleNext(group.company)}
          >
            {group.company.c_name}
          </button>

          <div className="interior-example-grid">
            {group.examples.map((item) => {
              const thumbnail = getThumbnailImage(item);

              return (
                <button
                  className="interior-example-card"
                  key={`${item.c_id}-${item.ie_index}`}
                  type="button"
                  onClick={() => handleExampleOpen(item)}
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
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      <Chip
                        label={formatInteriorAnswerValue(
                          item?.ie_tag
                        )}
                        size="small"
                      />
                      <Chip
                        label={formatInteriorAnswerValue(item.ie_tag2)}
                        size="small"
                      />
                    </Stack>
                    <p>{item.ie_content}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {example.length === 0 && <Loading />}

      {pageInfo.totalPage > 1 && (
        <Pagination
          count={pageInfo.totalPage}
          page={pageNum}
          onChange={(e, page) => setPageNum(page)}
          color="primary"
          sx={{ display: "flex", justifyContent: "center", mt: 4 }}
          showFirstButton
          showLastButton
        />
      )}

      <DialogInside
        open={Boolean(selectedExample)}
        onClose={handleExampleClose}
        maxWidth="md"
        fullWidth
        contentClassName="all-example-dialog-content"
      >
        <div className="all-example-dialog">
          <div className="all-example-dialog-images">
            {selectedImages
              .filter((_, i) => i === exampleImageIndex)
              .map((record, i) => (
                <img
                  key={`${record.img_name}-${i}`}
                  src={record.img_name}
                  alt={`${selectedExample?.c_name} 예시`}
                />
              ))}
            {selectedImages.length > 1 && (
              <div className="all-example-slide-controls">
                <Button
                  variant="contained"
                  size="small"
                  onClick={handlePrevImage}
                  disabled={exampleImageIndex === 0}
                >
                  이전
                </Button>
                <span>
                  {exampleImageIndex + 1} / {selectedImages.length}
                </span>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleNextImage}
                  disabled={exampleImageIndex === selectedImages.length - 1}
                >
                  다음
                </Button>
              </div>
            )}
          </div>

          <div className="all-example-dialog-info">
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label={
                  formatInteriorAnswerValue(selectedExample?.ie_tag)
                }
              />
              <Chip
                label={formatInteriorAnswerValue(selectedExample?.ie_tag2)}
              />
            </Stack>
            <p>{selectedExample?.ie_content}</p>
          </div>
        </div>
      </DialogInside>
    </div>
  );
};

export default InteriorAllExample;
