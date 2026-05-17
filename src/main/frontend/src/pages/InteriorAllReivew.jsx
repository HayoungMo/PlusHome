import React, { useEffect, useState } from "react";
import InteriorService from "../service/interiorService";
import GetImgDir from "../resources/function/GetImgDir";
import { useNavigate } from "react-router-dom";

const InteriorAllReivew = () => {
  const navigate = useNavigate();

  const [review, setReview] = useState([]);
  const [selectedImg, setSelectedImg] = useState(null);

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

  // 업체별 그룹화
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

  return (
    <div>
      {Object.values(groupedReviews).map((group, idx) => (
        <div
          key={idx}
          style={{
            marginBottom: "60px",
            paddingBottom: "30px",
            borderBottom: "1px solid #ddd",
          }}
        >
          {/* 업체명 */}
          <div
            onClick={() => handleNext(group.company)}
            style={{
              cursor: "pointer",
              marginBottom: "20px",
            }}
          >
            <h2>{group.company.c_name}</h2>
          </div>

          {/* 리뷰 카드들 */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              overflowX: "auto",
              paddingBottom: "10px",
            }}
          >
            {group.reviews.map((item, reviewIdx) => (
              <div
                key={reviewIdx}
                style={{
                  minWidth: "300px",
                  border: "1px solid #ccc",
                  borderRadius: "12px",
                  padding: "16px",
                  flexShrink: 0,
                }}
              >
                <p>{item.ir_content}</p>

                {/* 리뷰 이미지 */}
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  {item?.logo?.result
                    ?.filter(
                      (record) =>
                        String(record.dir_e) === String(item.b_createdDate),
                    )
                    ?.map((record, i) => (
                      <img
                        key={i}
                        src={record.img_name}
                        alt={`${item.c_name} 리뷰`}
                        onClick={() => setSelectedImg(record.img_name)}
                        style={{
                          width: "120px",
                          height: "120px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          cursor: "pointer",
                        }}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* 확대 이미지 */}
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
  );
};

export default InteriorAllReivew;
