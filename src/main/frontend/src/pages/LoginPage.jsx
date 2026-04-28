import axios from 'axios';
import React, { useState } from 'react';

const LoginPage = () => {
    
    const [step,setStep] = useState(3);
    const [idFormatMsg, setIdFormatMsg] = useState('');
    const [errorMsg,setErrorMsg] = useState('');

    const onText = (evt)=>{
        const {value,name} = evt.target;

        //사용자가 다시 입력하기 시작하면 에러 메시지 삭제됨
        if(errorMsg) setErrorMsg('');
        
        //아이디 입력 시 기존 경고 사라짐        
        if(name==='userId' &&idFormatMsg) setIdFormatMsg('');

        //아이디 한글 금지
        if(/[ㄱ-ㅎ ㅏ - ㅣ 가-힣]/.test(value)){
            if(step===3){
                setErrorMsg('한글 키보드가 켜져있습니다. 영문으로 전환하십시오.')
            }else{
                setIdFormatMsg('아이디에 한글은 입력할 수 없습니다.')
            }
        }else{
                setErrorMsg('한글은 입력할 수 없습니다.')
            }
            return;
    }

    //아이디 특수기호 금지
    if(name==='userId'){
        if(/[^a-zA-Z0-9_]/.test(value)){
            setIdFormatMsg('영문,숫자,언더스코어(_)만 가능합니다.')
            return;
        }
        setIdFormatMsg('');
    }

    const onLogin = async()=>{
        try{
            const response = await axios.post('/api/login',{userId,
                password});
                if(response.data.success) {
                    localStorage.setItem('userId', response.data.userId);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                    setLoginUser(response.data.userId);
                    setLoginInfo(response.data.user);
                    window.scrollTo({top: 0, behavior:'instant'})
                    navigator('/')                    
                }
        }catch(error) {
            setErrorMsg("로그인 중 서버 오류")
        }
    }

    return (
        <div>
            <h3>로그인
                <span>Login</span>
            </h3>

            <label>아이디</label>
            <input type='text' name='userId' value={userId} onChange={onText}
                placeholder='아이디 입력'/>
            <label>비밀번호</label>
            <input type='password' name='password' value={password} onChange={onText}
                placeholder='비밀번호 입력'/>
            
            {/*로그인 에러 메시지*/}
            {errorMsg &&(
                <span initial={{opacity:0, x:-10}} animate={{opacity: 1,x:0}} exit={{opacity:0}}>
                    {errorMsg}
                </span>                
            )}

            <button 
                className='' onClick={onLogin}
                whileHover={{scale: 1.01}}
                whileTap={{scale: 0.98}}>
                로그인
            </button>

            <p className=''>
                계정이 없으신가요?
                <a href='' onClick={(e)=>{e.preventDefault();
                setErrorMsg(''); setStep(1); }} >회원가입</a>              
            </p>
            <p>SNS계정으로 간편 로그인/회원가입</p>
        </div>
    );
};

export default LoginPage;