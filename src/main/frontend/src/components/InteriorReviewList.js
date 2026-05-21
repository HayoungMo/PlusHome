import React, { useEffect, useState } from "react";
import InteriorService from "../service/interiorService";
import GetImgDir from "../resources/function/GetImgDir";
import "../css/InteriorReviewList.css";

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
    <div className="interior-review-list">
      {review.map((item, idx) => (
        <div className="interior-review-item" key={`${item.id}-${idx}`}>
          <p>리뷰 모음</p>
          <div className="interior-review-content">{item.ir_content}</div>

          <div className="interior-review-image-list">
            {item.logo.result
            .filter((record) => record.dir_e === item.b_createdDate)
            .map((record, i) => (
              <div className="interior-review-thumb" key={`${record.img_name}-${i}`}>
                <img
                  src={record.img_name}
                  alt={`${item.c_name} 예시`}
                  onClick={() => setSelectedImg(record.img_name)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {selectedImg && (
        <div
          className="interior-review-modal"
          onClick={() => setSelectedImg(null)}
        >
          <div className="interior-review-modal-content">
            <img src={selectedImg} alt="확대 이미지" />
          </div>
        </div>
      )}
    </div>
  );
};

export default InteriorReviewList;
