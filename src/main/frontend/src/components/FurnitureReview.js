import React, { useEffect, useState } from 'react';
import FurnitureReviewService from '../service/furnitureReviewService';
import GetImgDir from '../resources/function/GetImgDir';
import RatingMui from './RatingMui';

const FurnitureReview = ({f_code,fr_idx = 0}) => {
      const [reviews, setReviews] = useState();
    
      useEffect(() => {
        const fetchReview = async () => {
          const result = await FurnitureReviewService.selectReview({
            fr_idx:fr_idx,
            f_code: f_code,
          });
          const List = Array.isArray(result.data) ? result.data : [];
          const listWithImages = await Promise.all(
            List.map(async (item) => {
              const logo = await GetImgDir({
                kind: "F_REVIEW",
                returnType: "list",
                a: item.f_code,
                d: item.id,
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
          setReviews(listWithImages);
        };
        fetchReview();
      }, []);
      
    return (
      <div>
        {reviews?.map((item) => (
          <div>
            {item?.logo?.result.map((record, i) => (
              <div>
                <img width={100} src={record.img_name} alt={`${item.c_name} 예시`} />
              </div>
            ))}
            제목 : {item?.fr_subject}
            작성자 : {item?.id}
            내용 : {item?.fr_content}
            <RatingMui value={item?.fr_star} readOnly={true} precision={0.5} />
          </div>
        ))}
      </div>
    );
};

export default FurnitureReview;