import React from 'react';


const Email_Option =[
    {value:'none', label: '--- 선택 ---'},
    {value:'@naver.com', label: '@naver.com'},
    {value:'@gmail.com', label: '@gmail.com'},
    {value:'@daum.net', label: '@daum.net'},
    {value:'@nate.com', label: '@nate.com'},
    {value:'',label: '직접입력'}
]

const JoinUserPage = () => {
    return (
        <div>
            <h3>회원가입
                <span>SIGN UP</span>
            </h3>
             <label>아이디</label>   
             <div>
                <input type='text' name='userId' value={userId}
                onChange={onText}
                    placeholder='아이디 입력'
                    className=''/>
                    <button type='button' className=''
                    onClick={onCheckId}>중복확인</button>
             </div>
            
             <div>
             <label>비밀번호</label>
             <input type='password' name='password' value={password} onChange={onText}
                placeholder='비밀번호 입력'
                className=''/>
            </div>

            <div>
                <label>비밀번호 확인</label>
                <input type='password' value={pwCheck}
                    onChange={(e)=>setPwCheck(e.target.value)}
                    placeholder='비밀번호 재입력'
                    className=''/>
            </div>

            <button>일반</button>
            <button>기업</button>

            <div>
                <input>업체명</input>
                <input>업체주소</input>
                <button>가구판매</button>
                <button>인테리어</button>
            </div>

            <div>
                <label>주민번호(사업자 등록번호)</label>
                <input type='code' value={code}
                    placeholder='주민번호'
                    className=''/>
            </div>

            <div>
                <label>이름(사업주명)</label>
                <input type='personalNum' value={name}
                    placeholder='이름(사업주명)'
                    className=''/>
            </div>

            <div>
                <label>이메일</label>
                <input type='email' value={email}
                    placeholder='이메일'
                    className=''/>
            </div>

            <div>
                <label>생년월일</label>
                <input type='birth' value={birth}
                    placeholder='생년월일'
                    className=''/>
            </div>

            <div>
                <label>전화번호</label>
                <input type='tel' value={tel}
                    placeholder='전화번호'
                    className=''/>
            </div>

            <div>
                <label>성별</label>
                <button>여자</button>
                <button>남자</button>
                <button>선택안함</button>
            </div>




             


        이미 아이디가 있으신가요?
        <a href='/login'>로그인</a>    
        </div>
    );
};

export default JoinUserPage;