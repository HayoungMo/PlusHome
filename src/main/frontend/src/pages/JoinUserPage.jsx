import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


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
        userId:'', password:'', telHead:'010',telMid:'',telTail:'',code:'',
        emailId:'', emailDomain:'none', addr:'', birthYear:'',birthMonth:'',
        birthDay:'',name:''
    });

    const [idCheck,setIdCheck] = useState({msg:'', ok:null})
    const [idFormatMsg,setIdFormatMsg] = useState('');
    const [pwCheck,setPwCheck] = useState('');
    const [isDirectInput, setIsDirectInput] = useState(false);
    const [errorMsg,setErrorMsg] =useState('');

    const{userId,password,emailId,emailDomain,} = form;

    const onText= (evt) =>{
        const{value,name} = evt.target;
        if(errorMsg) setErrorMsg('');
        if(name==='userId' && idFormatMsg) setIdFormatMsg('');

        if((name==='telMid' || name==='telTail') && isNaN(value)){
            setErrorMsg('숫자만 입력하세요.') 
            return
        }

        if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(value)) {
            if (name === 'userId') {
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

        if (name === 'userId') {
            if (/[^a-zA-Z0-9_]/.test(value)) {
                setIdFormatMsg('영문, 숫자, 언더스코어(_)만 입력 가능합니다');
                return;
            }
            setIdFormatMsg('');
            setIdCheck({ msg: '', ok: null });
        }

        // 이메일 도메인 select 변경
        if (name === 'emailDomain' && evt.target.tagName === 'SELECT') {
            setIsDirectInput(value === '');
            if (value === '') {
                setForm({ ...form, emailDomain: '' });
                return;
            }
        }
        
        setForm({ ...form, [name]: value });
    };

    const onCheckId = async () => {
        if (!userId.trim()) { setErrorMsg('아이디를 입력하세요'); return; }
        const res = await axios.get("http://localhost:8080/api/join/read");
        setIdCheck({ msg: res.data.message, ok: res.data.available });
    };

    const onNext = async () => {
        if (!idCheck.ok) { setErrorMsg('아이디 중복확인을 해주세요'); return; }
        if (!userId.trim()) { setErrorMsg('아이디를 입력해주세요'); return; }
        if (!password.trim()) { setErrorMsg('비밀번호를 입력해주세요'); return; }
        if (password !== pwCheck) { setErrorMsg('비밀번호가 일치하지 않습니다'); return; }
        if (!form.birthYear || !form.birthMonth || !form.birthDay) {
            setErrorMsg('생년월일을 모두 선택해주세요'); return;
        }
        if (emailId && (!emailDomain || emailDomain === 'none')) {
            setErrorMsg('이메일 도메인을 선택하거나 직접 입력해주세요'); return;
        }

        const tel = form.telHead + form.telMid + form.telTail;
        const birth = String(form.birthYear).slice(2) + form.birthMonth + form.birthDay;

        try {
            const email = (emailId && emailDomain && emailDomain !== 'none')
                ? emailId + emailDomain : '';
            const response = await axios.post('/joinService/joinService', {
                userId, password, tel, email, addr: form.addr, birth
            });
            if (response.data.success) {
                setErrorMsg(''); // 성공 시 에러 지우기
                setStep(2);
            }
        } catch (error) {
            setErrorMsg("이미 사용 중인 ID거나 저장에 실패하였습니다.");
        }
    };

    const year = Number(form.birthYear);
    const month = Number(form.birthMonth);
    const lastDay = (year&&month) ? new Date(year,month,0).getDate() : 31;


    return (
        <div>
            <h3>회원가입
                <span>SIGN UP</span>
            </h3>
             <label>아이디</label>   
             <div className=''>
                <input type='text' name='id' value={userId}
                onChange={onText}
                    placeholder='아이디 입력'
                    className=''/>
                    <button type='button' className=''
                    onClick={onCheckId}>중복확인</button>
             </div>
            
             <div className=''>
             <label>비밀번호</label>
             <input type='password' name='pw' value={password} onChange={onText}
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
                <input type='text' name='C_NAME'/>
            <label>업체주소</label>    
                <input type='text' name='C_ADDR'/>업체주소              
            </div>

            <div>
                <ul>
                    <li>
                        <input type='radio' id='userType1' name='userType' value='P'/>
                        <label>인테리어</label>
                    </li>
                    <li>
                        <input type='radio' id='userType2' name='userType' value='C'/>
                        <label>가구</label>
                    </li>        
                </ul>
            </div>

            <div>
                <ul>
                    <li>
                        <input type='radio' id='userType1' name='type' value='user'/>
                        <label>일반</label>
                    </li>
                    <li>
                        <input type='radio' id='userType2' name='type' value='company'/>
                        <label>기업</label>
                    </li>        
                </ul>
            </div>



            <div>
                <label>주민번호(사업자 등록번호)</label>
                <input type='text' value={form.code}
                    placeholder='주민번호'
                    className=''/>
            </div>

            <div>
                <label>이름(사업주명)</label>
                <input type='text' value={form.name}
                    placeholder='이름(사업주명)'
                    className=''/>
            </div>

            <div>
                <label>이메일</label>
                <input type='email' name='email' value={emailId}
                    onChange={onText}
                    placeholder='이메일 주소'
                    className=''/>
                     <select name="emailDomain" value={form.emailDomain} onChange={onText} className="custom-select">
                                    {email_Option.map(opt => (
                                        <option key={opt.label} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
            </div>

            
            <label>생년월일</label>
                <div className=''>
                <select name='birth' value={form.birthYear}
                onChange={onText} className=''>
                    <option value=''>연도</option>
                    {Array.from({ length: 80 }, (_, i) => 2007 - i).map(y =>
                    <option key={y} value={y}>{y}년</option>)}
                </select>
                <select name='birth' value={form.birthMonth} onChange={onText}>
                    <option>월</option>
                    {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(m =>
                        <option key={m} value={m}>{m}월</option>)}
                </select>
                <select name="birth" value={form.birthDay} onChange={onText} className="">
                    <option value="">일</option>
                    {Array.from({ length: lastDay }, (_, i) => String(i + 1).padStart(2, '0')).map(d =>
                        <option key={d} value={d}>{d}일</option>)}
                </select>                  
            </div>

           
            <label>전화번호</label>
            <div className=''>
                <select name='tel' value={form.telHead} onChange={onText}
                className=''>
                    <option value='010'>010</option>
                    <option value='011'>011</option>
                </select>
                <input type='text' name='tel' value={form.telMid}
                onChange={onText} maxLength={4}
                     className=''/>
                <input type='text' name='tel' value={form.telTail}
                onChange={onText} maxLength={4} className=''/>
            </div>

            <div>
                <ul>
                    <li>
                        <input type='radio' id='gender1' name='gender' value='male'/>
                        <label>남자</label>
                    </li>
                    <li>
                        <input type='radio' id='gender2' name='gender' value='female'/>
                        <label>여자</label>
                    </li>
                    <li>
                        <input type='radio' id='gender3' name='gender' value='none'/>
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