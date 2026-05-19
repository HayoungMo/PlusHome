import axios from 'axios';
import React, { useState } from 'react';
import http from '../http-common';
import findService from '../service/findService';
import { useNavigate } from 'react-router-dom';
import { Button, TextField } from '@mui/material';
import userService from '../service/userService';
//
const FindPwPage = () => {

    const [form,setForm] = useState({
        id:'',
        email:'',
        pw:'',
        pwCheck:''
    })

    const navigate = useNavigate();

    const[msg,setMsg] = useState('');

    const onChange = (evt) =>{
        const {name,value} = evt.target;
        setForm(prev => ({...prev,[name]: value}))
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
        if(form.pw !==form.pwCheck){
            setMsg("비밀번호가 일치하지 않습니다.")
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

        
        <div>
     
            <h3>비밀번호 찾기</h3>

            {step===1 && (
                <div>
                    <TextField name='id' label="아이디" onChange={onChange}/>
                    <br/><br/>
                    <TextField name='email' label="이메일"  onChange={onChange}/>
                    <br/><br/>

                    <Button variant='outlined' color='inherit' onClick={checkUser}>본인 확인</Button>

                </div>
            )}

            {step === 2 && (
                <div>
                     <TextField type='password' name='pw' label='새 비밀번호' onChange={onChange}/>
                     <br/><br/>
                     <TextField type='password' name='pwCheck' label='비밀번호 확인' onChange={onChange}/>
                     
                     <br/><br/>

                     <Button color='primary' variant='contained' onClick={onSubmit}>비밀번호 변경</Button>
                </div>
            )}
            
            {step===3 && (
                <div>
                    <h3>
                        비밀번호가 변경되었습니다.
                    </h3>

                    <a href='/login'>
                        로그인 하러가기
                    </a>

                </div>
            )}

            
            
           
            

            

             <a href='/'><h5>취소하기</h5></a>

            {msg && <div style={{color:'red'}}>{msg}</div>}

        </div>
    );
};

export default FindPwPage;