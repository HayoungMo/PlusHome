import React, { useState } from 'react';
import FurnitureService from "../service/furnitureService";
import {useNavigate} from 'react-router-dom'

const FurnitureAddPage = () => {
    const navigate= useNavigate()

    const [data, setData] = useState({
        c_id: "testCompany",
        c_kind: "shop",
        c_name: "테스트업체",
        f_name: "",
        f_price: "0",
        f_dprice: "0",
        f_catagory1: "",
        f_catagory2: "",
        f_catagory3: "",
        f_catagory4: "",
        f_catagory5: "",
        f_discount: "0",
        f_point: "0",
        f_count: "0"
    });

    const [thumbnail, setThumbnail] = useState(null);
    const [infoFiles, setInfoFiles] = useState([]);
    const [othersFiles, setOthersFiles] = useState([]);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);

    const onChangeThumbnail = (evt) => {
        const file = evt.target.files[0];
        if (!file) return;

        console.log("thumbnail:", file);

        setThumbnail(file);
        setThumbnailPreview(URL.createObjectURL(file));
    };

    const onChangeInfo = (evt) => {
        const files = Array.from(evt.target.files);

        console.log("info files:", files);

        const mapped = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        setInfoFiles(mapped);
    };

    const onChangeOthers = (evt) => {
        const files = Array.from(evt.target.files);

        console.log("others files:", files);

        const mapped = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        setOthersFiles(mapped);
    };

    const changeInput = (evt) => {
        const { name, value } = evt.target;

        let updatedData = {
            ...data,
            [name]: value
        };

        if (name === "f_price" || name === "f_discount") {
            const price = name === "f_price" ? value : data.f_price;
            const discount = name === "f_discount" ? value : data.f_discount;

            if (price !== "" && discount !== "") {
                const p = Number(price);
                const d = Number(discount);

                if (!isNaN(p) && !isNaN(d)) {
                    updatedData.f_dprice = String(Math.floor(p - (p * d / 100)));
                }
            }
        }

        setData(updatedData);
    };

    const onSubmit = async () => {
        try {
            console.log("submit start");
            console.log("info:", infoFiles);
            console.log("others:", othersFiles);

            if (!thumbnail) {
                alert("썸네일 이미지를 선택해주세요.");
                return;
            }

            if (!data.f_name) {
                alert("가구 이름을 입력해주세요.");
                return;
            }

            const dto = {
                ...data,
                f_price: Number(data.f_price),
                f_dprice: Number(data.f_dprice),
                f_discount: Number(data.f_discount),
                f_point: Number(data.f_point),
                f_count: Number(data.f_count)
            };

            const sendData = {
                dto,
                thumbnail,
                infoFiles: infoFiles.map(i => i.file),
                othersFiles: othersFiles.map(i => i.file)
            };

            console.log("sendData:", sendData);

            const res = await FurnitureService.insertFurniture(sendData);
            console.log("등록 결과:", res);

            alert("가구가 등록되었습니다.");
            navigate(-1);

        } catch (error) {
            console.error("에러:", error);
            alert("가구 등록에 실패했습니다.");
        }
    };

    const onBack = () => {
        navigate("/furniture/list");
    };

    return (
        <div>
            <button onClick={onBack}>가구 리스트</button>
            <h3>가구 등록 페이지</h3>

            <label>가구 이름:</label>
            <input name="f_name" value={data.f_name} onChange={changeInput} />
            <br />

            <label>가구 가격:</label>
            <input name="f_price" value={data.f_price} onChange={changeInput} />
            <br />

            <p>할인가: {data.f_dprice}</p>

            <label>할인율:</label>
            <input name="f_discount" value={data.f_discount} onChange={changeInput} />
            <br/>

            <p>대표 이미지</p>
            <input type="file" accept="image/*" onChange={onChangeThumbnail} />

            {thumbnailPreview && (
                <img
                    src={thumbnailPreview}
                    style={{ width: "150px", height: "150px", objectFit: "cover" }}
                />
            )}

            <p>상세 이미지</p>
            <input type="file" multiple onChange={onChangeInfo} />

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {infoFiles.map((image, index) => (
                    <img
                        key={index}
                        src={image.preview}
                        style={{ width: "100px", height: "100px", objectFit: "cover" }}
                    />
                ))}
            </div>

            <p>이미지</p>
            <input type="file" multiple onChange={onChangeOthers} />

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {othersFiles.map((image, index) => (
                    <img
                        key={index}
                        src={image.preview}
                        style={{ width: "100px", height: "100px", objectFit: "cover" }}
                    />
                ))}
            </div>
          
            <label>카테고리1:</label>
            <input name="f_catagory1" value={data.f_catagory1} onChange={changeInput} />
            <br />

            <label>카테고리2:</label>
            <input name="f_catagory2" value={data.f_catagory2} onChange={changeInput} />
            <br />

            <label>카테고리3:</label>
            <input name="f_catagory3" value={data.f_catagory3} onChange={changeInput} />
            <br />

            <label>카테고리4:</label>
            <input name="f_catagory4" value={data.f_catagory4} onChange={changeInput} />
            <br />

            <label>카테고리5:</label>
            <input name="f_catagory5" value={data.f_catagory5} onChange={changeInput} />
            <br />

            <label>포인트:</label>
            <input name="f_point" value={data.f_point} onChange={changeInput} />
            <br />

            <label>수량:</label>
            <input name="f_count" value={data.f_count} onChange={changeInput} />
            <br />

            <br />
            <button onClick={onSubmit}>등록</button>
        </div>
    );
};

export default FurnitureAddPage;