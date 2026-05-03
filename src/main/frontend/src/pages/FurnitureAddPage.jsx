import React,{useState} from 'react';
import FurnitureService from "../service/furnitureService";

const FurnitureAddPage = () => {

    const [data,setData] = useState({
        companyCode: "",
        catagoryCode: "",
        c_id: "",
        c_kind: "",
        c_name: "",
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
    const [images, setImages] = useState([])

    const changeInput = (evt) =>{
        const {value,name} = evt.target
        setData({
            ...data,
            [name]:value
        })
    } 

    const changeImages = (evt) =>{
        setImages(Array.from(evt.target.files))
    }
    
    const handleSubmit = async () =>{
        try {
            const formData = new FormData()

            Object.keys(data).forEach((key)=>{
                formData.append(key,data[key])
            })

            images.forEach((image) =>{
                formData.append("images",image);
            })

            await FurnitureService.insertFurniture(data)
            
            alert("가구가 등록되었습니다")
        } catch (error) {
            console.error("에러:"+error)
        }
    }
    return (
        <div>
            <h3>가구 등록 페이지</h3>

            <label>업체 아이디:</label>
            <input name="c_id" placeholder="업체 아이디" onChange={changeInput} /><br/>
            <label>업체 종류:</label>
            <input name="c_kind" placeholder="업체 종류" onChange={changeInput} /><br/>
            <label>업체 이름:</label>
            <input name="c_name" placeholder="업체 이름" onChange={changeInput} /><br/>

            <label>가구 이름:</label>
            <input name="f_name" placeholder="가구명" onChange={changeInput} /><br/>
            <label>가구 가격:</label>
            <input name="f_price" placeholder="가격" onChange={changeInput} /><br/>
            <label>할인가:</label>
            <input name="f_dprice" placeholder="할인가" onChange={changeInput} /><br/>

            <label>가구 이미지:</label>
            <input 
                type='file'
                name='images'
                multiple
                accept='images/*'
                onChange={changeImages}/>
            <br/>
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
            <label>할인율:</label>
            <input name="f_discount" placeholder="할인율" onChange={changeInput} /><br/>
            <label>포인트:</label>
            <input name="f_point" placeholder="포인트" onChange={changeInput} /><br/>
            <label>수량:</label>
            <input name="f_count" placeholder="수량" onChange={changeInput} /><br/>
                     
            <br/>
            <button onClick={handleSubmit}>버튼</button>
        </div>
    );
};

export default FurnitureAddPage;