import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InteriorService from '../service/interiorService';
import GetImgDir from '../resources/function/GetImgDir';

const InteriorAllExample = () => {
    const navigate = useNavigate();
    const [example, setExample] = useState([]);
    const handleNext = (data) => {
      navigate("/interior/article", {
        state: { company: data },
      });
    };
const [selectedImg, setSelectedImg] = useState(null);
    useEffect(() => {
        const fetchExample = async () => {
          const data = await InteriorService.fetchAllInteriorExample();
          const companyList = Array.isArray(data) ? data : [];
          const listWithImages = await Promise.all(
            companyList.map(async (item) => {
              const logo = await GetImgDir({
                kind: "I_EXAMPLE",
                returnType: "list",
                a: item.c_id,
                b: item.c_kind,
                c: item.c_name,
                d: item.ie_tag+"_"+item.ie_tag2,
                view: false,
              });
               if (!logo?.result?.length) {
                 return null;
               }
              return {
                ...item,
                logo,
              };
            }),
          );
    
          setExample(listWithImages);
        };
        fetchExample();
      }, []);
    return (
      <div>
        예시 조회 결과
        {example.map((item, idx) => (
          <div key={idx}>
            <div onClick={()=>handleNext(item)}>
              name: {item?.c_name}
              tag: {item?.ie_tag}
              tag2: {item?.ie_tag2}
              content: {item?.ie_content}
            </div>
            {/* 이미지 출력 */}
            {item?.logo?.result
              .filter(
                (record) => record.dir_d === item.ie_tag + "_" + item.ie_tag2,
              )
              .map((record, i) => (
                <div>
                  <img
                    src={record.img_name}
                    alt={`${item.c_name} 예시`}
                    onClick={() => setSelectedImg(record.img_name)}
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                    }}
                  />
                </div>
              ))}
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
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    );
};

export default InteriorAllExample;