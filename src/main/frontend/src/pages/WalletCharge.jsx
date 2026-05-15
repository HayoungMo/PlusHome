import React, { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import TextFieldMui from "../components/TextFieldMui";
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
                money: chargeMoney,
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
        <Box sx={{ maxWidth: 560 }}>
            <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 700 }}>
                지갑 충전
            </Typography>

            <Box
                sx={{
                    mb: 3,
                    p: 2,
                    border: "1px solid #ddd",
                    borderRadius: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}>
                <Typography color="text.secondary">현재 잔액</Typography>
                <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
                    {Number(wallet?.money || 0).toLocaleString()}원
                </Typography>
            </Box>

        <strong>금액 선택</strong>
        <hr/>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: 1.25,
                    mb: 2,
                }}>
                {chargeAmounts.map((amount) => {
                    const selected = Number(money) === amount;

                    return (
                        <Button
                            key={amount}
                            type="button"
                            variant={selected ? "contained" : "outlined"}
                            color="inherit"
                            onClick={() => selectAmount(amount)}
                            sx={{
                                py: 1.5,
                                borderColor: selected ? "#111" : "#ddd",
                                backgroundColor: selected ? "#111" : "white",
                                color: selected ? "white" : "black",
                                "&:hover": {
                                    borderColor: "#111",
                                    backgroundColor: selected ? "#111" : "#f7f7f7",
                                },
                            }}>
                            {amount.toLocaleString()}원
                        </Button>
                    );
                })}
            </Box>


            <TextFieldMui
                label="직접 입력"
                name="money"
                value={money}
                onChange={changeMoney}
                helperText={money ? `${Number(money).toLocaleString()}원` : "충전 금액을 입력하세요."}
                width="100%"
            />

            <Button
                type="button"
                variant="contained"
                fullWidth
                onClick={onSubmit}
                sx={{
                    mt: 2,
                    py: 1.5,
                    backgroundColor: "#111",
                    "&:hover": {
                        backgroundColor: "#333",
                    },
                }}>
                {money ? `${Number(money).toLocaleString()}원 충전하기` : "충전하기"}
            </Button>
        </Box>
    );
};

export default WalletCharge;
