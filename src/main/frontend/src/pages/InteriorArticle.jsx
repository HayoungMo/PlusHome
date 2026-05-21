import { useEffect, useState } from "react";
import "../css/InteriorArticle.css";

import InteriorService from "../service/interiorService";
import { useLocation, useNavigate } from "react-router-dom";

import InteriorBooking from "../components/InteriorBooking";
import InteriorModelViewer from "../components/InteriorModelViewer";
import InteriorReviewList from "../components/InteriorReviewList";

import GetImgDir from "../resources/function/GetImgDir";

import Maps from "../maps/Maps";

import { Button, Chip, Stack } from "@mui/material";
import InteriorArticleAI from "../components/InteriorArticleAI";
import DialogInside from "../components/DialogInside";

function InteriorArticle() {
  const id = localStorage.getItem("id");

  const location = useLocation();
  const navigate = useNavigate();

  const answers = location.state?.answers || null;

  const [company, setCompany] = useState(location.state.company);

  const [article, setArticle] = useState([]);
  const [example, setExample] = useState([]);

  const [selectedExample, setSelectedExample] = useState(null);

  const [bookingPossible, setBookingPossible] = useState(false);
  const [examplePossible, setExamplePossible] = useState(false);

  const wishKey = `wishList_${id}`;

  const tagNameMap = {
    housingType: "주거 유형",
    areaSize: "면적",
    location: "지역",
    spaces: "희망 공간",
    budget: "예산",
    schedule: "일정",
    houseCondition: "주택 상태",
    purpose: "목적",
  };

  const groupInteriorTags = (list) => {
    const result = {};

    list.forEach((item) => {
      if (!result[item.i_tag]) {
        result[item.i_tag] = [];
      }

      result[item.i_tag].push(item.i_text);
    });

    return result;
  };

  const groupInteriorReviewTags = (list) => {
    const result = {};

    list.forEach((item) => {
      if (!result[item.ie_tag]) {
        result[item.ie_tag] = [];
      }

      result[item.ie_tag].push(item.ie_tag2 + "__" + item.ie_content);
    });

    return result;
  };

  const groupedTags = groupInteriorTags(article);
  const groupedReviewTags = groupInteriorReviewTags(example);

  const getWishList = () => {
    return JSON.parse(localStorage.getItem(wishKey)) || [];
  };

  const isWished = (company) => {
    const wishList = getWishList();

    return wishList.some(
      (item) =>
        item.c_id === company.c_id &&
        item.c_kind === company.c_kind &&
        item.c_name === company.c_name,
    );
  };

  const [like, setLike] = useState(isWished(company));

  const toggleWish = () => {
    const wishList = getWishList();

    const exists = wishList.some(
      (item) =>
        item.c_id === company.c_id &&
        item.c_kind === company.c_kind &&
        item.c_name === company.c_name,
    );

    const newWishList = exists
      ? wishList.filter(
          (item) =>
            !(
              item.c_id === company.c_id &&
              item.c_kind === company.c_kind &&
              item.c_name === company.c_name
            ),
        )
      : [...wishList, company];

    localStorage.setItem(wishKey, JSON.stringify(newWishList));

    setLike(!exists);
  };

  const handleNext = () => {
    if (!localStorage.getItem("id") || !localStorage.getItem("token")) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }

    navigate("/interior/question", {
      state: {
        company: company,
      },
    });
  };

  const handleBookingToggle = () => {
    if (!localStorage.getItem("id") || !localStorage.getItem("token")) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }

    setBookingPossible(!bookingPossible);
  };

  useEffect(() => {
    const fetchCompany = async () => {
      const data = await InteriorService.fetchCompany(company);
      const logo = await GetImgDir({
        kind: "LOGO",
        returnType: "list",
        a: data.c_id,
        b: data.c_kind,
        c: data.c_name,
        d: "LOGO",
        view: false,
      });
      setCompany(
        {
          ...data,
          logo,
        } || {},
      );
    };

    const fetchArticle = async () => {
      const data = await InteriorService.fetchArticle(company);

      setArticle(Array.isArray(data) ? data : []);
    };

    const fetchExample = async () => {
      const data = await InteriorService.fetchExample(company);

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
    };

    fetchCompany();
    fetchArticle();
    fetchExample();
  }, []);

  const handleFilter = (tag, value) => {
    navigate("/interior/list", {
      state: { tag: tag, value: value },
    });
  };

  return (
    <div className="article-container">
      <div className="article-top">
        <div className="info-card">
          <div className="company-title">{company.c_name}</div>

          <div className="company-address">
            {company.c_addr?.split("__")[0]}
          </div>

          {company?.logo?.result?.map((item, idx) => (
            <div key={idx}>
              {item.img_tag === "PROFILE" && (
                <img
                  className="profile-image"
                  src={item.img_name}
                  alt={`${company.c_name} 로고`}
                />
              )}
            </div>
          ))}

          <div className="action-buttons">
            <Button variant="outlined" onClick={toggleWish}>
              {like ? "찜 취소" : "찜하기"}
            </Button>

            {answers ? (
              <Button
                variant="contained"
                color="warning"
                onClick={handleBookingToggle}
              >
                {bookingPossible ? "상담 닫기" : "상담 신청"}
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext}>
                상담 시작하기
              </Button>
            )}
          </div>

          {bookingPossible && (
            <div>
              <DialogInside
                open={bookingPossible}
                onClose={() => setBookingPossible(false)}
              >
                <InteriorBooking
                  company={company}
                  answers={answers}
                  setBookingPossible={setBookingPossible}
                />
              </DialogInside>
            </div>
          )}
        </div>

        <div className="map-card">
          <Maps c_addr={company.c_addr?.split("__")[0]} />
        </div>
      </div>

      <div className="tag-card">
        <div className="section-title">업체 전문 분야</div>

        {Object.entries(groupedTags).map(([tag, values]) => (
          <div className="tag-group" key={tag}>
            <div className="tag-group-title">{tagNameMap[tag] || tag}</div>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {values.map((value) => (
                <Chip
                  key={value}
                  label={value}
                  onClick={() => handleFilter(tag, value)}
                />
              ))}
            </Stack>
          </div>
        ))}
      </div>

      <div className="example-card">
        <div className="section-title">시공 사례</div>

        <div className="example-grid">
          {example.map((item, idx) => (
            <div
              key={idx}
              className="example-item"
              onClick={() => {
                setSelectedExample(item)
                setExamplePossible(true)}
              }
            >
              {item?.logo?.result
                ?.filter(
                  (record) => record.dir_d === item.ie_tag + "_" + item.ie_tag2,
                )
                ?.filter((record) => record.img_tag==="THUMBNAIL")
                ?.map((record, i) => (
                  <img
                    key={i}
                    className="example-img"
                    src={record.img_name}
                    alt={`${item.c_name} 예시`}
                  />
                ))}

              <div className="example-content">
                <Stack direction="row" spacing={1} mb={1}>
                  <Chip label={item?.ie_tag} />
                  <Chip label={item?.ie_tag2} />
                </Stack>

                <div>{item?.ie_content}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
        <DialogInside
          open={examplePossible}
          onClose={() => setExamplePossible(false)}
          maxWidth="md"
          fullWidth
          contentClassName="example-dialog-content"
        >
          <div className="example-item example-dialog-item">
            <div className="example-dialog-media">
              {selectedExample?.logo?.result
                ?.filter(
                  (record) =>
                    record.dir_d ===
                    selectedExample.ie_tag + "_" + selectedExample.ie_tag2,
                )
                ?.map((record, i) => (
                  <img
                    key={i}
                    className="example-img"
                    src={record.img_name}
                    alt={`${selectedExample.c_name} 예시`}
                  />
                ))}
            </div>

            <div className="example-content">
              <Stack direction="row" spacing={1} mb={1}>
                <Chip label={selectedExample?.ie_tag} />
                <Chip label={selectedExample?.ie_tag2} />
              </Stack>

              <div>{selectedExample?.ie_content}</div>
            </div>
          </div>
        </DialogInside>
      <div className="example-card">
        <div className="section-title">시공 3D 모델</div>
        <div style={{ display: "flex" }}>
          {company?.logo?.result?.map(
            (item) =>
              item.img_tag === "MODEL" && (
                <InteriorModelViewer src={item.img_name} />
              ),
          )}
        </div>
      </div>

      <div className="example-card">
        <div className="section-title">리뷰 및 후기</div>

        <InteriorReviewList company={company} />
      </div>

      <div className="example-card">
        <div className="section-title">ai 정보 요약</div>
        {/* <InteriorArticleAI
          groupedTags={groupedTags}
          groupedReviewTags={groupedReviewTags}
        /> */}
      </div>
    </div>
  );
}

export default InteriorArticle;
