import { useState } from "react";
import InteriorService from "../service/interiorService";


//테스트용 파일
function InteriorList() {
    const [list, setList] = useState([]);

    return (
      <div>
        <div>
          <button
            onClick={async () => {
              const data = await InteriorService.fetchList();
              setList(data);
            }}
          >
            데이터 조회
          </button>
        </div>

        <div>
          <h3>결과</h3>
          {list.map((item, idx) => (
            <div key={idx}>
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
