const { createProxyMiddleware } = require("http-proxy-middleware");

const target = process.env.REACT_APP_PROXY_TARGET || "http://localhost:8080";

module.exports = (app) => {
    app.use(
        "/api",
        createProxyMiddleware({
            target,
            changeOrigin: true,
            pathRewrite: (path) => {
                return path.startsWith("/api") ? path : `/api${path}`;
            },
        })
    );
};
