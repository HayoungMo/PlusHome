import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Snackbar } from "@mui/material";
import AlertMui from "./AlertMui";

const LoginShortcut = ({ setLoginUser, setLoginInfo }) => {
  const navigate = useNavigate();
  const keyHistoryRef = useRef([]);

  const [shortcutSnack, setShortcutSnack] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const closeShortcutSnack = () => {
    setShortcutSnack((prev) => ({
      ...prev,
      open: false,
    }));
  };

  useEffect(() => {
    const shortcutKeys = ["ArrowLeft", "ArrowLeft", "ArrowRight", "ArrowRight"];

    const isTypingTarget = (target) => {
      const tagName = target?.tagName?.toLowerCase();

      return (
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        target?.isContentEditable
      );
    };

    const handleLoginShortcut = (e) => {
        console.log("shortcut key:", e.key, e.target);
        
      if (isTypingTarget(e.target)) return;

      keyHistoryRef.current = [...keyHistoryRef.current, e.key].slice(
        -shortcutKeys.length
      );

      if (keyHistoryRef.current.join(",") !== shortcutKeys.join(",")) return;

      keyHistoryRef.current = [];

      const token = localStorage.getItem("token");

      if (token) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("id");

        setLoginUser(null);
        setLoginInfo(null);

        setShortcutSnack({
          open: true,
          message: "로그아웃되었습니다.",
          severity: "success",
        });

        navigate("/login");
        return;
      }

      setShortcutSnack({
        open: true,
        message: "로그인 페이지로 이동합니다.",
        severity: "info",
      });

      navigate("/login");
    };

    window.addEventListener("keydown", handleLoginShortcut, true);

    return () => {
    window.removeEventListener("keydown", handleLoginShortcut, true);
    };
  }, [navigate, setLoginUser, setLoginInfo]);

  return (
    <Snackbar
      open={shortcutSnack.open}
      autoHideDuration={3000}
      onClose={closeShortcutSnack}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <div>
        <AlertMui
          severity={shortcutSnack.severity}
          variant="filled"
          text={shortcutSnack.message}
          onClose={closeShortcutSnack}
          floating={false}
        />
      </div>
    </Snackbar>
  );
};

export default LoginShortcut;