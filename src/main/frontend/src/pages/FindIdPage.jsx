import axios from 'axios';
import React, { useEffect, useState } from 'react';
import findService from '../service/findService';
import { useNavigate } from 'react-router-dom';
import { Button, TextField } from '@mui/material';
import userService from '../service/userService';
import { GoHomeFill } from 'react-icons/go';
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
                setStep(2);

            } else {

                alert(res.message);
            }

        } catch (error) {

            console.log(error);

            alert("회원정보를 찾을 수 없습니다.");
        }
    };



    return (

        <div className='login-wrap'>

            <div className='login-box'>

            <h2 className='login-title'>
                아이디 찾기
                <span>Find ID</span>    
            </h2>



            {/* STEP 1 */}
            {step === 1 && (

                <div>

                    <div className="input-group">

                    <TextField
                        fullWidth
                        name='email'
                        label='이메일'
                        value={form.email}
                        onChange={onChange}
                    />

                </div>

            
                <div className="input-group">  

                    <TextField
                        fullWidth   
                        name='name'
                        label='이름'
                        value={form.name}
                        onChange={onChange}
                    />

                </div>

                {msg && (
                    <div className="error-msg">
                        {msg}
                    </div>
                )}

                    <Button
                        type='button'
                        variant='contained'
                        onClick={findId}
                    >
                        아이디 찾기
                    </Button>

                </div>
            )}        


            {/* STEP 2 */}
            {step === 2 && (

                <div className="result-box">

                    <p>회원님의 아이디는</p>

                    <h3>{result}</h3>

                    <p>입니다.</p>

                </div>
            )}

            <div className="find-links-wrap">

            <div className="find-divider"></div>



            <div className="find-links">

            <a href='/findPw'>
                비밀번호 찾기
            </a>

            <span>|</span>

            <a href='/login'>
                로그인
            </a>

            </div>

            <div className='home-link'>
                <a href='/'>        
                    <GoHomeFill/>plushome<GoHomeFill/>
                </a>
            </div>

        </div>

        </div>

        </div>
    );
};

export default FindIdPage;