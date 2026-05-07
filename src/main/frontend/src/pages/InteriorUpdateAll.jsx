import { useState } from "react";


import InteriorUpdate from "../components/InteriorUpdate";
import InteriorExUpdate from "../components/InteriorExUpdate";
import BookingUpdate from "../components/BookingUpdate";

//테스트용 파일
function InteriorUpdateAll(/*{ company }*/) {
  const [company, setCompany] = useState({
    c_id: "comp02",
    c_kind: "interior",
    c_name: "감성인테리어",
  });
  
  return (
    <div>

    <InteriorUpdate company={company}/>

    <InteriorExUpdate company={company}/>

    <BookingUpdate company={company}/>
     
    </div>
  );
}

export default InteriorUpdateAll;
