import React, { useEffect, useState } from "react";
import WalletService from "../service/walletService";

const chargeAmounts = [10000, 30000, 50000, 100000, 300000, 500000];

const WalletCharge = ({ user, onCharged }) => {
    const [wallet, setWallet] = useState(null);
    const [money, setMoney] = useState("");

    useEffect(() => {
        if (user?.id) {
            loadWallet();
        }
    }, [user?.id]);

    const loadWallet = async () => {
        try {
            const data = await WalletService.getMyWallet(user.id);
            setWallet(data);
        } catch (error) {
            console.error("지갑 조회 실패", error);
            alert("지갑 조회에 실패했습니다.");
        }
    };

    const selectAmount = (amount) => {
        setMoney(String(amount));
    };

    const changeMoney = (evt) => {
        const onlyNumber = evt.target.value.replace(/[^0-9]/g, "");
        setMoney(onlyNumber);
    };

    const onSubmit = async () => {
        const chargeMoney = Number(money);

        if (!user?.id) {
            alert("로그인이 필요합니다.");
            return;
        }

        if (chargeMoney <= 0) {
            alert("충전 금액을 선택해주세요.");
            return;
        }

        try {
            await WalletService.chargeWallet({
                id: user.id,
                money: chargeMoney
            });

            alert("충전이 완료되었습니다.");

            const updatedWallet = await WalletService.getMyWallet(user.id);
            setWallet(updatedWallet);

            onCharged?.(updatedWallet);
            setMoney("");
        } catch (error) {
            console.error("충전 실패", error);
            alert("충전에 실패했습니다.");
        }
    };

    return (
        <div>
            <h3>지갑 충전</h3>

            <p>
                현재 잔액:{" "}
                <strong>
                    {Number(wallet?.money || 0).toLocaleString()}원
                </strong>
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                {chargeAmounts.map(amount => (
                    <button
                        key={amount}
                        type="button"
                        onClick={() => selectAmount(amount)}
                        style={{
                            padding: "15px",
                            border: Number(money) === amount ? "2px solid black" : "1px solid #ddd",
                            background: "white",
                            cursor: "pointer"
                        }}
                    >
                        {amount.toLocaleString()}원
                    </button>
                ))}
            </div>

            <div style={{ marginTop: "15px" }}>
                <label>직접 입력</label>
                <input
                    value={money}
                    onChange={changeMoney}
                    placeholder="충전 금액"
                    style={{
                        width: "100%",
                        padding: "12px",
                        marginTop: "5px"
                    }}
                />
            </div>

            <button
                type="button"
                onClick={onSubmit}
                style={{
                    width: "100%",
                    padding: "15px",
                    marginTop: "15px",
                    background: "black",
                    color: "white",
                    cursor: "pointer"
                }}
            >
                {money ? `${Number(money).toLocaleString()}원 충전하기` : "충전하기"}
            </button>
        </div>
    );
};

export default WalletCharge;
