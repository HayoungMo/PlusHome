import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginService from '../service/loginService';

const LoginPage = ({ loginUser, setLoginUser, setLoginInfo }) => {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        userId: '',
        password: ''
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
            if (name === 'userId') {
                setIdFormatMsg('아이디에 한글은 입력할 수 없습니다.');
            } else {
                setErrorMsg('비밀번호는 영문으로 입력하세요.');
            }
            return;
        }

        // 아이디 특수문자 제한
        if (name === 'userId' && /[^a-zA-Z0-9_]/.test(value)) {
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
        if (!form.userId || !form.password) {
            setErrorMsg('아이디와 비밀번호를 입력하세요.');
            return;
        }

        try {
            const response = await LoginService.postLogin(form.id, form.password);

            if (response.data.success) {
                localStorage.setItem('id', response.data.id);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                setLoginUser(response.data.id);
                setLoginInfo(response.data.user);

                navigate('/');
            } else {
                setErrorMsg('아이디 또는 비밀번호가 틀렸습니다.');
            }

        } catch (error) {
            setErrorMsg('서버 오류가 발생했습니다.');
        }
    };

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
            <label>아이디</label>
            <input
                type="text"
                name="userId"
                value={form.userId}
                onChange={onText}
                placeholder="아이디 입력"
            />
            {idFormatMsg && <div style={{ color: 'red' }}>{idFormatMsg}</div>}

            <label>비밀번호</label>
            <input
                type="password"
                name="password"
                value={form.password}
                onChange={onText}
                placeholder="비밀번호 입력"
            />

            {errorMsg && <div style={{ color: 'red' }}>{errorMsg}</div>}

            <button type='submit' onClick={onLogin} disabled={!form.userId || !form.password}>
                로그인
            </button>
        </form>
            <p>
                계정이 없으신가요?
                <a href="#!"
                   onClick={(e) => {
                       e.preventDefault();
                       setErrorMsg(''); setStep(1); 
                   }}>
                    회원가입
                </a>
            </p>
        </div>
    );
};

export default LoginPage;