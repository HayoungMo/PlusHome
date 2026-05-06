import axios from 'axios';
import React, { useState } from 'react';

const FindPwPage = () => {

    const [form,setForm] = useState({
        id:'',
        email:'',
        pw:'',
        pwCheck:''
    })

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
            
            const res = await axios.post("/user/reset-pw",{
                id:form.id,
                email: form.email,
                pw: form.pw
            })

            if(res.data.result === "SUCCESS"){
                alert("비밀번호 변경 완료")
            }else{
                setMsg("정보가 일치하지 않습니다.")
            }

        } catch (error) {
            setMsg("서버 오류")
        }

    }

    return (
        <div>
            <h3>비밀번호 찾기</h3>

            <input name='id' placeholder='아이디' onChange={onChange}/>
            <input name='email' placeholder='이메일' onChange={onChange}/>
            <input type='password' name='pw' placeholder='새 비밀번호' onChange={onChange}/>
            <input type='password' name='pwCheck' placeholder='비밀번호 ghkrdls' onChange={onChange}/>

            <button onClick={onSubmit}>비밀번호 변경</button>

            {msg && <div style={{color:'red'}}>{msg}</div>}

        </div>
    );
};

export default FindPwPage;