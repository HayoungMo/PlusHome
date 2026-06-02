import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Stack,
    Typography,
    TextField,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import AlertMui from "./AlertMui";
import WalletService from "../service/walletService";
import {WalletBalanceCounting} from "./WalletBalanceCounting.js";
import "../css/Wallet.css";

const chargeAmounts = [10000, 30000, 50000, 100000, 300000, 500000];
const MAX_WALLET_MONEY = 100000000;

const WalletChargeMui = ({ user, onCharged, open = true, onClose }) => {
    const [wallet, setWallet] = useState(null);
    const [money, setMoney] = useState("");
    
    const currentMoney = Number(wallet?.money || 0);
    const chargeMoney = Number(money || 0);
    const afterChargeMoney = currentMoney + chargeMoney;

    const remainChargeLimit = Math.max(0, MAX_WALLET_MONEY - currentMoney);
    const isOverWalletLimit = afterChargeMoney > MAX_WALLET_MONEY;

    const [alertInfo, setAlertInfo] = useState(null);
    const [charging, setCharging] = useState(false);

    const [chargeStep, setChargeStep] = useState(null)
    // null | "processing" | "conuting" | "done"

    const [chargeResult, setChargeResult] = useState({
        before: 0,
        charged: 0,
        after: 0,
    })
    useEffect(() => {
        if (open && user?.id) {
            loadWallet();
        }
    }, [open, user?.id]);

    const showAlert = (severity, title, text) => {
        setAlertInfo({ severity, title, text });
    };

    const formatMoney = (value) => {
        const number = Number(String(value || "").replace(/[^0-9]/g, ""));
        if (!number) return "";
        return number.toLocaleString();
    };  

    const loadWallet = async () => {
        try {
            const data = await WalletService.getMyWallet(user.id);
            setWallet(data);
        } catch (error) {
            console.error("지갑 조회 실패", error);
            showAlert("error", "조회 실패", "지갑 조회에 실패했습니다.");
        }
    };

    const selectAmount = (amount) => {
        const nextMoney = Number(money || 0) + amount

        if(nextMoney > remainChargeLimit) {
            setMoney(String(remainChargeLimit))
            showAlert(
                "warning",
                "충전 한도 초과",
                `지갑은 최대 ${MAX_WALLET_MONEY.toLocaleString()}원 까지 보유할 수 있습니다.`
            )

            return
        }
        
        setMoney(String(nextMoney));
    };

    const changeMoney = (evt) => {
        const onlyNumber = evt.target.value.replace(/[^0-9]/g, "");
        const inputMoney = Number(onlyNumber || 0)

        if (inputMoney > remainChargeLimit){
            setMoney(String(remainChargeLimit))
            showAlert(
                "warning",
                "충전 한도 초과",
                `현재 잔액 기준 최대 ${remainChargeLimit.toLocaleString()}원 까지만 충전 가능합니다.`
            )

            return
        }
        setMoney(onlyNumber);
    };

    const closeWalletModal = () => {
        setMoney("")
        setAlertInfo(null)
        setChargeStep(null)
        onClose?.();
    };

    const requestCharge = () => {
        const chargeMoney = Number(money);

        if (!user?.id) {
            showAlert("warning", "로그인 필요", "로그인이 필요합니다.");
            return;
        }

        if (chargeMoney <= 0) {
            showAlert("warning", "금액 확인", "충전 금액을 선택해주세요.");
            return;
        }

        if (currentMoney >= MAX_WALLET_MONEY) {
            showAlert(
                "warning",
                "충전 불가",
                `지갑 보유 금액은 최대 ${MAX_WALLET_MONEY.toLocaleString()}원입니다.`
            );
            return;
        }

        if (currentMoney + chargeMoney > MAX_WALLET_MONEY) {
            showAlert(
                "warning",
                "충전 한도 초과",
                `보유 금액과 충전 금액의 합은 ${MAX_WALLET_MONEY.toLocaleString()}원을 넘을 수 없습니다.`
            );
            return;
        }

        onSubmit();
    };

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

    const onSubmit = async () => {
        const chargeMoney = Number(money);
        const beforeMoney = currentMoney;

        try {
            setCharging(true);
            setChargeResult({
                before: beforeMoney,
                charged: chargeMoney,
                after: beforeMoney + chargeMoney
            })
            setChargeStep("processing")

            await WalletService.chargeWallet({
                id: user.id,
                money: chargeMoney,
            });

            const updatedWallet = await WalletService.getMyWallet(user.id);
            const afterMoney = Number(updatedWallet?.money || beforeMoney + chargeMoney)

            setChargeResult({
                before: beforeMoney,
                charged: chargeMoney,
                after: afterMoney
            })

            await wait(950)

            setWallet(updatedWallet);
            onCharged?.(updatedWallet);
            setMoney("");
            
            setChargeStep("counting")

            await wait(950)

            setChargeStep("done")

        } catch (error) {
            console.error("충전 실패", error);
            setChargeStep(null);
            showAlert("error", "충전 실패", "충전에 실패했습니다.");
        } finally {
            setCharging(false);
        }
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={closeWalletModal}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        overflow: "hidden",
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        position: "relative",
                        textAlign: "center",
                        borderBottom: "1px solid #eee",
                        py: 2,
                    }}
                >
                    <Typography variant="h6" fontWeight={700}>
                        지갑 충전
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        충전할 금액을 선택하거나 직접 입력해주세요.
                    </Typography>

                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
                    {alertInfo && (
                        <Box sx={{ mb: 2 }}>
                            <AlertMui
                                severity={alertInfo.severity}
                                title={alertInfo.title}
                                text={alertInfo.text}
                                onClose={() => setAlertInfo(null)}
                                autoHideDuration={2500}
                            />
                        </Box>
                    )}

                    <Box
                        sx={{
                            mb: 3,
                            p: 2,
                            border: "1px solid #ddd",
                            borderRadius: 1,
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <Typography color="text.secondary">현재 잔액</Typography>
                            <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
                                {currentMoney.toLocaleString()}원
                            </Typography>
                        </Box>

                        {chargeMoney > 0 && (
                            <Typography
                                variant="body2"
                                color={isOverWalletLimit ? "error" : "text.secondary"}
                                sx={{ mt: 1, textAlign: "right" }}
                            >
                                충전 후 잔액: {afterChargeMoney.toLocaleString()}원 / 최대{" "}
                                {MAX_WALLET_MONEY.toLocaleString()}원
                            </Typography>
                        )}
                    </Box>

                    <Typography fontWeight={700} sx={{ mb: 1.5 }}>
                        금액 선택
                    </Typography>

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                            gap: 1.25,
                            mb: 2,
                        }}
                    >
                        {chargeAmounts.map((amount) => {
                            const selected = Number(money) === amount;

                            return (
                                <Button
                                    key={amount}
                                    type="button"
                                    variant={selected ? "contained" : "outlined"}
                                    color={selected ? "primary" : "inherit"}
                                    onClick={() => selectAmount(amount)}
                                    sx={{
                                        py: 1.5,
                                        borderColor: selected ? "primary.main" : "#cfcfcf",
                                        color: selected ? "primary.contrastText" : "#333",
                                        backgroundColor: selected ? "primary.main" : "#fff",
                                        "&:hover": {
                                            borderColor: selected ? "primary.dark" : "#999",
                                            backgroundColor: selected ? "primary.dark" : "#f7f7f7",
                                        },
                                    }}
                                >
                                    {amount.toLocaleString()}원
                                </Button>
                            );
                        })}
                    </Box>

                    <TextField
                        label="직접 입력"
                        name="money"
                        value={formatMoney(money)}
                        onChange={changeMoney}
                        helperText={
                            money
                                ? `${Number(money).toLocaleString()}원 충전 예정`
                                : "충전 금액을 입력하세요."
                        }
                        fullWidth
                        sx={{
                            width: "100%",
                            display: "block",
                        }}
                        InputProps={{
                            endAdornment: (
                                <IconButton
                                    size="small"
                                    onClick={() => setMoney("")}
                                    edge="end"
                                    disabled={!money}
                                    sx={{
                                        width: 24,
                                        height: 24,
                                        color: money ? "text.secondary" : "action.disabled",
                                    }}
                                >
                                    <CloseIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            ),
                        }}
                    />

                    <Divider sx={{ my: 2.5 }} />

                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                            type="button"
                            variant="contained"
                            color="primary"
                            onClick={requestCharge}
                            disabled={
                                charging ||
                                chargeMoney <=0 ||
                                isOverWalletLimit ||
                                currentMoney  >= MAX_WALLET_MONEY}
                        >
                            {money ? `${Number(money).toLocaleString()}원 충전하기` : "충전하기"}
                        </Button>

                        {onClose && (
                            <Button
                                type="button"
                                variant="outlined"
                                color="inherit"
                                onClick={closeWalletModal}
                                disabled={charging}
                            >
                                취소
                            </Button>
                        )}
                    </Stack>
                </DialogContent>
            </Dialog>

            {["processing", "counting", "done"].includes(chargeStep) && (
                <WalletBalanceCounting
                    before={chargeResult.before}
                    after={chargeResult.after}
                    charged={chargeResult.charged}
                    step={chargeStep}
                    onClose={() => setChargeStep(null)}
                />
            )}
        </>
    );
};

export default WalletChargeMui;
