import React, { useEffect, useState } from "react";
import InteriorService from "../service/interiorService";
import GetImgDir from "../resources/function/GetImgDir";

const InteriorReviewList = ({ company }) => {
  const [review, setReview] = useState([]);

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
            e:item.b_createdDate,
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
          content : {item.ir_content}
          {item.logo.result
            .filter(
              (record) => record.dir_e === item.b_createdDate,
            )
            .map((record, i) => (
              <div>
                <img
                  src={record.img_name}
                  alt={`${item.c_name} 예시`}
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                  }}
                />
              </div>
            ))}
        </div>
      ))}
    </div>
  );
};

export default InteriorReviewList;
