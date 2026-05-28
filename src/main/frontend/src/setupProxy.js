const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = (app) => {
    app.use(
        "/api",
        createProxyMiddleware({
            target: "http://localhost:8080",
            changeOrigin: true,
            pathRewrite: (path) => {
                return path.startsWith("/api") ? path : `/api${path}`;
            },
        })
    );
};