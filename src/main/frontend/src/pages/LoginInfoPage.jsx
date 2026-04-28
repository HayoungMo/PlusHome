import React from 'react';


const LoginInfoPage = ({name,onNext}) => {
    return (
        <div>
            <h2><span>{name}</span>님,<br/>
            회원가입이 완료되었습니다!</h2>

            <p>
                <button
                onClick={()=>{
                    onNext();
                }}
                className=''>
                    로그인 하러가기
                </button>
            </p>

        </div>
    );
};

export default LoginInfoPage;
