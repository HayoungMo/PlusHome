import { useEffect, useState } from "react";

import InteriorService from "../service/interiorService";
import { useLocation, useNavigate } from "react-router-dom";
import InteriorBooking from "../components/InteriorBooking";
import GetImgDir from "../resources/function/GetImgDir";
import InteriorModelViewer from "../components/InteriorModelViewer";
import InteriorReviewList from "../components/InteriorReviewList";
import { Button } from "@mui/material";
import Maps from "../maps/Maps";
import TableMui from "../components/TableMui";
import { Chip, Stack } from "@mui/material";

//테스트용 파일
function InteriorArticle() {
  const id = localStorage.getItem("id");
  const { naver } = window;
  const location = useLocation();
  const company = location.state.company;
  const answers = location.state.answers;
  const navigate = useNavigate();
  const [article, setArticle] = useState([]);

  const [example, setExample] = useState([]);

  const [selectedImg, setSelectedImg] = useState(null);
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

  const handleNext = () => {
    navigate("/interior/question", {
      state: { company: company },
    });
  };

  const [bookingPossible, setBookingPossible] = useState(answers !== null);

  const wishKey = `wishList_${id}`;

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

  useEffect(() => {
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
    getWishList();
    fetchArticle();
    fetchExample();
  }, []);

  return (
    <div>
      업체 상세 페이지
      {company?.logo?.result?.map((item, idx) => (
        <div key={idx}>
          {item.img_tag === "PROFILE" && (
            <img src={item.img_name} alt={`${company.c_name} 로고`} />
          )}

          {item.img_tag === "MODEL" && (
            <InteriorModelViewer src={item.img_name} />
          )}
        </div>
      ))}
      <div>
        상세 조회 결과
        <Maps c_addr={company.c_addr.split("__")[0]} />
        {Object.entries(groupedTags).map(([tag, values]) => (
          <div key={tag}>
            {tagNameMap[tag] || tag}
            <Stack direction="row">
              {values.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Stack>
          </div>
        ))}
      </div>
      <div>
        예시 조회 결과
        {example.map((item, idx) => (
          <div key={idx}>
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

            <div>
              <Chip key={item?.ie_tag} label={item?.ie_tag}  />
              <Chip key={item?.ie_tag2} label={item?.ie_tag2}  />
              {item?.ie_content}
            </div>
          </div>
        ))}
      </div>
      <InteriorReviewList company={company} />
      <Button onClick={toggleWish}>{like ? "찜 취소" : "찜하기"}</Button>
      {answers ? (
        <div>
          {bookingPossible && (
            <InteriorBooking company={company} answers={answers} />
          )}
          <Button
            onClick={() => {
              setBookingPossible(!bookingPossible);
            }}
          >
            {bookingPossible ? "취소" : "상담 신청"}
          </Button>
        </div>
      ) : (
        <Button
          onClick={() => {
            handleNext();
          }}
        >
          상담을 위한 질의응답
        </Button>
      )}
    </div>
  );
}

export default InteriorArticle;
