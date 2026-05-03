import React, {useState,useEffect} from 'react';
import WalletService from '../service/walletService';

const WalletCharge = () => {
    const [data,setData] = useState({
        id:"", 
        money:""
    })

    const [wallet, setWallet] = useState(null)

    useEffect(()=>{
        if(data.id){
            showMyWallet()
        }
    },[])

    const changeInput = (evt) =>{
        const {value,name} = evt.target
        setData({
            ...data,
            [name]:value
        })
    }  

    const showMyWallet = async () => {
        try {
            const response = await WalletService.getMyWallet(data.id);
            if(!response){
                alert("존재하지 않는 지갑입니다.")
                setWallet(null)
                return
            }
            setWallet(response);
            console.log('내 지갑:',response)
        }catch(error){
            console.error('지갑조회 실패!', error)
            alert('지갑 조회에 실패했습니다.')
        }
    }

    const onSubmit = async (evt) => {
        evt.preventDefault();

        if(!data.id.trim()){
            alert("아이디를 입력해주세요!")
            return;
        }

        if(!wallet || wallet.id !== data.id){
            alert("존재하지 않는 지갑입니다!")
            return
        }
        
        if(Number(data.money) <=0){
            alert("충전 금액은 0보다 커야합니다.")
        }
        try {
            const sendData={
                ...data,
                money: Number(data.money)
            }

            await WalletService.chargeWallet(sendData)
            alert("충전이 완료되었습니다.")

            const response = await WalletService.getMyWallet(data.id)
            setWallet(response)

        } catch (error) {
            console.error("충전 실패:", error)
            alert("충전에 실패했습니다.")
        }
    }
    return (
        <div>

            <h3>Charge</h3>

            <label>아이디:</label>
            <input 
            name='id' 
            value={data.id}
            onChange={changeInput}
            placeholder='아이디'
            />
            <button type='button' onClick={showMyWallet}>조회</button>
            
            <br/>

            {wallet && (
                <div>
                    <p>안녕하세요 {wallet.id}님<br/>
                    현재 보유 금액: {wallet.money}</p>
                </div>
            )}

            <label>충전 금액: </label>
            <input name='money' value={data.money} onChange={changeInput} placeholder='충전 금액'/>

            <br/>

            <button type='button' onClick={onSubmit}>충전</button>
        </div>
    );
};

export default WalletCharge;