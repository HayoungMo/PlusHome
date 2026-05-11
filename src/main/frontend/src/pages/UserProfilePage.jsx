import React, { useState } from 'react';
import UserPageService from '../service/UserPageService';

const UserProfilePage = ({user, setUser, setLoginUser}) => {
    const [mode, setMode] = useState("view")
    const [password, setPassword] = useState("")
    const [form, setForm] = useState({
        email: user?.email || "",
        pw: "",
        pwConfirm: "",
        tel: user?.tel || "",
        addr: user?.addr || "",
    })
    
    if(!user){
        return <div>회원 정보를 불러올 수 없습니다.</div>
    }

    const onVerifyPassword = () => {
        if(!password.trim()){
            alert("비밀번호를 입력해주세요")
            return
        }

        UserPageService.verifyMyPagePassword(password)
        .then(()=> {
            setMode("edit")
            setPassword("")
        })
        .catch((error)=>{
            console.error(error)
            setPassword("")
            alert("비밀번호가 일치하지 않습니다.")
        })
    }
    
    const onChange = (evt) =>{
        const {name, value} = evt.target
        setForm({
            ...form,
            [name]: value
        })
    }

    const formatDate = (dataValue) =>{
        if(!dataValue){
            return "-"
        }

        return String(dataValue).slice(0,10)
    }

    const formatGender = (gender) => {
    if (gender === "female") {
        return "여자";
    }

    if (gender === "male") {
        return "남자";
    }

    return "알 수 없음";
    };

    const onUpdate= () => {
        if(form.pw && form.pw !== form.pwConfirm){
            alert("새 비밀번호가 일치하지 않습니다.")
            return
        }
        
        const updateData = {
            email: form.email,
            pw: form.pw,
            tel: form.tel,
            addr: form.addr
        }

        UserPageService.updateMyPageUser(updateData)
        .then((res)=>{
            setUser(res.data)
            setLoginUser?.(res.data.id)
            localStorage.setItem("user", JSON.stringify(res.data))

            alert("회원 정보가 수정되었습니다.")
            setMode("view")
        })
        .catch((error)=>{
            console.error(error)
            alert("회원 정보 수정에 실패했습니다.")
        })
    }
    return (
    <section>
            <h2>회원 정보</h2>
                {mode === "view" && (
            <>
            <div className="user-profile-detail">
                <p>아이디: {user.id}</p>
                <p>회원 유형: {user.type}</p>
                <p>이름: {user.name}</p>
                <p>이메일: {user.email}</p>
                <p>생년월일: {formatDate(user.birth)}</p>
                <p>전화번호: {user.tel}</p>
                <p>성별: {formatGender(user.gender)}</p>
                <p>주소: {user.addr}</p>
            </div>

            <button type="button" onClick={() => setMode("verify")}>
                회원 정보 수정
            </button>
            </>

            
        )}

        {mode === "verify" && (
            <div className="user-password-check">
            <h3>비밀번호 확인</h3>
            <input
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(evt) => setPassword(evt.target.value)}
            />
            <button type="button" onClick={onVerifyPassword}>
                확인
            </button>
            <button type="button" onClick={() => setMode("view")}>
                취소
            </button>
            </div>
        )}

        {mode === "edit" && (
        <div className="user-profile-edit">

            <label>
            새 비밀번호
            <input
                type="password"
                name="pw"
                value={form.pw}
                onChange={onChange}
            />
            </label>

            <label>
            새 비밀번호 확인
            <input
                type="password"
                name="pwConfirm"
                value={form.pwConfirm}
                onChange={onChange}
            />
            </label>

          <label>
            이메일
            <input name="email" value={form.email} onChange={onChange} />
          </label>

          <label>
            전화번호
            <input name="tel" value={form.tel} onChange={onChange} />
          </label>

          <label>
            주소
            <input name="addr" value={form.addr} onChange={onChange} />
          </label>

          <button type="button" onClick={onUpdate}>
            수정 완료
          </button>
          <button type="button" onClick={() => setMode("view")}>
            취소
          </button>
        </div>
      )}
    </section>
    );
};

export default UserProfilePage;