import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Pagination, Typography } from "@mui/material";
import InteriorService from "../service/interiorService";
import GetImgDlr from "../resources/function/GetImgDir";
import TextFieldMui from "./TextFieldMui";
import FilterBar from "./FilterBar";

const PAGE_SIZE = 9;

const InteriorList = ({ tag, value }) => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [originList, setOriginList] = useState([]);
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState("");
  const [filterValue, setFilterValue] = useState(() => {
    if (tag && value) {
      return { [tag]: value };
    }

    return value && typeof value === "object" ? value : {};
  });
  const [pageNum, setPageNum] = useState(1);
  const [pageInfo, setPageInfo] = useState({
    totalCount: 0,
    totalPage: 0,
    pageSize: PAGE_SIZE,
  });

  const valueOptionMap = {
    housingType: [
      { value: "apt", title: "아파트" },
      { value: "villa", title: "빌라" },
      { value: "house", title: "주택" },
      { value: "officetel", title: "오피스텔" },
    ],
    purpose: [
      { value: "purchase", title: "집 구매 전" },
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
    location: [],
  };

  const filterList = [
    {
      key: "housingType",
      title: "주거 형태",
      type: "multi",
      options: valueOptionMap.housingType || [],
    },
    {
      key: "areaSize",
      title: "면적",
      type: "single",
      options: valueOptionMap.areaSize || [],
    },
    {
      key: "purpose",
      title: "목적",
      type: "single",
      options: valueOptionMap.purpose || [],
    },
    {
      key: "spaces",
      title: "공간",
      type: "multi",
      options: valueOptionMap.spaces || [],
    },
    {
      key: "budget",
      title: "예산",
      type: "single",
      options: valueOptionMap.budget || [],
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

  const getFilteredCompanies = useCallback((companies, tagList, keyword, filters) => {
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
      const tagMap = tagList.reduce((acc, item) => {
        const key = getCompanyKey(item);
        acc[key] = acc[key] || [];
        acc[key].push(item);
        return acc;
      }, {});

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
            (tag) =>
              tag.i_tag === filterKey && activeValues.includes(tag.i_text),
          );
        });
      });
    }

    return result;
  }, [getCompanyKey, hasSelectedFilters]);

  useEffect(() => {
    const fetchData = async () => {
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
            d: "LOGO",
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
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filteredCompanies = getFilteredCompanies(
      originList,
      tags,
      search,
      filterValue,
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
  }, [originList, tags, search, filterValue, pageNum, getFilteredCompanies]);

  const handleReset = () => {
    setSearch("");
    setFilterValue({});
    setPageNum(1);
  };

  return (
    <div className="interior-list-section">
      <div className="interior-list-toolbar">
        <h3>결과</h3>

        <FilterBar
          filterList={filterList}
          value={filterValue}
          onChange={(newFilter) => {
            setFilterValue(newFilter);
            setPageNum(1);
          }}
        />

        <TextFieldMui
          name="search"
          label="검색"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPageNum(1);
          }}
        />

        <Button onClick={handleReset}>초기화</Button>
      </div>

      <Typography color="text.secondary" sx={{ mb: 2 }}>
        총 {pageInfo.totalCount}개 업체
      </Typography>

      <div className="interior-company-grid">
        {list.map((item) => (
          <div
            className="interior-company-card"
            key={`${item.c_id}-${item.c_kind}-${item.c_name}`}
            onClick={() => handleNext(item)}
          >
            {item?.logo?.result?.[0] && (
              <img
                className="interior-company-image"
                src={
                  item.logo.result.find((image) => image.img_tag === "PROFILE")
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
        ))}
      </div>

      {list.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 3 }}>
          검색 결과가 없습니다.
        </Typography>
      )}

      {pageInfo.totalPage > 1 && (
        <Pagination
          count={pageInfo.totalPage}
          page={pageNum}
          onChange={(e, page) => setPageNum(page)}
          color="primary"
          sx={{ display: "flex", justifyContent: "center", mt: 4 }}
        />
      )}
    </div>
  );
};

export default InteriorList;
