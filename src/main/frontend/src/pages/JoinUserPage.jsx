import axios from 'axios';
import React, { useState } from 'react';
import { Await, useNavigate } from 'react-router-dom';
import JoinService from "../service/joinService";
import { Select, TextField } from '@mui/material';
import RadioMui from '../components/RadioMui';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import DatePickerMui from '../components/DatePickerMui';
import SelectMui from '../components/SelectMui';
import Address from '../maps/Address';



const email_Option =[
    {value:'none', title: '--- 선택 ---'},
    {value:'@naver.com', title: '@naver.com'},
    {value:'@gmail.com', title: '@gmail.com'},
    {value:'@daum.net', title: '@daum.net'},
    {value:'@nate.com', title: '@nate.com'},
    {value:'direct',title: '직접입력'}
]

const JoinUserPage = () => {

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
        const newTel = {...tel,[name]:value}
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
        if(!form.id) return '아이디를 입력하세요.'
        if(!form.pw) return '비밀번호를 입력하세요.'
        if(form.pw !==pwCheck) return '비밀번호가 일치하지 않습니다.'
        if(!birth) return '생년월일 선택.'

        return '';
    }

    

    const onText= (evt) =>{
        const{value,name} = evt.target;

        const error = validate(name,value)

        if(error){
            if(name==='id'){
                setIdFormatMsg(error)
            }else{
                setErrorMsg(error)
            }
            return
        }

        setErrorMsg('')
        if (name==='id') setIdFormatMsg('')

            setForm(prev=> ({
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


    const [idError,setIdError] = useState('')

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
      <div>
        
        <h2>
          회원가입
          <span>SIGN UP</span>
        </h2>
        <div className="">
          <TextField
            label="아이디"
            name="id"
            value={form.id}
            onChange={onText}
          />
          <button type="button" className="" onClick={onCheckId}>
            중복확인
          </button>
        </div>
        {idFormatMsg && <div style={{ color: "red" }}>{idFormatMsg}</div>}
        {idCheck.msg && (
          <div style={{ color: idCheck.ok ? "green" : "red" }}>
            {idCheck.msg}
          </div>
        )}
        <div className="">
          <TextField
            label="비밀번호"
            type="password"
            name="pw"
            value={form.pw}
            onChange={onText}
          />
        </div>
        <div>
          <TextField
            label="비밀번호 확인"
            type="password"
            value={pwCheck}
            onChange={(e) => setPwCheck(e.target.value)}
          />

          {form.pw !== pwCheck && pwCheck && (
              <div style={{ color: "red" }}>
                 비밀번호가 일치하지 않습니다.
              </div>
          )}

        </div>

           <div>
          <li>
            <input type="radio" name="type" value="user" onChange={onText} />
            <label>일반</label>
          </li>
          <li>
            <input type="radio" name="type" value="company" onChange={onText} />
            <label>기업</label>
          </li>
        </div>

        {form.type === "company" && (
          <>
            <div className="">
              <TextField
                label="업체명"
                type="text"
                name="c_name"
                value={form.c_name}
                onChange={onText}
              />
            </div>

            <div>
              <Address isC={true} form={form} setForm={setForm} />
              <TextField
                label="업체주소"
                type="text"
                name="c_addr2"
                value={form.c_addr2}
                onChange={onText}
              />
            </div>

            <div>
              <li>
                <input
                  type="radio"
                  name="c_kind"
                  value="interior"
                  onChange={onText}
                />
                <label>인테리어</label>
              </li>
              <li>
                <input
                  type="radio"
                  name="c_kind"
                  value="shop"
                  onChange={onText}
                />
                <label>가구</label>
              </li>
            </div>
          </>
        )}
       
        <div>
          <TextField
            label="이름(사업주명)"
            type="text"
            name="name"
            value={form.name}
            onChange={onText}
          />
        </div>
        <div>
          <TextField
            label="주민번호(사업자 등록번호)"
            type="text"
            name="code"
            value={form.code}
            onChange={onText}
          />
        </div>
        <div>
          <Address isC={false}  form={form} setForm={setForm} />
          <TextField
            label="상세주소"
            type="text"
            name="addr2"
            value={form.addr2}
            onChange={onText}
          />
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <TextField
            label="이메일"
            placeholder={
              email.domain === "direct" ? "example@domain.com" : "아이디 입력"
            }
            value={email.id}
            onChange={(e) =>
              setEmail((prev) => ({
                ...prev,
                id: e.target.value,
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
                domain: e.target.value,
              }))
            }
          />
        </div>
        <DatePickerMui label="생년월일" value={birth} onChange={onBirth} />
        <label>전화번호</label>
        <div className="">
          <Select name="head" value={tel.head} onChange={onTel} className="">
            <option value="010">010</option>
            <option value="011">011</option>
          </Select>
          <TextField
            type="text"
            name="mid"
            value={tel.mid}
            onChange={onTel}
            maxLength={4}
            className=""
          />
          <TextField
            type="text"
            name="tail"
            value={tel.tail}
            onChange={onTel}
            maxLength={4}
            className=""
          />
        </div>
        <div>
          <RadioMui
            label="성별"
            name="gender"
            value={form.gender}
            onChange={onText}
            labelList={[
              { value: "male", title: "남자" },
              { value: "female", title: "여자" },
              { value: "none", title: "선택안함" },
            ]}
          />
        </div>
        <button type="button" className="" onClick={onNext}>
          가입하기
        </button>
        <button className="">
          <a href="/">뒤로가기</a>
        </button>
        이미 아이디가 있으신가요?
        <a href="/login">로그인</a>
      </div>
    );
};

export default JoinUserPage;