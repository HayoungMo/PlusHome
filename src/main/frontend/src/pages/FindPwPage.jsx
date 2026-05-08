import axios from 'axios';
import React, { useState } from 'react';
import http from '../http-common';
import findService from '../service/findService';
import { useNavigate } from 'react-router-dom';
import { TextField } from '@mui/material';
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
            <a href='/'><h1>로고</h1></a>     


            <h3>비밀번호 찾기</h3>

            <TextField name='id' label="아이디" onChange={onChange}/>
            <TextField name='email' label="이메일"  onChange={onChange}/>
            <TextField type='password' name='pw' label='새 비밀번호' onChange={onChange}/>
            <TextField type='password' name='pwCheck' label='비밀번호 확인' onChange={onChange}/>

            <button onClick={onSubmit}>비밀번호 변경</button>

             <a href='/'><h5>취소하기</h5></a>

            {msg && <div style={{color:'red'}}>{msg}</div>}

        </div>
    );
};

export default FindPwPage;