import { useEffect, useState } from "react";

const WalletBalanceCounting = ({ before, after, charged, step, onClose }) => {
    const [displayMoney, setDisplayMoney] = useState(before);
    const isLargeCharge = charged >= 1000000;

    useEffect(() => {
        if (step === "processing") {
            setDisplayMoney(before);
            return undefined;
        }

        const duration = 850;
        const start = performance.now();
        let frameId;

        const animate = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const nextMoney = Math.round(before + (after - before) * eased);

            setDisplayMoney(nextMoney);

            if (progress < 1) {
                frameId = requestAnimationFrame(animate);
            }
        };

        frameId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(frameId);
    }, [before, after, step]);

    if (step === "processing") {
        return (
            <div className="wallet-charge-overlay">
                <div className="wallet-charge-card">
                    <p className="charge-state-title">충전이 진행중입니다</p>
                    {isLargeCharge ? (
                        <div className="charge-nyancat-wrap">
                            <img
                                src="/nyancat.gif"
                                alt="A cat flying through space leaving a rainbow trail"
                            />
                        </div>
                    ) : (
                        <div className="charge-pacman-wrap">
                            <div className="charge-pacman"></div>
                            <div className="charge-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    )}
                    <p className="charge-state-caption">
                        {isLargeCharge ? "100만원 이상 충전!" : "지갑 잔액을 확인하고 있습니다"}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="wallet-charge-overlay">
                <div className="wallet-charge-card">
                <p
                    className={
                        step === "done"
                            ? "charge-state-title charge-state-title-done"
                            : "charge-state-title"
                    }
                >
                    {step === "done" ? "충전완료" : "잔액을 업데이트하고 있습니다"}
                </p>

                <div className="wallet-balance-result">
                    <span>현재 잔액</span>
                    <strong>{displayMoney.toLocaleString()}원</strong>
                </div>

                <div className="wallet-charge-summary">
                    <span>충전 금액</span>
                    <strong>+{charged.toLocaleString()}원</strong>
                </div>

                <button
                    type="button"
                    className="balance-count-close"
                    onClick={onClose}
                    disabled={step !== "done"}
                >
                    {step === "done" ? "확인" : "처리 중"}
                </button>
            </div>
        </div>
    );
};

export { WalletBalanceCounting };
