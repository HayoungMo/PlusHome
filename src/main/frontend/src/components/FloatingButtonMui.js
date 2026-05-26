import React, { useState } from "react";
import { Box, Tooltip } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import FloatingActionButtonMui from "./FloatingActionButtonMui";
import ChatbotModal from "./ChatbotModal";

//챗봇 아이콘 위에 마우스 올려두면 문구가 뜨는효과
const FloatingButtonMui = () => {
    const [chatOpen, setChatOpen] = useState(false);

    return (
        <>
            <Box
                sx={{
                    position: "fixed",
                    right: 24,
                    bottom: 24,
                    zIndex: 1300,
                }}
            >
                <Tooltip
                    title="어울리는 취향을 찾아보세요"
                    placement="left"
                    arrow
                >
                    <span>
                        <FloatingActionButtonMui
                            color="primary"
                            size="large"
                            icon={<SmartToyIcon />}
                            onClick={() => setChatOpen(true)}
                        />
                    </span>
                </Tooltip>
            </Box>

            {chatOpen && (
                <ChatbotModal onClose={() => setChatOpen(false)} />
            )}
        </>
    );
};

export default FloatingButtonMui;