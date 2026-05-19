import React, { useEffect, useState } from "react";
import InteriorService from "../service/interiorService";
import GetImgDir from "../resources/function/GetImgDir";

const InteriorReviewList = ({ company }) => {
  const [review, setReview] = useState([]);
  const [selectedImg, setSelectedImg] = useState(null);
  useEffect(() => {
    const fetchReview = async () => {
      const data = await InteriorService.fetchInteriorReview(company);
      console.log("리뷰데이터");
      console.log(data);
      const companyList = Array.isArray(data) ? data : [];
      const listWithImages = await Promise.all(
        companyList.map(async (item) => {
          const logo = await GetImgDir({
            kind: "I_REVIEW",
            returnType: "list",
            a: item.c_id,
            b: item.c_kind,
            c: item.c_name,
            d: item.id,
            e: item.b_createdDate,
            view: false,
          });
          return {
            ...item,
            logo,
          };
        }),
      );
      setReview(listWithImages);
    };

    fetchReview();
  }, [company]);

  return (
    <div>
      {review.map((item) => (
        <div>
          <p>리뷰 모음</p>
          {item.ir_content}
          {item.logo.result
            .filter((record) => record.dir_e === item.b_createdDate)
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
            ))}
        </div>
      ))}
    </div>
  );
};

export default InteriorReviewList;
