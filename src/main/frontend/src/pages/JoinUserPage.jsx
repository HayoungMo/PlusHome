import axios from 'axios';
import React, { useState } from 'react';
import { Await, useNavigate } from 'react-router-dom';
import JoinService from "../service/joinService";
import { Button, Select, TextField } from '@mui/material';
import RadioMui from '../components/RadioMui';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import DatePickerMui from '../components/DatePickerMui';
import SelectMui from '../components/SelectMui';
import Address from '../maps/Address';
import "../css/JoinPage.css";



const email_Option =[
    {value:'none', title: '--- 선택 ---'},
    {value:'@naver.com', title: '@naver.com'},
    {value:'@gmail.com', title: '@gmail.com'},
    {value:'@daum.net', title: '@daum.net'},
    {value:'@nate.com', title: '@nate.com'},
    {value:'direct',title: '직접입력'}
]

const JoinUserPage = () => {

    const [pwError,setPwError] = useState('')
    const [nameError,setNameError] = useState('')
    const [codeError,setCodeError] = useState('')

    const navigate = useNavigate();
    const [form,setForm]=useState({
        id:'', pw:'',type:'user', code:'', name:'',
        email:'', birth:'', tel:'',gender:'', addr1:'',addr2:'',
        
        //company
        c_addr1:'',c_addr2:'',c_name:'',c_kind:''
        
    });

    const [idCheck,setIdCheck] = useState({msg:'', ok:null})
    const [idFormatMsg,setIdFormatMsg] = useState('');
    const [pwCheck,setPwCheck] = useState('');
    const [isDirectInput, setIsDirectInput] = useState(false);
    const [errorMsg,setErrorMsg] =useState('');
    const [idError,setIdError] = useState('');
   
        
    const [email,setEmail] = useState({
        id:'',
        domain:'none',
        direct:''
    })

      

    const [birth,setBirth]=useState(null);


    const [tel,setTel] = useState({
        head: '010',
        mid:'',
        tail:'',
    })

    const onTel = (evt) => {
        const {name,value}=evt.target

        const onlyNumber = value
        .replace(/[^0-9]/g,'')
        .slice(0,4)

        const newTel = {...tel,
          [name]:value ==='head'
                  ? value
                  :onlyNumber} 
        setTel(newTel);

        setForm(prev =>({
            ...prev,
            tel: newTel.head + newTel.mid + newTel.tail
        }))
    } 

   const finalEmail =
    email.domain === 'none'
        ? ''
        : email.domain === 'direct'
        ? email.id.trim()
        : email.id + email.domain;
   

    const onBirth = (evt) =>{
        setBirth(evt);

        setForm(data => ({
            ...data,
            birth:evt
            ? evt.format("YYYY-MM-DD")
            :''
        }))
    } 

    const validate = (name, value) => {
    switch (name) {
        case 'id':
            if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(value)) {
                return '아이디에 한글은 입력할 수 없습니다';
            }
            if (/[^a-zA-Z0-9_]/.test(value)) {
                return '영문, 숫자, _ 만 사용 가능합니다';
            }

            return '';

        case 'telMid':
        case 'telTail':
            if (isNaN(value)) {
                return '숫자만 입력하세요';
            }
            return '';

        default:
            // 나머지는 제한 없음 (한글 허용)
            return '';
    }
       

    
};

    const validateAll = () =>{
        if(!form.id) return '아이디는 필수 정보입니다.';
        if(!form.pw) return '비밀번호를 입력하세요.'
        if(form.pw !==pwCheck) return '비밀번호가 일치하지 않습니다.'
        if(!birth) return '생년월일 선택.'

        return '';
    }

    

    const onText= (evt) =>{

    const {value,name} = evt.target;

    // 아이디 입력 시 에러 제거
    if(name === 'id'){

        if(value.trim()){
            setIdError('')
        }

    }

    // 비밀번호 입력 시 아이디 체크
    if(name === 'pw'){

        if(!form.id.trim()){
            setIdError('아이디는 필수 정보입니다.')
        }else{
            setIdError('')
        }

    }

    // 이름
    if(name === 'name'){

        if(!value.trim()){
            setNameError('이름을 입력하세요.')
        }else{
            setNameError('')
        }

    }

    // 주민번호
    if(name === 'code'){

        if(!value.trim()){
            setCodeError('주민번호를 입력하세요.')
        }else{
            setCodeError('')
        }

    }

    const error = validate(name,value)

    if(error){

        if(name === 'id'){
            setIdFormatMsg(error)
        }else{
            setErrorMsg(error)
        }

        return;
    }

    // 에러 없으면 제거
    if(name === 'id'){
        setIdFormatMsg('')
    }

    setErrorMsg('')

    // 주민번호 숫자만
    if(name === 'code'){

        const onlyNumber = value
            .replace(/[^0-9]/g,'')
            .slice(0,13)

        setForm(prev => ({
            ...prev,
            code: onlyNumber
        }));

        return;
    }

    setForm(prev => ({
        ...prev,
        [name]: value
    }))

}      

        

    const onCheckId = async () => {
        console.log("id 값:",form.id)

        
        if (!form.id.trim()) { 
            setIdError('아이디를 입력하세요'); 
            return; 
        }

        try{
        const res = await JoinService.checkId(form.id);

        setIdCheck({
            msg: res.message,
            ok: res.available
        })
        console.log("res:", res)
        
        }catch(error){
            console.log(error);
            setErrorMsg("중복 확인 실패")
        }

    };


    const onNext = async () => {
        console.log("클릭이 되긴 하나?")
       const error = validateAll();
       
       console.log("검증결과:",error)

       if(error) {
        setErrorMsg(error);
        return
       }
    

        const finalForm = {
          ...form,
          email: finalEmail,
          tel: tel.head + tel.mid + tel.tail,
          birth: birth ? birth.format("YYYY-MM-DD") : "",
          addr: form.addr1 + "__" + form.addr2,
          companyDto:
            form.type === "company"
              ? {
                  c_name: form.c_name,
                  c_addr: form.c_addr1 + "__" + form.c_addr2,
                  c_kind: form.c_kind,
                  c_boss: form.name,
                }
              : null,
        };

       
        console.log("데이터가 가는중임:",finalForm)
         
        
        try {
            let res;           

            if(finalForm.type==="company") {
                res = await JoinService.postJoin(finalForm);
            }else{
                res = await JoinService.postJoin(finalForm);
            }

            console.log("서버 응답:",res)
            alert("회원가입에 성공하였습니다.")
            navigate("/login")            
        } catch (error) {
            console.log(error)
            alert("가입에 실패하였습니다.")

            }
            

        
    };


     return (

        <div className="join-wrap">

            <div className="join-box">

                <h2 className="join-title">
                    회원가입
                    <span>SIGN UP</span>
                </h2>

                {/* 아이디 */}

                <div className="join-input">

                    <div className="id-row">

                        <TextField
                            fullWidth
                            label="아이디"
                            name="id"
                            value={form.id}
                            onChange={onText}
                        />

                        <Button
                            type="button"
                            color='inherit'
                            className="id-check-btn"
                            variant='contained'
                            onClick={onCheckId}
                        >
                            중복확인
                        </Button>

                    </div>

                   {idError && (
                      <div className="error-msg">
                          {idError}
                      </div>
                  )}

                  {idFormatMsg && (
                      <div className="error-msg">
                          {idFormatMsg}
                      </div>
                  )}

{/* 형식 오류가 없을 때만 중복확인 메시지 표시 */}
{!idFormatMsg && idCheck.msg && (
    <div className={idCheck.ok ? "success-msg" : "error-msg"}>
        {idCheck.msg}
    </div>
)}

                </div>

                {/* 비밀번호 */}

                <div className="join-input">

    <TextField
        fullWidth
        label="비밀번호"
        type="password"
        name="pw"
        value={form.pw}
        onChange={onText}

        onFocus={() => {

            if(!form.id.trim()){
                setIdError('아이디는 필수 정보입니다.')
            }

        }}

        onBlur={() => {

            if(!form.pw.trim()){
                setPwError('비밀번호를 입력하세요.')
            }else{
                setPwError('')
            }

        }}
    />

    {pwError && (
        <div className="error-msg">
            {pwError}
        </div>
    )}

</div>

                {/* 비밀번호 확인 */}

                <div className="join-input">

                    <TextField
                        fullWidth
                        label="비밀번호 확인"
                        type="password"
                        value={pwCheck}
                        onChange={(e) => setPwCheck(e.target.value)}
                    />

                    {form.pw !== pwCheck && pwCheck && (

                        <div className="error-msg">
                            비밀번호가 일치하지 않습니다.
                        </div>

                    )}

                </div>

                {/* 회원 타입 */}

                <div className="radio-wrap">

                    <label>
                        <input
                            type="radio"
                            name="type"
                            value="user"
                            checked={form.type === "user"}
                            onChange={onText}
                        />
                        일반
                    </label>

                    <label>
                        <input
                            type="radio"
                            name="type"
                            value="company"
                            checked={form.type === "company"}
                            onChange={onText}
                        />
                        기업
                    </label>

                </div>

                {/* 기업 */}

                {form.type === "company" && (

                    <>

                        <div className="join-input">

                            <TextField
                                fullWidth
                                label="업체명"
                                type="text"
                                name="c_name"
                                value={form.c_name}
                                onChange={onText}
                            />

                        </div>

                        <div className="address-wrap">

                            <Address
                                isC={true}
                                form={form}
                                setForm={setForm}
                            />

                            <TextField
                                fullWidth
                                label="업체 상세주소"
                                type="text"
                                name="c_addr2"
                                value={form.c_addr2}
                                onChange={onText}
                            />

                        </div>

                        <div className="radio-wrap">

                            <label>
                                <input
                                    type="radio"
                                    name="c_kind"
                                    value="interior"
                                    onChange={onText}
                                />
                                인테리어
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="c_kind"
                                    value="shop"
                                    onChange={onText}
                                />
                                가구
                            </label>

                        </div>

                    </>

                )}

                {/* 이름 */}

                <div className="join-input">

                    <TextField
                        fullWidth
                        label="이름(사업주명)"
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={onText}

                         onBlur={() => {

                          if(!form.name.trim()){
                              setNameError('이름은 필수 정보입니다.')
                          }else{
                              setNameError('')
                          }

                      }}
                  />
    

                    {nameError && (
                        <div className="error-msg">
                            {nameError}
                        </div>
                    )}

                </div>

                {/* 주민번호 */}

                <div className="join-input">

                    <TextField
                        fullWidth
                        label="주민번호(사업자 등록번호)"
                        type="text"
                        name="code"
                        value={form.code}
                        onChange={onText}
                        
                        onBlur={() => {

                          if(!form.code.trim()){
                              setCodeError('주민번호(사업자 등록번호)는 필수입니다.')
                          }else{
                              setCodeError('')
                          }

                      }}
                  />
                    {codeError && (
                        <div className="error-msg">
                            {codeError}
                        </div>
                    )}

                </div>

                {/* 주소 */}

                <div className="address-wrap">

                    <Address
                        isC={false}
                        form={form}
                        setForm={setForm}
                    />

                    <TextField
                        fullWidth
                        label="상세주소"
                        type="text"
                        name="addr2"
                        value={form.addr2}
                        onChange={onText}
                    />

                </div>

                {/* 이메일 */}

                <div className="email-wrap">

                    <TextField
                        fullWidth
                        label="이메일"
                        placeholder={
                            email.domain === "direct"
                            ? "example@domain.com"
                            : "아이디 입력"
                        }
                        value={email.id}
                        onChange={(e) =>
                            setEmail((prev) => ({
                                ...prev,
                                id:e.target.value,
                            }))
                        }
                    />

                    <SelectMui
                        label="도메인"
                        value={email.domain}
                        option={email_Option}
                        onChange={(e) =>
                            setEmail((prev) => ({
                                ...prev,
                                domain:e.target.value,
                            }))
                        }
                    />

                </div>

                {/* 생년월일 */}

                <div className="join-input">

                    <DatePickerMui
                        label="생년월일"
                        value={birth}
                        onChange={onBirth}
                    />

                </div>

                {/* 전화번호 */}

                <div className="tel-wrap">

              <Select
                  native
                  name="head"
                  value={tel.head}
                  onChange={onTel}
                  className="tel-select"
              >
                  <option value="010">010</option>
                  <option value="011">011</option>
                  <option value="011">016</option>
                  <option value="011">019</option>
              </Select>

              <TextField
                  type="text"
                  label='전화번호'
                  name="mid"
                  value={tel.mid}
                  onChange={onTel}
                  className="tel-input"
              />

              <TextField
                  type="text"
                  label='전화번호'
                  name="tail"
                  value={tel.tail}
                  onChange={onTel}
                  className="tel-input"
              />

          </div>

                {/* 성별 */}

                <div className="join-input">

                    <RadioMui
                        
                        name="gender"
                        value={form.gender}
                        onChange={onText}
                        labelList={[
                            { value:"male", title:"남자" },
                            { value:"female", title:"여자" },
                            { value:"none", title:"선택안함" },
                        ]}
                    />

                </div>

                {/* 에러 */}

                {errorMsg && (
                    <div className="error-msg">
                        {errorMsg}
                    </div>
                )}

                {/* 버튼 */}

                <Button
                    color='primary'
                    variant='contained'
                    className="join-btn"
                    onClick={onNext}
                >
                    가입하기
                </Button>

                <button className="back-btn">

                    <a href="/">
                        뒤로가기
                    </a>

                </button>

                {/* 하단 */}

                <div className="join-footer">

                    이미 아이디가 있으신가요?

                    <a href="/login">
                        로그인
                    </a>

                </div>

            </div>

        </div>
    );
};


export default JoinUserPage;