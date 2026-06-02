import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Pagination, Typography } from "@mui/material";
import InteriorService from "../service/interiorService";
import GetImgDlr from "../resources/function/GetImgDir";
import TextFieldMui from "./TextFieldMui";
import FilterBar from "./FilterBar";
import {
  formatInteriorAnswerLabel,
  formatInteriorAnswerValue,
} from "../resources/function/interiorAnswerFormat";
import SkeletonMui from "./SkeletonMui";

const PAGE_SIZE = 9;
const MULTI_FILTER_KEYS = ["housingType", "spaces"];

const getInitialFilterValue = (tag, value) => {
  if (tag && value) {
    return {
      [tag]: MULTI_FILTER_KEYS.includes(tag) ? [value] : value,
    };
  }

  return value && typeof value === "object" ? value : {};
};

const InteriorList = ({ tag, value }) => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [originList, setOriginList] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterOn, setFilterOn] = useState(false);
  const [filterValue, setFilterValue] = useState(() =>
    getInitialFilterValue(tag, value),
  );
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedFilterValue, setAppliedFilterValue] = useState(() =>
    getInitialFilterValue(tag, value),
  );
  const [pageNum, setPageNum] = useState(1);
  const [pageInfo, setPageInfo] = useState({
    totalCount: 0,
    totalPage: 0,
    pageSize: PAGE_SIZE,
  });

  const valueOptionMap = {
    housingType: ["apt", "villa", "house", "officetel"],
    purpose: ["purchase", "existing", "new_house"],
    spaces: [
      "livingroom",
      "kitchen",
      "storage",
      "door",
      "window",
      "wallpaper",
      "lighting",
      "tile",
      "floor",
    ],
    budget: ["1000", "2000", "3000", "5000", "10000"],
    areaSize: ["10_20", "30", "40", "50"],
  };

  const formatOptions = (options = []) =>
    options.map((option) => ({
      value: option,
      title: formatInteriorAnswerValue(option),
    }));

  const filterList = [
    {
      key: "housingType",
      title: formatInteriorAnswerLabel("housingType"),
      type: "multi",
      options: formatOptions(valueOptionMap.housingType),
    },
    {
      key: "areaSize",
      title: formatInteriorAnswerLabel("areaSize"),
      type: "single",
      options: formatOptions(valueOptionMap.areaSize),
    },
    {
      key: "purpose",
      title: formatInteriorAnswerLabel("purpose"),
      type: "single",
      options: formatOptions(valueOptionMap.purpose),
    },
    {
      key: "spaces",
      title: formatInteriorAnswerLabel("spaces"),
      type: "multi",
      options: formatOptions(valueOptionMap.spaces),
    },
    {
      key: "budget",
      title: formatInteriorAnswerLabel("budget"),
      type: "single",
      options: formatOptions(valueOptionMap.budget),
    },
  ];

  const handleNext = (data) => {
    navigate("/interior/article", {
      state: { company: data },
    });
  };

  const getCompanyKey = useCallback((company) => {
    return `${company.c_id}_${company.c_kind}_${company.c_name}`;
  }, []);

  const hasSelectedFilters = useCallback((filters) => {
    return Object.values(filters || {}).some((selectedValue) => {
      return Array.isArray(selectedValue)
        ? selectedValue.length > 0
        : Boolean(selectedValue);
    });
  }, []);

  const tagMap = useMemo(() => {
    return tags.reduce((acc, item) => {
      const key = getCompanyKey(item);
      acc[key] = acc[key] || [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [tags, getCompanyKey]);

  const getFilteredCompanies = useCallback(
    (companies, keyword, filters) => {
      let result = [...companies];
      const searchText = keyword?.trim();

      if (searchText) {
        result = result.filter(
          (item) =>
            item.c_name?.includes(searchText) ||
            item.c_addr?.includes(searchText) ||
            item.c_tel?.includes(searchText),
        );
      }

      if (hasSelectedFilters(filters)) {
        result = result.filter((company) => {
          const companyTags = tagMap[getCompanyKey(company)] || [];

          return Object.entries(filters).every(([filterKey, selectedValue]) => {
            const selectedValues = Array.isArray(selectedValue)
              ? selectedValue
              : [selectedValue];

            const activeValues = selectedValues.filter(Boolean);

            if (activeValues.length === 0) {
              return true;
            }

            return companyTags.some(
              (tagItem) =>
                tagItem.i_tag === filterKey &&
                activeValues.includes(tagItem.i_text),
            );
          });
        });
      }

      return result;
    },
    [getCompanyKey, hasSelectedFilters, tagMap],
  );

  useEffect(() => {
    const nextFilterValue = getInitialFilterValue(tag, value);
    setFilterValue(nextFilterValue);
    setAppliedFilterValue(nextFilterValue);
    setPageNum(1);
  }, [tag, value]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const [companies, tagList] = await Promise.all([
          InteriorService.fetchList(),
          InteriorService.fetchArticleList(),
        ]);

        const companyList = Array.isArray(companies) ? companies : [];

        const listWithImages = await Promise.all(
          companyList.map(async (item) => {
            const logo = await GetImgDlr({
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

        setOriginList(listWithImages);
        setTags(Array.isArray(tagList) ? tagList : []);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filteredCompanies = getFilteredCompanies(
      originList,
      appliedSearch,
      appliedFilterValue,
    );

    const totalPage = Math.ceil(filteredCompanies.length / PAGE_SIZE);
    const nextPageNum = Math.min(pageNum, totalPage || 1);

    if (nextPageNum !== pageNum) {
      setPageNum(nextPageNum);
      return;
    }

    const start = (nextPageNum - 1) * PAGE_SIZE;

    setList(filteredCompanies.slice(start, start + PAGE_SIZE));
    setPageInfo({
      totalCount: filteredCompanies.length,
      totalPage,
      pageSize: PAGE_SIZE,
    });
  }, [
    originList,
    appliedSearch,
    appliedFilterValue,
    pageNum,
    getFilteredCompanies,
  ]);

  const handleSearchApply = () => {
    setAppliedSearch(search);
    setAppliedFilterValue(filterValue);
    setPageNum(1);
  };

  const handleFilterApply = () => {
    setAppliedFilterValue(filterValue);
    setPageNum(1);
  };

  return (
    <div className="interior-list-section interior-company-list-section">
      <div className="interior-list-toolbar">
        <div className="interior-search-group">
          <TextFieldMui
            name="search"
            label="검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearchApply();
              }
            }}
          />

          <Button variant="contained" onClick={handleSearchApply}>
            검색
          </Button>
        </div>

        <div className="interior-filter-button-group">
          <Button
            variant="outlined"
            onClick={() => setFilterOn((prev) => !prev)}
          >
            {filterOn ? "필터 닫기" : "필터"}
          </Button>

          <Button variant="contained" onClick={handleFilterApply}>
            적용
          </Button>
        </div>

        {filterOn && (

            <FilterBar
              filterList={filterList}
              value={filterValue}
              onChange={setFilterValue}
/>
        )}
      </div>

      <Typography
        className="interior-company-list-count"
        color="text.secondary"
      >
        총 {pageInfo.totalCount}개 업체
      </Typography>

      <div className="interior-company-grid interior-company-list-grid">
        {loading ? (
          <SkeletonMui
            variant="interiorCompanyCard"
            count={PAGE_SIZE}
            cardClassName="interior-company-list-card"
          />
        ) : (
          list.map((item) => (
            <div
              className="interior-company-card interior-company-list-card"
              key={`${item.c_id}-${item.c_kind}-${item.c_name}`}
              onClick={() => handleNext(item)}
            >
              {item?.logo?.result?.[0] && (
                <img
                  className="interior-company-image"
                  src={
                    item.logo.result.find((image) => image.img_tag === "LOGO")
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
              </div>
            </div>
          ))
        )}
      </div>

      {!loading && list.length === 0 && (
        <Typography className="interior-company-list-empty">
          조건에 맞는 업체가 없습니다.
        </Typography>
      )}

      {!loading && pageInfo.totalPage > 1 && (
        <Pagination
          count={pageInfo.totalPage}
          page={pageNum}
          onChange={(e, page) => setPageNum(page)}
          color="primary"
          className="interior-company-list-pagination"
          showFirstButton
          showLastButton
        />
      )}
    </div>
  );
};

export default InteriorList;
