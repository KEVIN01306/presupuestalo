import 'dotenv/config'
import app from "./app.js";


const PORT = process.env.PORT || 3000;


const startserver = async () => {
    try {
        const server = app.listen(PORT, () => {
            console.log(`Server is running on port http://localhost:${PORT}`);
        });

        // Increase timeouts for large file uploads up to 300MB (10 minutes)
        server.timeout = 600000;
        server.keepAliveTimeout = 65000;
        server.headersTimeout = 66000;
        if ('requestTimeout' in server) {
            (server as any).requestTimeout = 600000;
        }
    } catch (error) {
        console.error("Error starting server:", error);
    }
};

startserver();