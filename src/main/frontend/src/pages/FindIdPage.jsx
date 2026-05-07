import axios from 'axios';
import React, { useState } from 'react';
import findService from '../service/findService';
import { useNavigate } from 'react-router-dom';
//
const FindIdPage = () => {

    const [form,setForm] = useState({
        email:'',
        name:'',
    })

    const navigate = useNavigate('')

    const onChange = (evt) =>{
        const {name,value} = evt.target
        setForm(form=> ({...form,[name]:value}))
    }

    const [errorMsg,setErrorMsg] = useState('')

    const [result,setResult] = useState('')

    const onSubmit = async()=>{

        if(!form.email || !form.name){
                setErrorMsg('이메일과 이름을 모두 입력하세요.')
                return;
            }

        try {

            const res = await findService.findId({
                email:form.email,
                name: form.name
            })

            console.log("res",res)

            if(res.success){
                setResult(res.id)
                setErrorMsg('')

            }else{
                setErrorMsg(res.message)
                setResult('')
            }
            
        } catch (error) {
            console.log("에러가 실행이 되나요",error)
            setErrorMsg("회원정보를 찾을 수 없습니다.")
            setResult('')
        }
       
    }


    return (
        <div>
            <h3>아이디 찾기</h3>
            <input name='email' placeholder='이메일' onChange={onChange} value={form.email}/>
            <input name='name' placeholder='이름' onChange={onChange} value={form.name}/>

            <button onClick={onSubmit}>아이디 찾기</button>

                {result ? (
                    <p>아이디: {result}</p>
                            ) : (
                    errorMsg && <p style={{color:'red'}}>{errorMsg}</p>
                )}

                <br/>

                <a href='/findPw'>비밀번호 찾기</a> / <a href='/login'>로그인</a>
                

        </div>
    );
};

export default FindIdPage;