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

function InteriorArticle() {
  const id = localStorage.getItem("id");

  const location = useLocation();
  const navigate = useNavigate();

  const answers = location.state?.answers || null;

  const [company, setCompany] = useState(location.state.company);

  const [article, setArticle] = useState([]);
  const [example, setExample] = useState([]);

  const [selectedImg, setSelectedImg] = useState(null);

  const [bookingPossible, setBookingPossible] = useState(answers !== null);

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

  const groupedTags = groupInteriorTags(article);

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
    navigate("/interior/question", {
      state: {
        company: company,
      },
    });
  };

  useEffect(() => {
    const fetchCompany = async () => {
      const data = await InteriorService.fetchCompany(company);

      setCompany(data || {});
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

              {item.img_tag === "MODEL" && (
                <InteriorModelViewer src={item.img_name} />
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
                onClick={() => {
                  setBookingPossible(!bookingPossible);
                }}
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
            <div className="booking-card">
              <InteriorBooking company={company} answers={answers} />
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
                <Chip key={value} label={value} />
              ))}
            </Stack>
          </div>
        ))}
      </div>

      <div className="example-card">
        <div className="section-title">시공 사례</div>

        <div className="example-grid">
          {example.map((item, idx) => (
            <div key={idx} className="example-item">
              {item?.logo?.result
                ?.filter(
                  (record) => record.dir_d === item.ie_tag + "_" + item.ie_tag2,
                )
                ?.map((record, i) => (
                  <img
                    key={i}
                    className="example-img"
                    src={record.img_name}
                    alt={`${item.c_name} 예시`}
                    onClick={() => setSelectedImg(record.img_name)}
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

      <div className="review-customer-layout">
        <div className="review-card">
          <div className="section-title">리뷰 및 후기</div>

          <InteriorReviewList company={company} />
        </div>

        <div className="customer-card">
          <div className="section-title">이런 고객에게 추천</div>

          <div className="customer-item">신혼집 인테리어</div>

          <div className="customer-item">모던 스타일 선호</div>

          <div className="customer-item">수납 공간 개선 희망</div>

          <div className="customer-item">욕실 / 주방 리모델링</div>
        </div>
      </div>

      {selectedImg && (
        <div className="image-modal" onClick={() => setSelectedImg(null)}>
          <img
            src={selectedImg}
            alt="확대 이미지"
            className="image-modal-img"
          />
        </div>
      )}
    </div>
  );
}

export default InteriorArticle;
