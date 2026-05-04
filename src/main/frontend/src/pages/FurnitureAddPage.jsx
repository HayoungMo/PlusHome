import React,{useState} from 'react';
import FurnitureService from "../service/furnitureService";
import ImageService from '../service/imageService';

const FurnitureAddPage = () => {

    const [data,setData] = useState({
        companyCode: "",
        catagoryCode: "",
        c_id: "testCompany",
        c_kind: "shop",
        c_name: "테스트업체",
        f_name: "",
        f_price: "",
        f_dprice: "",
        f_catagory1: "",
        f_catagory2: "",
        f_catagory3: "",
        f_catagory4: "",
        f_catagory5: "",
        f_discount: "",
        f_point: "",
        f_count: ""
    });

    const [thumbnail,setThumbnail] = useState(null)
    const [infoFiles, setInfoFiles] = useState([])
    const [detailFiles, setDetailFiles] = useState([])

    const changeInput = (evt) =>{
        const {name,value} = evt.target

        let updatedData= {
            ...data,
            [name]:value
        }

        if (name === "f_price" || name === "f_discount"){
            const price = name === "f_price" ? value : data.f_price
            const discount = name === "f_discount" ? value : data.f_discount
            
            if(price && discount){
                const p = Number(price)
                const d = Number(discount)

                if(!isNaN(p) && !isNaN(d)){
                    updatedData.f_dprice = Math.floor(p-(p*d/100))
                }
            }
        }
        setData(updatedData)
    } 
    
    
    const onSubmit = async () =>{
        try {
            const sendData = {
                dto:data,
                thumbnail,
                infoFiles,
                detailFiles
            }
            const res = await FurnitureService.insertFurniture(sendData);
        } catch (error) {
            console.error("에러:"+error)
        }
    }
    return (
        <div>
            <h3>가구 등록 페이지</h3>

            <label>가구 이름:</label>
            <input name="f_name" placeholder="가구명" onChange={changeInput} /><br/>
            <label>가구 가격:</label>
            <input name="f_price" placeholder="가격" onChange={changeInput} /><br/>
            <p>할인가:{data.f_dprice}</p>
            <label>할인율:</label>
            <input name="f_discount" placeholder="할인율" onChange={changeInput} /><br/>
            <p>썸네일</p>
            <input type="file" accept="image/*"
                onChange={(evt)=>setThumbnail(evt.target.files[0])}
            />

            <p>정보 이미지</p>
            <input type="file" multiple accept="image/*"
                onChange={(evt)=>setInfoFiles(Array.from(evt.target.files))}
            />

            <p>상세 이미지</p>
            <input type="file" multiple accept="image/*"
                onChange={(evt)=>setDetailFiles(Array.from(evt.target.files))}
            />
            <br/><br/>
            <label>카테고리1:</label>
            <input name="f_catagory1" placeholder="카테고리1" onChange={changeInput} /><br/>
            <label>카테고리2:</label>
            <input name="f_catagory2" placeholder="카테고리2" onChange={changeInput} /><br/>
            <label>카테고리3:</label>
            <input name="f_catagory3" placeholder="카테고리3" onChange={changeInput} /><br/>
            <label>카테고리4:</label>
            <input name="f_catagory4" placeholder="카테고리4" onChange={changeInput} /><br/>
            <label>카테고리5:</label>
            <input name="f_catagory5" placeholder="카테고리5" onChange={changeInput} /><br/>

            <label>포인트:</label>
            <input name="f_point" placeholder="포인트" onChange={changeInput} /><br/>
            <label>수량:</label>
            <input name="f_count" placeholder="수량" onChange={changeInput} /><br/>
                     
            <br/>
            <button onClick={onSubmit}>등록</button>
        </div>
    );
};

export default FurnitureAddPage;