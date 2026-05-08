import React, { useState, useEffect } from 'react';
import FurnitureService from "../service/furnitureService";
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getImgDirSimple } from '../resources/function/GetImgDir';

const FurnitureUpdatePage = () => {

    const navigate = useNavigate();
    const { f_code } = useParams();
    const [searchParams] = useSearchParams();
    const page = searchParams.get("page") || "1"

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

    const [oldThumbnail, setOldThumbnail] = useState(null)
    const [oldInfoImages, setOldInfoImages] = useState([])
    const [oldOthersImages, setOldOthersImages] = useState([])
    const [deletedImages, setDeletedImages] = useState([])

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await FurnitureService.getFurnitureItem(f_code)
                setData(res)

                const imageList = res.imageList || []

                const thumbnailImg = imageList.find(
                    img=> img.img_tag === "THUMBNAIL")
                
                setOldThumbnail(thumbnailImg || null)

                if(thumbnailImg){
                    setThumbnailPreview(
                        getImgDirSimple({
                            kind: thumbnailImg.img_kind,
                            name: thumbnailImg.img_name
                        })
                    );
                }

                setOldInfoImages(
                    imageList.filter(img=> img.img_tag === "INFO")
                )

                setOldOthersImages(
                    imageList.filter(img=> img.img_tag === "OTHERS")
                )
            } catch (error) {
                console.error(error);
                alert("데이터 불러오기 실패");
            }
        };

        loadData();
    }, [f_code]);

    useEffect(() => {
        const price = Number(data.f_price);
        const discount = Number(data.f_discount);

        const result =
            (!isNaN(price) && !isNaN(discount))
                ? Math.floor(price - (price * discount / 100))
                : 0;

        setData(prev => ({
            ...prev,
            f_dprice: String(result)
        }));
    }, [data.f_price, data.f_discount]);

    const onChangeThumbnail = (evt) => {
        const file = evt.target.files[0];
        if (!file) return;

        setThumbnail(file);
        setThumbnailPreview(URL.createObjectURL(file));
    };

    const onChangeInfo = (evt) => {
        const files = Array.from(evt.target.files);

        oldInfoImages.forEach(img => {
            addDeletedImage(img.img_name);
        });

        setOldInfoImages([]);

        const mapped = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        setInfoFiles(mapped);
    };

    const onChangeOthers = (evt) => {
        const files = Array.from(evt.target.files);

        oldOthersImages.forEach(img => {
            addDeletedImage(img.img_name);
        });

        setOldOthersImages([]);

        const mapped = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        setOthersFiles(mapped);
    };

    const addDeletedImage = (img_name) => {
        setDeletedImages(prev => {
            if (prev.includes(img_name)) return prev;
            return [...prev, img_name];
        });
    };

    const onDeleteOldInfoImage = (img) => {
        addDeletedImage(img.img_name);

        setOldInfoImages(prev =>
            prev.filter(item => item.img_name !== img.img_name)
        );
    };

    const onDeleteOldOthersImage = (img) => {
        addDeletedImage(img.img_name);

        setOldOthersImages(prev =>
            prev.filter(item => item.img_name !== img.img_name)
        );
    };

    const changeInput = (evt) => {
        const { name, value } = evt.target;

        const numberFields = [
            "f_price",
            "f_discount",
            "f_point",
            "f_count"
        ];

        if (numberFields.includes(name)) {
            let numStr = value.replace(/[^0-9]/g, "");

            if (numStr === "") {
                setData(prev => ({
                    ...prev,
                    [name]: ""
                }));
                return;
            }

            let num = Number(numStr);

            let updatedData = { ...data };

            if (name === "f_price") {
                if (num <= 0) num = 1;
                updatedData.f_price = String(num);
            }

            if (name === "f_discount") {
                if (num < 0) num = 0;
                if (num > 99) num = 99;
                updatedData.f_discount = String(num);
            }

            if (name === "f_point") {
                if (num < 0) num = 0;
                updatedData.f_point = String(num);
            }

            if (name === "f_count") {
                if (num < 0) num = 0;
                updatedData.f_count = String(num);
            }

            setData(updatedData);
            return;
        }

        setData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const onUpdate = async () => {
        try {
            if (!data.f_name) {
                alert("가구 이름을 입력해주세요.");
                return;
            }

            const dto = {
                ...data,
                f_code,
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
                othersFiles: othersFiles.map(i => i.file),
                deletedImages
            };

            await FurnitureService.updateFurniture(sendData);

            alert("수정 완료");
            navigate(`/furniture/article/${f_code}?page=${page}`);

        } catch (error) {
            console.error(error);
            alert("수정 실패");
        }
    };

    const onBack = () => {
        navigate("/furniture/list");
    };

    return (
        <div>
            <button onClick={onBack}>가구 리스트</button>

            <h3>가구 수정 페이지</h3>

            <label>가구 이름:</label>
            <input name="f_name" value={data.f_name} onChange={changeInput} />
            <br />

            <label>가구 가격:</label>
            <input name="f_price" value={data.f_price} onChange={changeInput} />
            <br />

            <p>할인가: {data.f_dprice}</p>

            <label>할인율:</label>
            <input name="f_discount" value={data.f_discount} onChange={changeInput} />
            <br />

            <p>기존 대표 이미지</p>
            {oldThumbnail && !thumbnail && (
                <img
                    src={getImgDirSimple({
                        kind: oldThumbnail.img_kind,
                        name: oldThumbnail.img_name
                    })}
                    style={{ width: "150px", height: "150px", objectFit: "cover" }}
                    alt=""
                />
            )}

            <p>대표 이미지 교체</p>
            <input type="file" accept="image/*" onChange={onChangeThumbnail} />

            {thumbnail && thumbnailPreview && (
                <img
                    src={thumbnailPreview}
                    style={{ width: "150px", height: "150px", objectFit: "cover" }}
                    alt=""
                />
            )}

            <p>기존 상세 이미지</p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
                {oldInfoImages.map((img) => (
                    <div key={img.img_name}>
                        <img
                            src={getImgDirSimple({
                                kind: img.img_kind,
                                name: img.img_name
                            })}
                            style={{ width: "120px", height: "120px", objectFit: "cover" }}
                            alt=""
                        />
                        <button type="button" onClick={() => onDeleteOldInfoImage(img)}>
                            삭제
                        </button>
                    </div>
                ))}
            </div>

            <p>새 상세 이미지</p>
            <input type="file" multiple onChange={onChangeInfo} />

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
                {infoFiles.map((item, index) => (
                    <img
                        key={index}
                        src={item.preview}
                        style={{ width: "120px", height: "120px", objectFit: "cover" }}
                        alt=""
                    />
                ))}
            </div>

            <p>기존 이미지</p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
                {oldOthersImages.map((img) => (
                    <div key={img.img_name}>
                        <img
                            src={getImgDirSimple({
                                kind: img.img_kind,
                                name: img.img_name
                            })}
                            style={{ width: "120px", height: "120px", objectFit: "cover" }}
                            alt=""
                        />
                        <button type="button" onClick={() => onDeleteOldOthersImage(img)}>
                            삭제
                        </button>
                    </div>
                ))}
            </div>

            <p>새 이미지</p>
            <input type="file" multiple onChange={onChangeOthers} />

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
                {othersFiles.map((item, index) => (
                    <img
                        key={index}
                        src={item.preview}
                        style={{ width: "120px", height: "120px", objectFit: "cover" }}
                        alt=""
                    />
                ))}
            </div>

            <br /><br />

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
            <button onClick={onUpdate}>수정</button>
        </div>
    );
};

export default FurnitureUpdatePage;