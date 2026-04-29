import React, { useEffect, useState } from "react";
import InteriorService from "../service/interiorService";
import { useNavigate } from "react-router-dom";

const InteriorList = () => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);

  const handleNext = (data) => {
    navigate("/interior/article", {
      state: { data: data },
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await InteriorService.fetchList();
      setList(Array.isArray(data) ? data : []);
    };

    fetchData();
  }, []);

  return (
    <div>
      <div>
        <h3>결과</h3>
        {list.map((item, idx) => (
          <div key={idx} onClick={() => handleNext(item)}>
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
