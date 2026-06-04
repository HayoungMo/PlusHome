import React, { useState } from 'react';
import UserPageService from '../service/userPageService';
import AddressSearchForm from "../maps/AddressSearchForm"
import { Snackbar } from "@mui/material";
import AlertMui from "../components/AlertMui";

const UserProfilePage = ({
  user, 
  setUser, 
  setLoginUser, 
  onDeleteClick,
}) => {
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

    const [verifying, setVerifying] = useState(false)
    const [updating, setUpdating] = useState(false)

    const [alert, setAlert] = useState({
      open: false,
      severity: "info",
      title: "",
      text: "",
    })
    
    const showAlert = ({ severity = "info", title = "", text = "" }) => {
      setAlert({
        open: true,
        severity,
        title,
        text,
      });
    };

    const closeAlert = () => {
      setAlert((prev) => ({
        ...prev,
        open: false,
      }));
    };

    if(!user){
        return <div>회원 정보를 불러올 수 없습니다.</div>
    }

    const onVerifyPassword = () => {
      if (verifying) return;

        if(!password.trim()){
            setPasswordError("비밀번호를 입력해주세요.");
            return;
        }

        setVerifying(true)

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
        .finally(()=>{
          setVerifying(false)
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
      if(updating) return

        if(form.pw && form.pw !== form.pwConfirm){
            showAlert({
              severity: "warning",
              title: "비밀번호 확인",
              text: "새 비밀번호가 일치하지 않습니다.",
            });
            return;
        }
        
        const email = form.email.trim()
        const tel = form.tel.trim()

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const telRegex = /^01[016789]\d{7,8}$/;

        if (email && !emailRegex.test(email)) {
          showAlert({
            severity: "warning",
            title: "이메일 확인",
            text: "이메일 형식이 올바르지 않습니다.",
          });
          return;
        }

        if (tel && !telRegex.test(tel)) {
          showAlert({
            severity: "warning",
            title: "전화번호 확인",
            text: "전화번호는 하이픈 없이 입력해주세요.",
          });
          return;
        }

        setUpdating(true)

        const updateData = {
          email,
          pw: form.pw,
          tel,
          addr: [form.addr1, form.addr2].filter(Boolean).join("__"),
        };

        UserPageService.updateMyPageUser(updateData)
        .then((res)=>{
            setUser(res.data)
            setLoginUser?.(res.data.id)
            localStorage.setItem("user", JSON.stringify(res.data))

            showAlert({
              severity: "success",
              title: "수정 완료",
              text: "회원 정보가 수정되었습니다.",
            });
            setMode("view")
        })
        .catch((error)=>{
            console.error(error)
            showAlert({
              severity: "error",
              title: "수정 실패",
              text: "회원 정보 수정에 실패했습니다.",
            });
        })
        .finally(()=>{
          setUpdating(false)
        })
    }

    const feedback = (
      <Snackbar
        open={alert.open}
        autoHideDuration={3000}
        onClose={closeAlert}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <div>
          <AlertMui
            severity={alert.severity}
            title={alert.title}
            text={alert.text}
            onClose={closeAlert}
          />
        </div>
      </Snackbar>
    )
    return (
      <>
      {feedback}
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
              <button 
                type="button" 
                className="primary" 
                disabled={verifying}
                onClick={onVerifyPassword}>
                
                {verifying ? "확인 중" : "확인"}
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
                <AddressSearchForm
                  title="주소"
                  description="주소 검색 버튼을 눌러 주소를 선택하고 상세주소를 입력하세요."
                  form={form}
                  setForm={setForm}
                  mapHeight="260px"
                  compact
                  addressKeys={{ base: "addr1", detail: "addr2", full: "addr" }}
                />
              </div>

            </div>
          </div>

          <div className="user-form-actions">
            <button
              type="button"
              className="primary"
              disabled={updating}
              onClick={onUpdate}
            >
              {updating ? "수정 중" : "수정 완료"}
            </button>
            <button
              type="button"
              onClick={() => {
                setForm((prev) => ({
                  ...prev,
                  pw: "",
                  pwConfirm: "",
                }));
                setMode("view");
              }}
            >
              취소
            </button>
            
          </div>
        </div>
      )}
      </section>
      </>
    );
};

export default UserProfilePage;