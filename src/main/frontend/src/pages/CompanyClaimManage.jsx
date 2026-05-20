import React,{useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom"
import OrderClaimService from '../service/orderClaimService';
import ImageService from "../service/imageService";
import Loading from '../components/Loading';

const calimTypeText = (type) => {
    return Number(type) === 1 ? "교환" : "반품"
}

const claimStatusText = (status) => {
    switch (Number(status)){
        case -1:
            return "거절";
        case 0:
            return "신청완료";
        case 1:
            return "접수";
        case 2:
            return "처리중";
        case 3:
            return "처리완료";
        default:
            return "상태확인중";
    }
}

const CompanyClaimManage = () => {
    const navigate = useNavigate()
    const [claimList, setClaimList] = useState([])
    const [editedList, setEditedList] = useState([])
    const [selectedCodes, setSelectedCodes] = useState([])
    const [openedImages, setOpenedImages] = useState({})
    const [loading, setLoding] = useState(true)

    useEffect(()=> {
        loadClaims()
    }, [])

    const loadClaims = async () => {
        try{
            const list = await OrderClaimService.getCompanyClaims()

            setClaimList(list || [])
            setEditedList(list || [])
            setSelectedCodes([])
        }catch (error){
            console.error("교환/반품 목록 조회 실패", error)
            alert("교환 / 반품 목록을 불러오지 못했습니다.")
        }finally {
            setLoding(false)
        }
    }

    const toggleSelect = (claimCode) => {
        setSelectedCodes(prev=>
            prev.includes(claimCode)
            ? prev.filter(code => code !== claimCode)
            : [...prev,claimCode]
        )
    }

    const toggleSelectAll = () => {
        if (selectedCodes.length === editedList.length){
            setSelectedCodes([])
            return
        }

        setSelectedCodes(editedList.map(item=> item.claim_code))
    }

    const changeClaimField = (claimCode , field, value) => {
        setEditedList(prev => 
            prev.map(item =>
                item.claim_code === claimCode
                ? { ...item, [field]: Number(value)}
                : item
            )
        )
    }

    const getChangedSelectedClaims = () => {
        return editedList
            .filter(item => selectedCodes.includes(item.claim_code))
            .map(item => ({
                claim_code: item.claim_code,
                claim_type: Number(item.claim_type),
                claim_status: Number(item.claim_status)
            }))
    }

    const onSaveSelected = async () => {
        const updateList = getChangedSelectedClaims();

        if(updateList.length === 0){
            alert("선택된 교환/반품 내역이 없습니다.")
            return
        }

        if(!window.confirm("선택한 교환/반품 정보를 저장하시겠습니까?"))    
            return

        try{
            await OrderClaimService.updateBulk(updateList)
            alert("저장되었습니다.")
            await loadClaims()
        }catch(error){
            console.error("교환/반품 저장 실패", error)
            alert(error.response?.data?.message || "저장에 실패했습니다.")
        }
    }

    const onSaveOne = async (item) => {
        try{
            await OrderClaimService.updateClaim({
                claim_code : item.claim_code,
                claim_type : item.claim_type,
                claim_status : item.claim_status
            })

            alert("저장되었습니다.")
            await loadClaims()
        }catch(error){
            console.error("교환/반품 저장 실패", error)
            alert(error.response?.data?.message || "저장에 실패했습니다.")
        }
    }

    const toggleImages = async (item) => {
        if (openedImages[item.claim_code]) {
            setOpenedImages(prev => ({
                ...prev,
                [item.claim_code]: null
            }))
            return
        }

        try {
            const imageList = await ImageService.getImageData({
                kind: "CLAIM",
                a: item.claim_code,
                d: item.id,
                idx: -1
            })

            setOpenedImages(prev => ({
                ...prev,
                [item.claim_code]: imageList || []
            }))
        } catch (error) {
            console.error("이미지 조회 실패", error)
            alert("첨부 이미지를 불러오지 못했습니다.")
        }
    }

    if (loading) {
        return <Loading message="교환/반품 내역을 불러오는 중입니다."/>
    }

    return (
        <div style={{ padding: "20px" }}>
            <h3>교환/반품 관리</h3>

            <div style={{ marginBottom: "12px" }}>
                <button type="button" onClick={onSaveSelected}>
                    선택 저장
                </button>
            </div>

            {editedList.length === 0 ? (
                <div>등록된 교환/반품 신청이 없습니다.</div>
            ) : (
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        borderTop: "2px solid #222"
                    }}
                >
                    <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    checked={
                                        editedList.length > 0 &&
                                        selectedCodes.length === editedList.length
                                    }
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th>신청일</th>
                            <th>상품명</th>
                            <th>신청자</th>
                            <th>유형</th>
                            <th>상태</th>
                            <th>사유</th>
                            <th>이미지</th>
                            <th>저장</th>
                        </tr>
                    </thead>

                    <tbody>
                        {editedList.map(item => (
                            <React.Fragment key={item.claim_code}>
                                <tr style={{ borderBottom: "1px solid #ddd" }}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedCodes.includes(item.claim_code)}
                                            onChange={() => toggleSelect(item.claim_code)}
                                        />
                                    </td>

                                    <td>{item.claim_createddate || "-"}</td>
                                    
                                    <td>
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/furniture/article/${item.f_code}`)}
                                        style={{
                                            border: "none",
                                            background: "transparent",
                                            cursor: "pointer",
                                            textDecoration: "underline"
                                        }}
                                    >
                                        {item.f_name || item.f_code}
                                    </button>
                                    </td>

                                    <td>{item.id}</td>

                                    <td>
                                        <select
                                            value={item.claim_type}
                                            onChange={(e) =>
                                                changeClaimField(
                                                    item.claim_code,
                                                    "claim_type",
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value={1}>교환</option>
                                            <option value={2}>반품</option>
                                        </select>
                                    </td>

                                    <td>
                                        <select
                                            value={item.claim_status}
                                            onChange={(e) =>
                                                changeClaimField(
                                                    item.claim_code,
                                                    "claim_status",
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value={0}>신청완료</option>
                                            <option value={1}>접수</option>
                                            <option value={2}>처리중</option>
                                            <option value={3}>처리완료</option>
                                            <option value={-1}>거절</option>
                                        </select>
                                    </td>

                                    <td style={{ maxWidth: "280px" }}>
                                        {item.claim_reason}
                                    </td>

                                    <td>
                                        <button
                                            type="button"
                                            onClick={() => toggleImages(item)}
                                        >
                                            이미지 {openedImages[item.claim_code] ? "닫기" : "보기"}
                                        </button>
                                    </td>

                                    <td>
                                        <button
                                            type="button"
                                            onClick={() => onSaveOne(item)}
                                        >
                                            저장
                                        </button>
                                    </td>
                                </tr>

                                {openedImages[item.claim_code] && (
                                    <tr>
                                        <td colSpan={9}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "8px",
                                                    padding: "12px",
                                                    flexWrap: "wrap"
                                                }}
                                            >
                                                {openedImages[item.claim_code].length === 0 ? (
                                                    <span>첨부 이미지가 없습니다.</span>
                                                ) : (
                                                    openedImages[item.claim_code].map(img => (
                                                        <img
                                                            key={img.img_name}
                                                            src={`http://localhost:8080/api/images/CLAIM/${img.img_name}`}
                                                            alt=""
                                                            style={{
                                                                width: "100px",
                                                                height: "100px",
                                                                objectFit: "cover",
                                                                border: "1px solid #ddd"
                                                            }}
                                                        />
                                                    ))
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default CompanyClaimManage;