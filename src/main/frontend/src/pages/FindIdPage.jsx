import axios from 'axios';
import React, { useEffect, useState } from 'react';
import findService from '../service/findService';
import { useNavigate } from 'react-router-dom';
import { Button, TextField } from '@mui/material';
import userService from '../service/userService';
//
const FindIdPage = () => {

    const [form,setForm] = useState({
        email:'',
        name:'',
    })

    const [step,setStep] = useState(1)



    const onChange = (evt) =>{
        const {name,value} = evt.target
        setForm(form=> ({...form,[name]:value}))
    }

    const [code,setCode] = useState('');

    const [msg,setMsg] = useState('');

    const [time,setTime] = useState(180)  

    const [result,setResult] = useState('')

    const sendCode = async () =>{
        
       try {

            const res = await userService.sendCode({
                email: form.email
            });

            if (res.success) {

                alert("인증번호가 발송되었습니다.");

                // 인증단계 이동
                setStep(2);

                // 타이머 초기화
                setTime(180);
            }

        } catch (error) {

            console.log(error);

            alert("인증번호 발송 실패");
        }
    };



    // 타이머
    useEffect(() => {

        // step2 아닐 때 실행 X
        if (step !== 2) return;

        // 시간 끝
        if (time <= 0) {

            setMsg("인증시간이 만료되었습니다.");

            return;
        }

        const timer = setInterval(() => {

            setTime(prev => prev - 1);

        }, 1000);

        return () => clearInterval(timer);

    }, [time, step]);



    // 인증번호 확인
    const checkCode = async () => {

        // 인증번호 입력 안 했을 때
        if (!code) {

            alert("인증번호를 입력해주세요.");

            return;
        }

        // 시간 만료
        if (time <= 0) {

            alert("인증시간이 만료되었습니다.");

            return;
        }

        try {

            const res = await userService.checkCode({
                email: form.email,
                code: code
            });

            // 인증 성공
            if (res.success) {

                alert("인증 성공하였습니다.");

                // 타이머 제거
                setTime(0);

                // 아이디 찾기 실행
                findId();

            } else {

                alert("인증번호가 올바르지 않습니다.");
            }

        } catch (error) {

            console.log(error);

            alert("인증 실패");
        }
    };



    // 아이디 찾기
    const findId = async () => {

        try {

            const res = await findService.findId({
                email: form.email,
                name: form.name
            });

            if (res.success) {

                // 결과 저장
                setResult(res.id);

                // 결과 화면 이동
                setStep(3);

            } else {

                alert(res.message);
            }

        } catch (error) {

            console.log(error);

            alert("회원정보를 찾을 수 없습니다.");
        }
    };



    return (

        <div>

            <h2>아이디 찾기</h2>



            {/* STEP 1 */}
            {step === 1 && (

                <div>

                    <TextField
                        name='email'
                        label='이메일'
                        value={form.email}
                        onChange={onChange}
                    />

                    <br /><br />

                    <TextField
                        name='name'
                        label='이름'
                        value={form.name}
                        onChange={onChange}
                    />

                    <br /><br />

                    <Button
                        type='button'
                        variant='contained'
                        onClick={sendCode}
                    >
                        인증번호 받기
                    </Button>

                </div>
            )}



            {/* STEP 2 */}
            {step === 2 && (

                <div>

                    <p>
                        입력한 이메일로 인증번호를 발송했습니다.
                    </p>

                    <TextField
                        label='인증번호'
                        value={code}
                        onChange={(e) => {

                            setCode(e.target.value);
                        }}
                    />

                    <br /><br />

                    <Button
                        color='inherit'
                        variant='outlined'
                        onClick={checkCode}
                    >
                        인증 확인
                    </Button>

                    <br /><br />



                    {/* 타이머 */}
                    {time > 0 && (

                        <p style={{
                            fontSize: '14px',
                            color: time <= 30 ? 'red' : 'gray'
                        }}>

                            남은시간 :

                            {String(Math.floor(time / 60)).padStart(2, '0')}

                            :

                            {String(time % 60).padStart(2, '0')}

                        </p>
                    )}

                </div>
            )}



            {/* STEP 3 */}
            {step === 3 && (

                <div>

                    <p>회원님의 아이디는</p>

                    <h3>{result}</h3>

                    <br />

                    <a href='/login'>
                        로그인 하러가기
                    </a>

                </div>
            )}



            <br /><br />



            <a href='/findPw'>
                비밀번호 찾기
            </a>

            {"/"}

            <a href='/login'>
                로그인
            </a>

        </div>
    );
};

export default FindIdPage;