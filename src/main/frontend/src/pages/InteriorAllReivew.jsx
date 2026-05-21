import React, { useEffect, useState } from "react";
import { Chip, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import InteriorService from "../service/interiorService";
import GetImgDir from "../resources/function/GetImgDir";
import DialogInside from "../components/DialogInside";
import "../css/InteriorAllReview.css";

const InteriorAllReivew = () => {
  const navigate = useNavigate();

  const [review, setReview] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);

  const handleNext = (company) => {
    navigate("/interior/article", {
      state: { company },
    });
  };

  useEffect(() => {
    const fetchReview = async () => {
      const data = await InteriorService.fetchAllInteriorReview();
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
  }, []);

  const getReviewImages = (item) => {
    return (
      item?.logo?.result?.filter(
        (record) => String(record.dir_e) === String(item.b_createdDate),
      ) || []
    );
  };

  const getThumbnailImage = (item) => {
    const images = getReviewImages(item);
    return images.find((record) => record.img_tag === "THUMBNAIL") || images[0];
  };

  const groupedReviews = review.reduce((acc, item) => {
    const key = `${item.c_id}_${item.c_kind}_${item.c_name}`;

    if (!acc[key]) {
      acc[key] = {
        company: {
          c_id: item.c_id,
          c_kind: item.c_kind,
          c_name: item.c_name,
        },
        reviews: [],
      };
    }

    acc[key].reviews.push(item);

    return acc;
  }, {});

  const selectedImages = selectedReview ? getReviewImages(selectedReview) : [];

  return (
    <div className="interior-all-review-page">
      <h2 className="interior-all-review-title">리뷰 조회 결과</h2>

      {Object.values(groupedReviews).map((group, idx) => (
        <div className="interior-review-group" key={idx}>
          <button
            className="interior-review-company"
            type="button"
            onClick={() => handleNext(group.company)}
          >
            {group.company.c_name}
          </button>

          <div className="interior-review-grid">
            {group.reviews.map((item, reviewIdx) => {
              const thumbnail = getThumbnailImage(item);

              return (
                <button
                  className="interior-review-card"
                  key={reviewIdx}
                  type="button"
                  onClick={() => setSelectedReview(item)}
                >
                  <div className="interior-review-card-thumb">
                    {thumbnail ? (
                      <img
                        src={thumbnail.img_name}
                        alt={`${item.c_name} 리뷰`}
                      />
                    ) : (
                      <span>이미지 없음</span>
                    )}
                  </div>

                  <div className="interior-review-card-info">
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip label="리뷰" size="small" />
                    </Stack>
                    <p>{item.ir_content}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <DialogInside
        open={Boolean(selectedReview)}
        onClose={() => setSelectedReview(null)}
        maxWidth="md"
        fullWidth
        contentClassName="all-review-dialog-content"
      >
        <div className="all-review-dialog">
          <div className="all-review-dialog-images">
            {selectedImages.map((record, i) => (
              <img
                key={`${record.img_name}-${i}`}
                src={record.img_name}
                alt={`${selectedReview?.c_name} 리뷰`}
              />
            ))}
          </div>

          <div className="all-review-dialog-info">
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={selectedReview?.c_name} />
            </Stack>
            <p>{selectedReview?.ir_content}</p>
          </div>
        </div>
      </DialogInside>
    </div>
  );
};

export default InteriorAllReivew;
