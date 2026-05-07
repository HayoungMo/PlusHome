import axios from 'axios';
import React, { useState } from 'react';
import http from '../http-common';
import findService from '../service/findService';
import { useNavigate } from 'react-router-dom';
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

            <input name='id' placeholder='아이디' onChange={onChange}/>
            <input name='email' placeholder='이메일' onChange={onChange}/>
            <input type='password' name='pw' placeholder='새 비밀번호' onChange={onChange}/>
            <input type='password' name='pwCheck' placeholder='비밀번호 확인' onChange={onChange}/>

            <button onClick={onSubmit}>비밀번호 변경</button>

             <a href='/'><h5>취소하기</h5></a>

            {msg && <div style={{color:'red'}}>{msg}</div>}

        </div>
    );
};

export default FindPwPage;