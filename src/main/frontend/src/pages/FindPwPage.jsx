import axios from 'axios';
import React, { useState } from 'react';
import http from '../http-common';
import findService from '../service/findService';
import { useNavigate } from 'react-router-dom';
import { Button, TextField,InputAdornment,IconButton } from '@mui/material';
import userService from '../service/userService';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
    


//
const FindPwPage = () => {

    const [form,setForm] = useState({
        id:'',
        email:'',
        pw:'',
        pwCheck:''
    })

    const [errorMsg,setErrorMsg] = useState({
        pw:'',
        pwCheck:'',
    })

    const navigate = useNavigate();

    const[msg,setMsg] = useState('');

    const [showPw,setShowPw] = useState(false)
    const [showPwCheck,setShowPwCheck] = useState(false)

    const validate = (name,value) => {
        switch(name){
            case 'pw':
                 if(
                !/^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*_-])[A-Za-z\d!@#$%^&*_-]{8,16}$/.test(value)
            ){
                return '비밀번호 8~16자의 영문 소문자, 숫자, 특수문자를 사용해 주세요.';
            }

            return ''

            default:
                return'';
        }
    }

    const onChange = (evt) =>{
        const {name,value} = evt.target;
        setForm(prev => ({...prev,
            [name]: value
        }))

        //비밀번호 실시간 검증
        if(name === 'pw'){
            const error = validate(name,value)

            setErrorMsg(prev =>({
                ...prev,
                pw:error
            }))
        }

        //비밀번호 홖인 실시간 검증
        if(name === 'pwCheck'){

            if(form.pw !==value){
            setErrorMsg(prev =>({
                ...prev,
                pwCheck:'비밀번호가 일치하지 않습니다.'
            }))
        }else{
            setErrorMsg(prev =>({
                ...prev,
                pwCheck:''
            }))
        }
    }
}

    const [step,setStep] = useState(1)

    const checkUser = async () =>{
        if(!form.id || !form.email){
            setMsg("아이디와 이메일을 입력하세요.")
            return;
        }
        try {
            const res = await findService.checkUser({
                id:form.id,
                email:form.email,
            })
            console.log(res)

            if(res.success){
                alert("본인 확인이 완료되었습니다.")
                setStep(2)
            }else{
                setMsg(res.message)
            }
        } catch (error) {
            console.log(error)
            setMsg("회원정보를 찾을 수 없습니다.")
            
        }
    }

    

    const onSubmit = async ()=> {

        console.log("데이터 흐름 확인",form.pw)
        console.log("데이터 흐름 확인",form.pwCheck)

        const pwError = validate('pw',form.pw)

        console.log('pwError',pwError)

        if(pwError){

            setErrorMsg(prev =>({
                ...prev,
                pw:pwError
            }))
            return
        }

        if(form.pw !==form.pwCheck){
            setErrorMsg(prev =>({
                ...prev,
                pwCheck:"비밀번호가 일치하지 않습니다."

            }))
            return
        }

        try {
            
            const res = await findService.findPw({
                id:form.id, 
                email: form.email,
                pw: form.pw
            })

            console.log("data 넘어오냐고",res)

            if(res.success){
                alert(res.message)

                setMsg("비밀번호 변경 완료되었습니다.");

                navigate('/login')


            }else{
                setMsg(res.message)
            }

        } catch (error) {
            setMsg("서버 오류")
        }

    }

    return (

        
        <div className='login-wrap'>

            <div className='login-box'>
     
            <h3 className='login-title'>
                비밀번호 찾기
                <span>Find Password</span>
                </h3>

            {step===1 && (
                <div>
                    <div className='input-group'>
                    <TextField fullWidth name='id' label="아이디" onChange={onChange}/>
                    </div>

                    <div className='input-group'>
                    <TextField fullWidth name='email' label="이메일"  onChange={onChange}/>
                    </div>
                    {msg && <div style={{color:'red'}}>{msg}</div>}

                    <br/>

                    <Button variant='outlined' color='inherit' onClick={checkUser}>본인 확인</Button>

                </div>
            )}

            {step === 2 && (
                <div>
                    <div className='input-group'>
                     <TextField fullWidth type={showPw ? 'text':'password'} name='pw' 
                        label='새 비밀번호' onChange={onChange}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton 
                                        onClick={()=>setShowPw(!showPw)}
                                        edge="end">

                                            {showPw ? <Visibility/> : <VisibilityOff/>}

                                    </IconButton>


                                </InputAdornment>
                            )
                        }}

                        />
                     </div>

                     {errorMsg.pw && (
                        <div className='error-msg'>
                            {errorMsg.pw}
                        </div>
                     )}

                     <div className='input-group'>
                     <TextField fullWidth type='password' name='pwCheck' label='비밀번호 확인' onChange={onChange}InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton 
                                        onClick={()=>setShowPw(!showPw)}
                                        edge="end">

                                            {showPw ? <Visibility/> : <VisibilityOff/>}

                                    </IconButton>


                                </InputAdornment>
                            )
                        }}

                        />
                     
                    </div>

                    {errorMsg.pwCheck && (
                        <div className='error-msg'>
                            {errorMsg.pwCheck}
                        </div>
                    )}

                     <Button color='primary' variant='contained' onClick={onSubmit}>비밀번호 변경</Button>
                </div>
            )}
            
            {step===3 && (
                <div className='result-box'>
                    <h3>
                        비밀번호가 변경되었습니다.
                    </h3>

                    <a href='/login'>
                        로그인 하러가기
                    </a>

                </div>
            )} 
            
            <div className='login-links'>

             <a href='/'><h5>취소하기</h5></a>

             </div>

            

        </div>

        </div>
        
    );
};

export default FindPwPage;