import React, { useEffect, useState } from "react";
import FurnitureReviewService from "../service/furnitureReviewService";
import GetImgDir from "../resources/function/GetImgDir";
import RatingMui from "./RatingMui";
import Loading from "../components/Loading";
import "../css/FurnitureReview.css";

const FurnitureReview = ({ f_code, fr_idx = 0 }) => {
  const [reviews, setReviews] = useState([]);
  const [selectedItem, setSelectedItem] = useState();
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReview = async () => {
      if (!f_code) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await FurnitureReviewService.selectReview({
          fr_idx: fr_idx,
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
      } catch (error) {
        console.error("리뷰 조회 실패", error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [f_code, fr_idx]);

  if (loading) {
    return <Loading message="리뷰를 불러오는 중입니다." />;
  }

  if (reviews.length === 0) {
    return (
      <div className="furniture-review-empty">
        <p>등록된 리뷰가 없습니다.</p>
      </div>
    );
  }

  return (
    <section className="furniture-review">
      <div className="furniture-review-header">
        <div>
          <p>REVIEW</p>
          <h3>구매 후기</h3>
        </div>
        <span>{reviews.length}개</span>
      </div>

      <div className="furniture-review-thumbnail-list">
        {reviews.map((item, idx) => {
          const thumbnail = item?.logo?.result?.find(
            (record) => record.img_tag === "THUMBNAIL",
          );

          return (
            <button
              className={`furniture-review-thumbnail ${
                selectedImage === idx ? "is-selected" : ""
              }`}
              key={`${item.fr_idx || idx}-${item.id}`}
              type="button"
              onClick={() => {
                setSelectedItem(selectedItem === item ? null : item);
                setSelectedImage(selectedImage === idx ? null : idx);
              }}
            >
              {thumbnail ? (
                <img src={thumbnail.img_name} alt={`${item.c_name} 리뷰`} />
              ) : (
                <span>이미지 없음</span>
              )}
            </button>
          );
        })}
      </div>

      {selectedItem && (
        <article className="furniture-review-detail">
          <div className="furniture-review-detail-images">
            {selectedItem?.logo?.result?.map((record, i) => (
              <img
                key={`${record.img_name}-${i}`}
                src={record.img_name}
                alt={`${selectedItem.c_name} 리뷰`}
              />
            ))}
          </div>

          <div className="furniture-review-detail-content">
            <div className="furniture-review-detail-title">
              <h4>{selectedItem?.fr_subject}</h4>
              <RatingMui
                value={selectedItem?.fr_star}
                readOnly={true}
                precision={0.5}
              />
            </div>
            <p className="furniture-review-writer">
              작성자 <strong>{selectedItem?.id}</strong>
            </p>
            <p className="furniture-review-text">{selectedItem?.fr_content}</p>
          </div>
        </article>
      )}
    </section>
  );
};

export default FurnitureReview;
