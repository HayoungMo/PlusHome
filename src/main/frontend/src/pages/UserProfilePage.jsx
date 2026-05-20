import React, { useState } from 'react';
import UserPageService from '../service/userPageService';
import Address from "../maps/Address";

const UserProfilePage = ({user, setUser, setLoginUser, onDeleteClick}) => {
    const [mode, setMode] = useState("view")
    const [password, setPassword] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [form, setForm] = useState({
        email: user?.email || "",
        pw: "",
        pwConfirm: "",
        tel: user?.tel || "",
        addr: user?.addr || "",
        addr1: user?.addr?.split("__")?.[0] || "",
        addr2: user?.addr?.split("__")?.[1] || "",
      });
    
    if(!user){
        return <div>회원 정보를 불러올 수 없습니다.</div>
    }

    const onVerifyPassword = () => {
        if(!password.trim()){
            setPasswordError("비밀번호를 입력해주세요.");
            return;
        }

        UserPageService.verifyMyPagePassword(password)
        .then(()=> {
            setMode("edit")
            setPassword("")
            setPasswordError("")
        })
        .catch((error)=>{
            console.error(error)
            setPassword("")
            setPasswordError("비밀번호가 일치하지 않습니다.")
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
          addr: [form.addr1, form.addr2].filter(Boolean).join("__"),
        };

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
        {mode === "view" && (
        <div className="user-profile-panel">
          <div className="user-profile-panel-title">
            내 프로필
          </div>

          <div className="user-profile-list">
            <div className="user-profile-list-row">
              <span>아이디</span>
              <p>{user.id}</p>
            </div>

            <div className="user-profile-list-row">
              <span>이름</span>
              <p>{user.name}</p>
            </div>

            <div className="user-profile-list-row">
              <span>전화번호</span>
              <p>{user.tel || "-"}</p>
            </div>

            <div className="user-profile-list-row">
              <span>이메일</span>
              <p>{user.email || "-"}</p>
            </div>

            <div className="user-profile-list-row">
              <span>생년월일</span>
              <p>{formatDate(user.birth)}</p>
            </div>

            <div className="user-profile-list-row">
              <span>성별</span>
              <p>{formatGender(user.gender)}</p>
            </div>

            <div className="user-profile-list-row">
              <span>주소</span>
              <p>{user.addr || "-"}</p>
            </div>
          </div>

          <div className="user-profile-panel-actions">
            <button
              type="button"
              onClick={() => {
                setPassword("");
                setPasswordError("");
                setMode("verify");
              }}
            >
              회원 정보 수정
            </button>
            <button type="button" className="danger" onClick={onDeleteClick}>
              회원 탈퇴
            </button>
          </div>
        </div>
      )}

        {mode === "verify" && (
          <div className="user-password-card">
            <h3>비밀번호 확인</h3>
            <p>회원 정보를 수정하려면 비밀번호를 입력해주세요.</p>

            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(evt) => {
                setPassword(evt.target.value);
                setPasswordError("");
              }}
              onKeyDown={(evt) => {
                if (evt.key === "Enter") {
                  onVerifyPassword();
                }
              }}
            />

            {passwordError && (
              <p className="user-password-error">{passwordError}</p>
            )}

            <div className="user-password-actions">
              <button type="button" className="primary" onClick={onVerifyPassword}>
                확인
              </button>
              <button
                type="button"
                onClick={() => {
                  setPassword("");
                  setPasswordError("");
                  setMode("view");
                }}
              >
                취소
              </button>
            </div>
          </div>
        )}

        {mode === "edit" && (
        <div className="user-edit-panel">
          <div className="user-edit-panel-title">회원 정보 수정</div>

          <div className="user-edit-form">
            <label className="user-edit-field">
              <span>새 비밀번호</span>
              <input
                type="password"
                name="pw"
                value={form.pw}
                onChange={onChange}
                placeholder="변경할 비밀번호를 입력해주세요."
              />
            </label>

            <label className="user-edit-field">
              <span>새 비밀번호 확인</span>
              <input
                type="password"
                name="pwConfirm"
                value={form.pwConfirm}
                onChange={onChange}
                placeholder="비밀번호를 다시 입력해주세요."
              />
            </label>

            <label className="user-edit-field">
              <span>이메일</span>
              <input name="email" value={form.email} onChange={onChange} />
            </label>

            <label className="user-edit-field">
              <span>전화번호</span>
              <input name="tel" value={form.tel} onChange={onChange} />
            </label>

            <div className="user-edit-address">
              <span>주소</span>

              <div className="user-address">
                <Address isC={false} form={form} setForm={setForm} mapHeight="360px" />
              </div>

              <input
                className="user-address-detail-input"
                name="addr2"
                value={form.addr2 || ""}
                onChange={onChange}
                placeholder="상세주소"
              />

              <p className="user-address-help-text">
                아파트 이름이 다를 경우 상세주소를 수정해주세요.
              </p>
            </div>
          </div>

          <div className="user-form-actions">
            <button type="button" className="primary" onClick={onUpdate}>
              수정 완료
            </button>
            <button type="button" onClick={() => setMode("view")}>
              취소
            </button>
            
          </div>
        </div>
      )}
      </section>
    );
};

export default UserProfilePage;