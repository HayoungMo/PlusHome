import { useState } from "react";

import InteriorAdd from "../components/InteriorAdd";
import InteriorExAdd from "../components/InteriorExAdd";
import InteriorInvoiceAdd from "../components/InteriorInvoiceAdd";
import InteriorBookingLists from "../components/InteriorBookingLists";

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

    <InteriorBookingLists company={company}/>

     
    </div>
  );
}

export default InteriorCreated;
