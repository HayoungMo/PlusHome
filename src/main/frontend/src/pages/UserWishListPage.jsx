import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import LikeService from "../service/likeService";
import { getImgDirSimple } from "../resources/function/GetImgDir";
import Loading from "../components/Loading";

import DialogMui from "../components/DialogMui";

const UserWishListPage = ({ user }) => {
  const navigate = useNavigate();
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const startSelectMode = () => {
      setSelectMode(true);
      setSelectedIds([]);
  };

  const cancelSelectMode = () => {
      setSelectMode(false);
      setSelectedIds([]);
      setBulkDeleteOpen(false);
  };

  const toggleSelect = (id) => {
      setSelectedIds((prev) =>
          prev.includes(id)
          ? prev.filter((item) => item !== id)
          : [...prev, id]
      );
  };

  const openBulkDelete = () => {
      if (selectedIds.length === 0) {
          alert("삭제할 항목을 선택해주세요.");
          return;
      }

      setBulkDeleteOpen(true);
  };

  const getWishKey = (item) => String(item.f_code);

const toggleSelectAll = () => {
  const allIds = likes.map((item) => getWishKey(item));

  if (
    likes.length > 0 &&
    likes.every((item) => selectedIds.includes(getWishKey(item)))
  ) {
    setSelectedIds([]);
    return;
  }

  setSelectedIds(allIds);
};

  const bulkDeleteLikes = async () => {
    await Promise.all(
      selectedIds.map((f_code) => LikeService.toggleFurnitureLike(f_code))
    );

    setLikes((prev) =>
      prev.filter((item) => !selectedIds.includes(String(item.f_code)))
    );

    cancelSelectMode();
  };

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    LikeService.getMyFurnitureLikes()
      .then((res) => {
        setLikes(res.data || []);
      })
      .catch((error) => {
        console.error(error);

        if (error.response?.status === 401) {
          alert("권한 없음")
          return;
        }

        alert("찜 목록을 불러오지 못했습니다.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user?.id , navigate]);

  const onClickItem = (f_code) => {
    navigate(`/furniture/article/${f_code}`);
  };

  const onToggleLike = (evt, f_code) => {
    evt.stopPropagation();

    LikeService.toggleFurnitureLike(f_code)
      .then((res) => {
        const liked = res.data?.liked;

        if (!liked) {
          setLikes((prev) => prev.filter((item) => item.f_code !== f_code));
        }
      })
      .catch((error) => {
        console.error(error);
        alert("찜 해제에 실패했습니다.");
      });
  };

  if (loading) {
    return <Loading message="찜 목록을 불러오는 중입니다."/>;
  }

  if (!user?.id) {
    return <div>로그인 정보를 불러오지 못했습니다.</div>;
  }

  return (
    <section className="user-wishlist-page">

    <DialogMui
      open={bulkDeleteOpen}
      onClose={() => setBulkDeleteOpen(false)}
      title="선택 삭제"
      text={`선택한 ${selectedIds.length}개 상품을 찜목록에서 삭제하시겠습니까?`}
      buttons={[
        {
          title: "취소",
          color: "inherit",
          variant: "outlined",
          onClick: () => setBulkDeleteOpen(false),
        },
        {
          title: "삭제",
          color: "error",
          variant: "contained",
          onClick: bulkDeleteLikes,
        },
      ]}
    />

    {likes.length > 0 && (
      <div className="user-bulk-toolbar">
        {selectMode ? (
          <>
            <span>{selectedIds.length}개 선택</span>

            <button type="button" onClick={toggleSelectAll}>
              {likes.every((item) => selectedIds.includes(getWishKey(item)))
                ? "전체해제"
                : "전체선택"}
            </button>

            <button type="button" className="danger" onClick={openBulkDelete}>
              삭제
            </button>

            <button type="button" onClick={cancelSelectMode}>
              취소
            </button>
          </>
        ) : (
          <button type="button" onClick={startSelectMode}>
            선택삭제
          </button>
        )}
      </div>
    )}

      {likes.length === 0 ? (
        <p className="user-wishlist-empty">찜한 상품이 없습니다.</p>
      ) : (
        <div className="user-wishlist-list">
          {likes.map((item) => {
            const itemKey = getWishKey(item);

            const thumbnail =
              item.imageList?.find((img) => img.img_tag === "THUMBNAIL") ||
              item.imageList?.[0];

            const productDeliveryPrice = Number(
              item.f_deliveryPrice ?? item.f_deliveryprice ?? 0
            );

            const deliveryPrice =
              Number(item.f_dprice || 0) >= 50000 ? 0 : productDeliveryPrice;

            const discountRate = Number(item.f_discount || 0);

            return (
            <div
              key={item.f_code}
              className={`user-wishlist-product ${selectMode ? "is-selecting" : ""}`}
              onClick={() => {
                if (!selectMode) {
                  onClickItem(item.f_code);
                }
              }}
            >
              {selectMode && (
                <label className="user-select-check" onClick={(evt) => evt.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(itemKey)}
                    onChange={() => toggleSelect(itemKey)}
                  />
                </label>
              )}

              <div className="user-wishlist-thumb">
                <img
                  src={
                    thumbnail
                      ? getImgDirSimple({
                          kind: thumbnail.img_kind,
                          name: thumbnail.img_name,
                        })
                      : "/no-image.png"
                  }
                  alt={item.f_name}
                />

                {!selectMode && (
                  <button
                    type="button"
                    className="user-wishlist-like-btn"
                    onClick={(evt) => onToggleLike(evt, item.f_code)}
                    onKeyDown={(evt) => {
                      if (evt.key === "Enter" || evt.key === " ") {
                        onToggleLike(evt, item.f_code);
                      }
                    }}
                    aria-label="찜 해제"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="user-wishlist-company">
                {item.c_name || "업체"}
              </div>

              <div className="user-wishlist-title">
                {item.f_name}
              </div>

              {Number(item.f_price || 0) > Number(item.f_dprice || 0) && (
                <div className="user-wishlist-original">
                  {Number(item.f_price || 0).toLocaleString()}원
                </div>
              )}

              <div className="user-wishlist-price">
                {discountRate > 0 && <span>{discountRate}%</span>}
                <strong>{Number(item.f_dprice || 0).toLocaleString()}원</strong>
              </div>

              <div className="user-wishlist-delivery">
                배송비 {deliveryPrice === 0 ? "무료" : `${deliveryPrice.toLocaleString()}원`}
              </div>
            </div>
          );
          })}
        </div>
      )}
    </section>
  );
};

export default UserWishListPage;
