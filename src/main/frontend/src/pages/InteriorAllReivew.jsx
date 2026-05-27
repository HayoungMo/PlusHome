import React, { useEffect, useState } from "react";
import { Button, Chip, Pagination, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import InteriorService from "../service/interiorService";
import GetImgDir from "../resources/function/GetImgDir";
import DialogInside from "../components/DialogInside";
import "../css/InteriorAllReview.css";

const PAGE_SIZE = 6;

const InteriorAllReivew = () => {
  const navigate = useNavigate();

  const [review, setReview] = useState([]);
  const [pageNum, setPageNum] = useState(1);
  const [pageInfo, setPageInfo] = useState({
    totalCount: 0,
    totalPage: 0,
    pageSize: PAGE_SIZE,
  });
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewImageIndex, setReviewImageIndex] = useState(0);

  const handleNext = (company) => {
    navigate("/interior/article", {
      state: { company },
    });
  };

  useEffect(() => {
    const fetchReview = async () => {
      const data = await InteriorService.fetchPagedInteriorReview({
        pageNum,
        pageSize: PAGE_SIZE,
      });
      const companyList = Array.isArray(data?.list) ? data.list : [];

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
      setPageInfo({
        totalCount: data?.totalCount || 0,
        totalPage: data?.totalPage || 0,
        pageSize: data?.pageSize || PAGE_SIZE,
      });
    };

    fetchReview();
  }, [pageNum]);

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

  const handleReviewOpen = (item) => {
    setSelectedReview(item);
    setReviewImageIndex(0);
  };

  const handleReviewClose = () => {
    setSelectedReview(null);
    setReviewImageIndex(0);
  };

  const handlePrevImage = () => {
    setReviewImageIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNextImage = () => {
    setReviewImageIndex((prev) => Math.min(prev + 1, selectedImages.length - 1));
  };

  return (
    <div className="interior-all-review-page">
      <h2 className="interior-all-review-title">리뷰 조회 결과</h2>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        총 {pageInfo.totalCount}개 리뷰
      </Typography>

      {Object.values(groupedReviews).map((group) => (
        <div
          className="interior-review-group"
          key={`${group.company.c_id}-${group.company.c_kind}-${group.company.c_name}`}
        >
          <button
            className="interior-review-company"
            type="button"
            onClick={() => handleNext(group.company)}
          >
            {group.company.c_name}
          </button>

          <div className="interior-review-grid">
            {group.reviews.map((item) => {
              const thumbnail = getThumbnailImage(item);

              return (
                <button
                  className="interior-review-card"
                  key={`${item.id}-${item.c_id}-${item.b_createdDate}`}
                  type="button"
                  onClick={() => handleReviewOpen(item)}
                >
                  <div className="interior-review-card-thumb">
                    {thumbnail ? (
                      <img src={thumbnail.img_name} alt={`${item.c_name} 리뷰`} />
                    ) : (
                      <span>이미지 없음</span>
                    )}
                  </div>

                  <div className="interior-review-card-info">
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip label={item.c_name} size="small" />
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

      {review.length === 0 && (
        <Typography className="interior-all-review-empty" color="text.secondary">
          등록된 리뷰가 없습니다.
        </Typography>
      )}

      {pageInfo.totalPage > 1 && (
        <Pagination
          count={pageInfo.totalPage}
          page={pageNum}
          onChange={(e, page) => setPageNum(page)}
          color="primary"
          sx={{ display: "flex", justifyContent: "center", mt: 4 }}
        />
      )}

      <DialogInside
        open={Boolean(selectedReview)}
        onClose={handleReviewClose}
        maxWidth="md"
        fullWidth
        contentClassName="all-review-dialog-content"
      >
        <div className="all-review-dialog">
          <div className="all-review-dialog-images">
            {selectedImages
              .filter((_, i) => i === reviewImageIndex)
              .map((record, i) => (
                <img
                  key={`${record.img_name}-${i}`}
                  src={record.img_name}
                  alt={`${selectedReview?.c_name} 리뷰`}
                />
              ))}
            {selectedImages.length > 1 && (
              <div className="all-review-slide-controls">
                <Button
                  variant="contained"
                  size="small"
                  onClick={handlePrevImage}
                  disabled={reviewImageIndex === 0}
                >
                  이전
                </Button>
                <span>
                  {reviewImageIndex + 1} / {selectedImages.length}
                </span>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleNextImage}
                  disabled={reviewImageIndex === selectedImages.length - 1}
                >
                  다음
                </Button>
              </div>
            )}
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
