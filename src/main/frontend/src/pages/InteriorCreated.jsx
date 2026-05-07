import { useState } from "react";

import InteriorAdd from "../components/InteriorAdd";
import InteriorExAdd from "../components/InteriorExAdd";
import InteriorBookingLists from "../components/InteriorBookingLists";
import InteriorChart from "../components/InteriorChart";
import InteriorUpdate from "../components/InteriorUpdate";
import InteriorExUpdate from "../components/InteriorExUpdate";
import BookingUpdate from "../components/BookingUpdate";

//테스트용 파일
function InteriorCreated(/*{ company }*/) {
  const [company, setCompany] = useState({
    c_id: "comp02",
    c_kind: "interior",
    c_name: "감성인테리어",
  });
  
  return (
    <div>
    
    <InteriorAdd company={company}/>

    <InteriorExAdd company={company}/>

    <InteriorUpdate company={company}/>

    <InteriorExUpdate company={company}/>

    <BookingUpdate company={company}/>

    <InteriorChart company={company}/>

     
    </div>
  );
}

export default InteriorCreated;
