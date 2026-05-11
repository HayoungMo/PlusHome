import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import LikeService from "../service/likeService";
import { getImgDirSimple } from "../resources/function/GetImgDir";

const UserWishListPage = ({ user }) => {
  const navigate = useNavigate();
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);

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

        alert("찜목록을 불러오지 못했습니다.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, navigate]);

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
    return <div>찜목록을 불러오는 중...</div>;
  }

  if (!user?.id) {
    return <div>로그인 정보를 불러오지 못했습니다.</div>;
  }

  return (
    <section className="user-wishlist-page">
      <h2>찜목록</h2>

      {likes.length === 0 ? (
        <p>찜한 상품이 없습니다.</p>
      ) : (
        <div className="user-wishlist-list">
          {likes.map((item) => {
            const thumbnail =
              item.imageList?.find((img) => img.img_tag === "THUMBNAIL") ||
              item.imageList?.[0];

            return (
              <div
                key={item.f_code}
                className="user-wishlist-item"
                onClick={() => onClickItem(item.f_code)}
                style={{
                  border: "1px solid #ddd",
                  padding: "12px",
                  marginBottom: "12px",
                  cursor: "pointer",
                }}
              >
                {thumbnail ? (
                  <img
                    src={getImgDirSimple({
                      kind: thumbnail.img_kind,
                      name: thumbnail.img_name,
                    })}
                    alt={item.f_name}
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "120px",
                      height: "120px",
                      border: "1px solid #ddd",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    이미지 없음
                  </div>
                )}

                <div>
                  <p>{item.f_name}</p>
                  <p>{Number(item.f_price || 0).toLocaleString()}원</p>
                  <p>{Number(item.f_dprice || 0).toLocaleString()}원</p>
                </div>

                <button
                  type="button"
                  onClick={(evt) => onToggleLike(evt, item.f_code)}
                >
                  찜 해제
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default UserWishListPage;
