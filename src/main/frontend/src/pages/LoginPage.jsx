import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginService from '../service/loginService';
import { TextField } from '@mui/material';
//
const LoginPage = ({ loginUser, setLoginUser, setLoginInfo }) => {

    console.log("props:",loginUser,setLoginUser)

    const navigate = useNavigate();

    const [form, setForm] = useState({
        id: '',
        pw: ''
    });

    const [errorMsg, setErrorMsg] = useState('');
    const [idFormatMsg, setIdFormatMsg] = useState('');
    const [step,setStep] = useState(3);

    // 입력 처리
    const onText = (e) => {
        
        const { name, value } = e.target;

        // 에러 초기화
        setErrorMsg('');
        setIdFormatMsg('');

        // 한글 체크
        if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(value)) {
            if (name === 'id') {
                setIdFormatMsg('아이디에 한글은 입력할 수 없습니다.');
            } else {
                setErrorMsg('비밀번호는 영문으로 입력하세요.');
            }
            return;
        }

        // 아이디 특수문자 제한
        if (name === 'id' && /[^a-zA-Z0-9_]/.test(value)) {
            setIdFormatMsg('영문, 숫자, _(언더스코어)만 가능합니다.');
            return;
        }
        // 정상 입력
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 로그인
    const onLogin = async () => {
        if (!form.id || !form.pw) {
            setErrorMsg('아이디와 비밀번호를 입력하세요.');
            return;
        }

        try {
            const response = await LoginService.postLogin(form);
            console.log("로그인 응답:", response)
            console.log("토큰:",response.token)
            
            if (response.success) {
                const user = response.user;

                localStorage.setItem('id', response.user.id);
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('token',response.token)

                console.log("저장된 토큰:",localStorage.getItem("token"))

                setLoginUser(user.id);
                setLoginInfo(user);

                if(user.type==='company'){
                    navigate('/interior/list')
                }else{
                    navigate('/')
                }
                
            } else {
                setErrorMsg(response.message);
            }

        } catch (error) {
            console.log("에러:",error)
            setErrorMsg('서버 오류가 발생했습니다.');
        }
    };

    //로그아웃
    const logout = () => {
        localStorage.removeItem(`wishList_${loginUser}`);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("id");
        
        setLoginUser(null);
        setLoginInfo(null);

        navigate("/login")
        
    }

    return (
        <div>
            <h3>로그인
                <span>Login</span>
            </h3>
        <form
            onSubmit={(e) => {e.preventDefault(); //새로고침 방지
                onLogin();
        }}
        >
            
            <TextField
                label="아이디"
                type="text"
                name="id"
                value={form.id}
                onChange={onText}
            />
            {idFormatMsg && <div style={{ color: 'red' }}>{idFormatMsg}</div>}

           
            <TextField
                label="비밀번호"
                type="password"
                name="pw"
                value={form.pw}
                onChange={onText}
            />

            {errorMsg && <div style={{ color: 'red' }}>{errorMsg}</div>}

            {loginUser ? (
                <>
                    <span>{loginUser}님</span>
                    <button onClick={logout}>
                        로그아웃
                    </button>
                </>
            ):(
                 <button type='submit' disabled={!form.id || !form.pw}>
                    로그인
                </button>
            )}

           

            
        </form>
            <p>
                계정이 없으신가요?
                <a href="/join"
                   onClick={() => {                     
                       setErrorMsg(''); 
                       navigate('/join')
                   }}>
                    회원가입
                </a>
                <br/>

                <a href='/findId'>
                    아이디 찾기
                </a>  / 
                
                <a href='/findPw'>
                    비밀번호 찾기
                </a>              

            </p>
        </div>
    );
};

export default LoginPage;