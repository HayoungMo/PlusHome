import React, { useEffect, useState } from "react";
import InteriorService from "../service/interiorService";
import { useNavigate } from "react-router-dom";
import GetImgDlr from "../resources/function/GetImgDir";

const InteriorList = () => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);

    const [image, setImage] = useState(null);


  const handleNext = (data) => {
    navigate("/interior/article", {
      state: { company: data },
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await InteriorService.fetchList();

      const companyList = Array.isArray(data) ? data : [];
      const listWithImages = await Promise.all(
        companyList.map(async (item) => {
          console.log("아이템" + item);
          const logo = await GetImgDlr({
            kind: "LOGO",
            returnType: "list",
            a: item.c_id,
            b: item.c_kind,
            c: item.c_name,
            d: "LOGO",
            view: false,
          });
          return {
            ...item,
            logo,
          };
        }),
      );
      console.log(listWithImages);
      setList(listWithImages);
    };

    fetchData();
  }, []);

  return (
    <div>
      <div>
        <h3>결과</h3>
        {list.map((item, idx) => (
          <div key={idx} onClick={() => handleNext(item)}>
            {item.logo.result && (
              <img
                src={item.logo.img_name}
                alt={`${item.c_name} 로고`}
                style={{ width: "100px", height: "100px", objectFit: "cover" }}
              />
            )}
            id: {item.c_id}
            name: {item.c_name}
            kind: {item.c_kind}
            tel: {item.c_tel}
            addr: {item.c_addr}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InteriorList;
