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
import { common } from '@mui/material/colors';



const email_Option =[
    {value:'none', title: '--- 선택 ---'},
    {value:'@naver.com', title: '@naver.com'},
    {value:'@gmail.com', title: '@gmail.com'},
    {value:'@daum.net', title: '@daum.net'},
    {value:'@nate.com', title: '@nate.com'},
    {value:'direct',title: '직접입력'}
]

const JoinUserPage = () => {
    

    const [codeFront,setCodeFront] = useState('')
    const [codeBack,setCodeBack] = useState('')
    

    const navigate = useNavigate();
    const [form,setForm]=useState({
        id:'', pw:'',type:'user', code:'', name:'',
        email:'', birth:'', tel:'',gender:'', addr1:'',addr2:'',
        
        //company
        c_addr1:'',c_addr2:'',c_name:'',c_kind:''
        
    });

    const [idCheck,setIdCheck] = useState({msg:'', ok:null})
    const [pwCheck,setPwCheck] = useState('');
    const [errorMsg,setErrorMsg] =useState({
        id:'',
        idFormat:'',
        pw:'',
        name:'',
        email:'',
        birth:'',
        code:'',
        c_name:'',
        c_addr:'',
        common:'',
    });
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
            if (
        !/^(?=.*[a-z])(?=.*[0-9])[a-z0-9_-]{5,20}$/.test(value)
    ) {

        return;

    }

    return;

    case 'pw':
         if(
        !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/.test(value)
    ){
        return '비밀번호 8~16자의 영문 대/소문자, 숫자, 특수문자를 사용해 주세요.';
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
        // 아이디
    if(!form.id.trim()){
        return '아이디는 필수 정보입니다.';
    }

    // 아이디 형식
    if(
        !/^(?=.*[a-z])(?=.*[0-9])[a-z0-9_-]{5,20}$/.test(form.id)
    ){
        return '아이디는 5~20자의 영문 소문자, 숫자와 특수기호(_),(-)만 사용 가능합니다.';
    }

    // 중복확인 안했을 때
    if(!idCheck.ok){
        return '아이디 중복확인을 해주세요.';
    }

    // 비밀번호
    if(!form.pw.trim()){
        return '비밀번호를 입력하세요.';
    }
    if(
    !/^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[a-z\d!@#$%^&*]{8,16}$/.test(form.pw)
    ){
        return '비밀번호 8~16자의 영문 소문자, 숫자, 특수문자를 사용해 주세요.';
    }

    // 비밀번호 확인
    if(form.pw !== pwCheck){
        return '비밀번호가 일치하지 않습니다.';
    }

    // 이름
    if(!form.name.trim()){
        return '이름(사업주명)은 필수 정보입니다.';
    }

    // 주민번호
    if(!form.code.trim()){
        return '주민번호(사업자 등록번호)는 필수입니다.';
    }

    //생년월일
    if(!birth){
        return '생년월일을 선택하세요.'
    }
   
    //이메일
    if(!email.id.trim()){
        return '이메일을 입력해 주세요.'
    }
    if(email.domain === 'none'){
    return '이메일 도메인을 선택해 주세요.';
    }

    if(email.domain === 'direct' && !email.id.includes('@')){
        return '올바른 이메일 형식으로 입력해 주세요.';
    }

    //기업회원의 업체명, 업체주소, 업체 상세주소
    if(form.type==='company'){
        if(!form.c_name.trim()){
            return '업체명을 입력해 주세요.'
        }

        if(!form.c_addr1.trim()){
            return '업체 주소를 입력해 주세요.'
        }

        if(!form.c_addr2.trim()){
            return '업체 상세주소를 입력해 주세요.'
        }

        if(!form.c_kind.trim()){
            return '가구 / 인테리어 중 선택하세요.'
        }

    
    }

    
    

    return '';

}

    

    const onText= (evt) =>{

    const {value,name} = evt.target;

    // 아이디 입력 시 에러 제거
    if(name === 'id'){

    // 한글 입력 차단
    if(/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(value)){
        return;
    }

    // 중복확인 초기화
    setIdCheck({
        msg:'',
        ok:null
    })

    // 아이디 에러 제거
    setErrorMsg(prev => ({
        ...prev,
        id:''
    }))

}

    // 비밀번호 입력 시 아이디 체크
    if(name === 'pw'){

    if(!form.id.trim()){

        setErrorMsg(prev => ({
            ...prev,
            id:'아이디는 필수 정보입니다.'
        }))

    }else{

        setErrorMsg(prev => ({
            ...prev,
            id:''
        }))

    }

}
    // 이름
    if(name === 'name'){

    if(!value.trim()){

        setErrorMsg(prev => ({
            ...prev,
            name:'이름(사업주명)은 필수 정보입니다.'
        }))

    }else{

        setErrorMsg(prev => ({
            ...prev,
            name:''
        }))

    }

}

   // 주민번호 / 사업자번호
if(name === 'code' || name === 'codeFront' || name === 'codeBack'){

    if(form.type === 'user'){

        if(!codeFront.trim() || !codeBack.trim()){

            setErrorMsg(prev => ({
                ...prev,
                code:'주민번호는 필수 정보입니다.'
            }))

        }else{

            setErrorMsg(prev => ({
                ...prev,
                code:''
            }))

        }

    }else{

        if(!value.trim()){

            setErrorMsg(prev => ({
                ...prev,
                code:'사업자등록번호는 필수 정보입니다.'
            }))

        }else{

            setErrorMsg(prev => ({
                ...prev,
                code:''
            }))

        }

    }

}

    const error = validate(name,value)

if(error){

    if(name === 'id'){

        setErrorMsg(prev => ({
            ...prev,
            idFormat:error
        }))

    }

    if(name === 'pw'){

        setErrorMsg(prev => ({
            ...prev,
            pw:error
        }))

    }

}else{

    if(name === 'id'){

        setErrorMsg(prev => ({
            ...prev,
            idFormat:''
        }))

    }

    if(name === 'pw'){

        setErrorMsg(prev => ({
            ...prev,
            pw:''
        }))

    }

}

    // 주민번호 숫자만
    if(name === 'code'){

        const maxLength = form.type === 'company' ? 10 : 13

        const onlyNumber = value
            .replace(/[^0-9]/g,'')
            .slice(0,maxLength)

        setForm(prev => ({
            ...prev,
            code: onlyNumber
        }));

        return;
    }

    setForm(prev => ({
        ...prev,
        [name]: 
        name==='id'
        ? value.slice(0,20)
        : value

    }))

}      

        

    const onCheckId = async () => {
        console.log("id 값:",form.id)

        
        if (!form.id.trim()) {

    setErrorMsg(prev => ({
        ...prev,
        id:'아이디를 입력하세요'
    }))

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

    setErrorMsg(prev => ({
        ...prev,
        common:'중복 확인 실패'
    }))

}
    }


    const onNext = async () => {
        console.log("클릭이 되긴 하나?")
       const error = validateAll();
       
       console.log("검증결과:",error)

       if(error) {

    setErrorMsg(prev => ({
        ...prev,
        common:error
    }))

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
                            label="[필수] 아이디"
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

                  {errorMsg.id && (
                        <div className="error-msg">
                            {errorMsg.id}
                        </div>
                    )}

                    {errorMsg.idFormat && (
                        <div className="error-msg">
                            {errorMsg.idFormat}
                        </div>
                    )}

                    <div className="guide-msg">
                            5~20자의 영문 소문자, 숫자와 특수기호(_),(-)만 사용 가능합니다.
                        </div>


                    {!errorMsg.idFormat && idCheck.msg && (
                        <div className={idCheck.ok ? "success-msg" : "error-msg"}> 
                            {idCheck.msg}
                        </div>
                    )}



                </div>

                {/* 비밀번호 */}

                <div className="join-input">

    <TextField
        fullWidth
        label="[필수] 비밀번호"
        type="password"
        name="pw"
        value={form.pw}
        onChange={onText}

        onFocus={() => {

                    if(!form.id.trim()){
                        setErrorMsg(prev => ({
                    ...prev,
                    id:'아이디는 필수 정보입니다.'
                }))

            }

        }}

        onBlur={() => {

    if(!form.pw.trim()){

        setErrorMsg(prev => ({
            ...prev,
            pw:'비밀번호는 필수 정보입니다.'
        }))

    }else{

        setErrorMsg(prev => ({
            ...prev,
            pw:''
        }))

    }

}}
    />

        {errorMsg.pw && (
        <div className="error-msg">
            {errorMsg.pw}
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
                                label="[필수] 업체명"
                                type="text"
                                name="c_name"
                                value={form.c_name}
                                onChange={onText}

                                onBlur={() => {

                        if(!form.c_name.trim()){

                            setErrorMsg(prev => ({
                                ...prev,
                                c_name:'업체명을 입력해 주세요.'
                            }))

                        }else{

                            setErrorMsg(prev => ({
                                ...prev,
                                c_name:''
                            }))

                        }

                    }}
                />
                        

                        </div>

                        {errorMsg.c_name && (
                            <div className="error-msg">
                                {errorMsg.c_name}
                            </div>
                        )}

                        <div className="address-wrap">

                            <Address
                                isC={true}
                                form={form}
                                setForm={setForm}
                            />

                            <TextField
                                fullWidth
                                label="[필수] 업체 상세주소"
                                type="text"
                                name="c_addr2"
                                value={form.c_addr2}
                                onChange={onText}
                            />

                        </div>

                        {errorMsg.c_addr && (
                            <div className="error-msg">
                                {errorMsg.c_addr}
                            </div>
                        )}

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
                         label={form.type === 'company'
                            ? '[필수] 사업주명'
                            : '[필수] 이름'
                        }
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={onText}

                         onBlur={() => {

                          if(!form.name.trim()){
                              setErrorMsg(prev => ({
                                ...prev,
                                name:'이름은 필수 정보입니다.'
                            }))
                          }else{
                              setErrorMsg(prev => ({
                                ...prev,
                                name:''
                            }))
                          }

                      }}
                  />
    

                    {errorMsg.name && (
                        <div className="error-msg">
                            {errorMsg.name}
                        </div>
                    )}
                </div>

                {/* 주민번호 / 사업자등록번호 */}

<div className="join-input">

    {form.type === 'user' ? (

        <div className="code-wrap">

            <TextField
                label="[필수] 주민번호 앞자리"
                name="codeFront"
                value={codeFront}

                onChange={(e) => {

                    const value = e.target.value
                        .replace(/[^0-9]/g,'')
                        .slice(0,6)

                    setCodeFront(value)

                    setForm(prev => ({
                        ...prev,
                        code: value + codeBack
                    }))

                }}

                onBlur={() => {

            if(!codeFront.trim() || !codeBack.trim()){

                setErrorMsg(prev => ({
                    ...prev,
                    code:'주민번호는 필수 정보입니다.'
                }))

            }else{

                setErrorMsg(prev => ({
                    ...prev,
                    code:''
                }))

            }

        }}
            />

            <span>-</span>

            <TextField
                label="[필수] 주민번호 뒷자리"
                type="password"
                name="codeBack"
                value={codeBack}

                onChange={(e) => {

                    const value = e.target.value
                        .replace(/[^0-9]/g,'')
                        .slice(0,7)

                    setCodeBack(value)

                    setForm(prev => ({
                        ...prev,
                        code: codeFront + value
                    }))

                }}
                onBlur={() => {

                if(!codeFront.trim() || !codeBack.trim()){

                    setErrorMsg(prev => ({
                        ...prev,
                        code:'주민번호는 필수 정보입니다.'
                    }))

                }else{

                    setErrorMsg(prev => ({
                        ...prev,
                        code:''
                    }))

                }

            }}
            />

        </div>

    ) : (

        <TextField
            fullWidth
            label="[필수] 사업자등록번호"
            name="code"
            value={form.code}

            onChange={(e) => {

                const value = e.target.value
                    .replace(/[^0-9]/g,'')
                    .slice(0,10)

                setForm(prev => ({
                    ...prev,
                    code: value
                }))

            }}
        />

    )}

        {errorMsg.code && (
        <div className="error-msg">
            {errorMsg.code}
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
                        label="[필수] 이메일"
                        placeholder={
                            email.domain === "direct"
                            ? "example@naver.com"
                            : ""
                        }
                        value={email.id}
                        onChange={(e) => {

    const value = e.target.value;

    setEmail((prev) => ({
        ...prev,
        id:value,
    }))

    if(!value.trim()){

        setErrorMsg(prev => ({
            ...prev,
            email:'이메일을 입력해 주세요.'
        }))

    }else{

        setErrorMsg(prev => ({
            ...prev,
            email:''
        }))

    }

}}
                    />

                    <SelectMui
                        label="도메인"
                        value={email.domain}
                        option={email_Option}
                       onChange={(e) => {

    const value = e.target.value;

    setEmail((prev) => ({
        ...prev,
        domain:value,
    }))

    if(value === 'none'){

        setErrorMsg(prev => ({
            ...prev,
            email:'이메일 / 도메인을 입력해 주세요.'
        }))

    }else{

        setErrorMsg(prev => ({
            ...prev,
            email:''
        }))

    }

}}
                    />

                </div>

                {errorMsg.email && (
        <div className="error-msg">
            {errorMsg.email}
        </div>
    )}

                {/* 생년월일 */}

                <div className="join-input">

                    <DatePickerMui
    label="[필수] 생년월일"
    value={birth}

    onChange={(value) => {

        onBirth(value);

        if(!value){

            setErrorMsg(prev => ({
                ...prev,
                birth:'생년월일을 선택하세요.'
            }))

        }else{

            setErrorMsg(prev => ({
                ...prev,
                birth:''
            }))

        }

    }}
/>

{errorMsg.birth && (
    <div className="error-msg">
        {errorMsg.birth}
    </div>
)}

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
                  label='[선택] 전화번호'
                  name="mid"
                  value={tel.mid}
                  onChange={onTel}
                  className="tel-input"
              />

              <TextField
                  type="text"
                  label='[선택] 전화번호'
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

                {errorMsg.common && (
                    <div className="error-msg">
                        {errorMsg.common}
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