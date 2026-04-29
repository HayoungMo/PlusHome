import axios from 'axios';
import React, { useState } from 'react';
import { Await, useNavigate } from 'react-router-dom';
import JoinService from "../service/joinService";


const email_Option =[
    {value:'none', label: '--- 선택 ---'},
    {value:'@naver.com', label: '@naver.com'},
    {value:'@gmail.com', label: '@gmail.com'},
    {value:'@daum.net', label: '@daum.net'},
    {value:'@nate.com', label: '@nate.com'},
    {value:'',label: '직접입력'}
]

const JoinUserPage = () => {
    const [step,setStep] = useState(3);
    const navigate = useNavigate();
    const [form,setForm]=useState({
        id:'', pw:'',type:'', code:'', name:'',
        email:'', birth:'', tel:'',gender:'', addr:'',
        
    });

    const [idCheck,setIdCheck] = useState({msg:'', ok:null})
    const [idFormatMsg,setIdFormatMsg] = useState('');
    const [pwCheck,setPwCheck] = useState('');
    const [isDirectInput, setIsDirectInput] = useState(false);
    const [errorMsg,setErrorMsg] =useState('');
    
    const [email,setEmail] = useState({
        id:'',
        domain:'',
    })

    const onEmail = (evt) =>{
        const{name,value} = evt.target
        const newEmail = {...email, [name]:value}

        setEmail(newEmail)

        setForm(prev =>({
            ...prev,
            email: newEmail.id + newEmail.domain
        }))
    }
    

    const [birth,setBirth]=useState({
        year:'',
        month:'',
        day:''
    })

    const onBirth = (evt) =>{
        const{name,value} = evt.target
        const newBirth = {...birth,[name]:value}
        
        setBirth(newBirth)

        setForm(prev=>({
            ...prev,
            birth:`${newBirth.year}-${newBirth.month}-${newBirth.day}`
        }))
    }


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

    const onText= (evt) =>{
        const{value,name} = evt.target;
        if(errorMsg) setErrorMsg('');
        if(name==='userId' && idFormatMsg) setIdFormatMsg('');

        if((name==='telMid' || name==='telTail') && isNaN(value)){
            setErrorMsg('숫자만 입력하세요.') 
            return
        }

        if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(value)) {
            if (name === 'id') {
                if(step===3){
                     setIdFormatMsg('아이디에 한글은 입력할 수 없습니다');
                } else {
                setErrorMsg('한글은 입력할 수 없습니다');
            }
        }else{
            setErrorMsg('한글은 입력할 수 없습니다.')
            }
            return;
        }

        if (name === 'id') {
            if (/[^a-zA-Z0-9_]/.test(value)) {
                setIdFormatMsg('영문, 숫자, 언더스코어(_)만 입력 가능합니다');
                return;
            }
            setIdFormatMsg('');
            setIdCheck({ msg: '', ok: null });
        }

        // 이메일 도메인 select 변경
        if (name === 'newEmail.domain' && evt.target.tagName === 'SELECT') {
            setIsDirectInput(value === '');
            if (value === '') {
                setForm({ ...form, newEmail: '' });
                return;
            }
        }
        
        setForm(prev =>({ ...prev, [name]: value }));
    };

    const onCheckId = async () => {
        if (!form.id.trim()) { setErrorMsg('아이디를 입력하세요'); return; }
        const res = await axios.get("http://localhost:8080/api/join/read",{params:{id:form.id}});
        setIdCheck({ msg: res.data.message, ok: res.data.available });
    };

    const onNext = async () => {
        if (!idCheck.ok) { setErrorMsg('아이디 중복확인을 해주세요'); return; }
        if (!form.id.trim()) { setErrorMsg('아이디를 입력해주세요'); return; }
        if (!form.pw.trim()) { setErrorMsg('비밀번호를 입력해주세요'); return; }
        if (form.pw !== pwCheck) { setErrorMsg('비밀번호가 일치하지 않습니다'); return; }
        if (!birth.year || !birth.month || !birth.day) {
            setErrorMsg('생년월일을 모두 선택해주세요'); 
            return;
        }

        const finalForm ={
            ...form,
            email:email.id && email.domain && email.domain !=='none'
            ? email.id + email.domain
            : '',
            tel:tel.head + tel.mid + tel.tail,
            birth: `${birth.year}-${birth.month}-${birth.day}`
        }        

        try {
           const res = await axios.post('/joinService/joinService',finalForm)
                     
            if (res.data.success) {
                setStep(2);
            }
        } catch (error) {
            setErrorMsg("이미 사용 중인 ID거나 저장에 실패하였습니다.");
        }
    };

    const year = Number(birth.year);
    const month = Number(birth.month);
    const lastDay = (year&&month) ? new Date(year,month,0).getDate() : 31;


    return (
        <div>
            <h3>회원가입
                <span>SIGN UP</span>
            </h3>
             <label>아이디</label>   
             <div className=''>
                <input type='text' name='id' value={form.id}
                onChange={onText}
                    placeholder='아이디 입력'
                    className=''/>
                    <button type='button' className=''
                    onClick={onCheckId}>중복확인</button>
             </div>
            
             <div className=''>
             <label>비밀번호</label>
             <input type='password' name='pw' value={form.pw} onChange={onText}
                placeholder='비밀번호 입력'
                className=''/>
            </div>

            <div>
                <label>비밀번호 확인</label>
                <input type='password' value={pwCheck}
                    onChange={(e)=>setPwCheck(e.target.value)}
                    placeholder='비밀번호 재입력'
                    className=''/>
            </div>

            <label>업체명</label>
            <div className=''>
                <input type='text' name='C_NAME' value='C_NAME'/>
            <label>업체주소</label>    
                <input type='text' name='C_ADDR' value='C_ADDR'/>업체주소              
            </div>

            <div>
                <ul>
                    <li>
                        <input type='radio'  name='c_kind' value='interior'/>
                        <label>인테리어</label>
                    </li>
                    <li>
                        <input type='radio'  name='c_kind' value='shop'/>
                        <label>가구</label>
                    </li>        
                </ul>
            </div>

            <div>
                <ul>
                    <li>
                        <input type='radio' name='type' value='user' onChange={onText}/>
                        <label>일반</label>
                    </li>
                    <li>
                        <input type='radio' name='type' value='company' onChange={onText}/>
                        <label>기업</label>
                    </li>        
                </ul>
            </div>



            <div>
                <label>주민번호(사업자 등록번호)</label>
                <input type='text' name= 'code' value={form.code} onChange={onText}
                    placeholder='주민번호'
                    className=''/>
            </div>

            <div>
                <label>주소</label>
                <input type='text' name= 'addr' value={form.addr} onChange={onText}
                    placeholder='주소'
                    className=''/>
            </div>

            <div>
                <label>이메일</label>
                <input type='email' name='id' value={email.id}
                    onChange={onEmail}
                    placeholder='이메일 주소'
                    className=''/>
                     <select name="domain" value={email.domain} onChange={onEmail} className="custom-select">
                                    {email_Option.map(opt => (
                                        <option key={opt.label} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
            </div>

            
            <label>생년월일</label>
                <div className=''>
                <select name='year'
                onChange={onBirth} className=''>
                    <option value=''>연도</option>
                    {Array.from({ length: 80 }, (_, i) => 2007 - i).map(y =>
                    <option key={y} value={y}>{y}년</option>)}
                </select>
                <select name='month' onChange={onBirth}>
                    <option>월</option>
                    {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(m =>
                        <option key={m} value={m}>{m}월</option>)}
                </select>
                <select name="day" onChange={onBirth} className="">
                    <option value="">일</option>
                    {Array.from({ length: lastDay }, (_, i) => String(i + 1).padStart(2, '0')).map(d =>
                        <option key={d} value={d}>{d}일</option>)}
                </select>                  
            </div>

           
            <label>전화번호</label>
            <div className=''>
                <select name='head' value={tel.head} onChange={onTel}
                className=''>
                    <option value='010'>010</option>
                    <option value='011'>011</option>
                </select>
                <input type='text' name='mid' value={tel.mid}
                onChange={onTel} maxLength={4}
                     className=''/>
                <input type='text' name='tail' value={tel.tail}
                onChange={onTel} maxLength={4} className=''/>
            </div>

            <div>
                <ul>
                    <li>
                        <input type='radio' name='gender' value='male' onChange={onText}/>
                        <label>남자</label>
                    </li>
                    <li>
                        <input type='radio' name='gender' value='female' onChange={onText}/>
                        <label>여자</label>
                    </li>
                    <li>
                        <input type='radio' id='gender3' name='gender' value='none' onChange={onText}/>
                        <label>선택안함</label>
                    </li>           
                </ul>
            </div>

            <button className=''
                onClick={onNext}>
                    가입하기
            </button>

            <button className='' onClick={() => {setStep(3)
                setErrorMsg('')
            }}>뒤로가기</button>

        이미 아이디가 있으신가요?
        <a href='/login'>로그인</a>    
        </div>
    );
};

export default JoinUserPage;