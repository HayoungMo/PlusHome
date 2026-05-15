import React, { useEffect, useState } from 'react';
import FurnitureReviewService from '../service/furnitureReviewService';
import GetImgDir from '../resources/function/GetImgDir';
import RatingMui from './RatingMui';

const FurnitureReview = ({f_code,fr_idx = 0}) => {
      const [reviews, setReviews] = useState();
      const [selectedItem, setSelectedItem] = useState();
    const [selectedImage, setSelectedImage] = useState(null);
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
                a: item.c_code,
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
        {reviews?.map((item,idx) => (
          <img
            width={100}
            src={
              item?.logo?.result?.find((item) => item.img_tag === "THUMBNAIL")
                ?.img_name
            }
            alt={`${item.c_name} 예시`}
            onClick={() => {setSelectedItem(selectedItem=== item ? null : item);
              setSelectedImage(selectedImage === idx ? null : idx);
            }}
            style={{
              width: "120px",
              height: "120px",
              cursor: "pointer",
              border:
                selectedImage === idx ? "3px solid red" : "1px solid #ccc",
              borderRadius: "8px",
            }}
          />
        ))}
        {selectedItem && (
          <div>
            {selectedItem?.logo?.result.map((record, i) => (
              <div>
                <img
                  width={100}
                  src={record.img_name}
                  alt={`${selectedItem.c_name} 예시`}
                />
              </div>
            ))}
            제목 : {selectedItem?.fr_subject}
            작성자 : {selectedItem?.id}
            내용 : {selectedItem?.fr_content}
            <RatingMui
              value={selectedItem?.fr_star}
              readOnly={true}
              precision={0.5}
            />
          </div>
        )}
      </div>
    );
};

export default FurnitureReview;