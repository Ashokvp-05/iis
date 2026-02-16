"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const compression_1 = __importDefault(require("compression"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.set('etag', false); // Disable etag for simpler debugging
// Optimized Middleware
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL,
    process.env.NEXT_PUBLIC_FRONTEND_URL,
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 ||
            origin.endsWith('.vercel.app') ||
            origin.endsWith('.onrender.com')) {
            callback(null, true);
        }
        else {
            console.warn('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    maxAge: 86400, // Cache preflight for 24 hours
}));
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use((0, compression_1.default)({
    level: 6, // Balance between compression ratio and speed
    threshold: 1024, // Only compress responses > 1KB
}));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Cache control for static responses
app.use((req, res, next) => {
    // Set cache headers for specific routes
    if (req.path.startsWith('/api/holidays') || req.path.startsWith('/api/announcements')) {
        res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
    }
    next();
});
// Health Check
app.get('/', (req, res) => {
    res.json({ message: 'Rudratic HR System API is running', timestamp: new Date() });
});
app.get('/api', (req, res) => {
    res.json({
        status: 'Operational',
        version: '1.0.0-GA',
        latency: 'minimal',
        compression: 'enabled'
    });
});
// Routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const timeEntry_routes_1 = __importDefault(require("./routes/timeEntry.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const holiday_routes_1 = __importDefault(require("./routes/holiday.routes"));
const leave_routes_1 = __importDefault(require("./routes/leave.routes"));
const profile_routes_1 = __importDefault(require("./routes/profile.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const announcement_routes_1 = __importDefault(require("./routes/announcement.routes"));
const ticket_routes_1 = __importDefault(require("./routes/ticket.routes"));
const calendar_routes_1 = __importDefault(require("./routes/calendar.routes"));
const kudos_routes_1 = __importDefault(require("./routes/kudos.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const payslip_routes_1 = __importDefault(require("./routes/payslip.routes"));
const payroll_routes_1 = __importDefault(require("./routes/payroll.routes"));
const workflow_routes_1 = __importDefault(require("./routes/workflow.routes"));
const cron_service_1 = require("./services/cron.service");
// Initialize Scheduled Tasks
(0, cron_service_1.initCronJobs)();
app.use('/api/auth', auth_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/holidays', holiday_routes_1.default);
app.use('/api/leaves', leave_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/profile', profile_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/time', timeEntry_routes_1.default);
app.use('/api/reports', report_routes_1.default);
app.use('/api/announcements', announcement_routes_1.default);
app.use('/api/tickets', ticket_routes_1.default);
app.use('/api/calendar', calendar_routes_1.default);
app.use('/api/kudos', kudos_routes_1.default);
app.use('/api/ai', ai_routes_1.default);
app.use('/api/payslips', payslip_routes_1.default);
app.use('/api/payroll', payroll_routes_1.default);
app.use('/api/workflows', workflow_routes_1.default);
// 404 Handler - must be after all routes
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: `Route ${req.method} ${req.url} not found`
    });
});
// Global error handler - must be last
const error_middleware_1 = require("./middleware/error.middleware");
app.use(error_middleware_1.errorHandler);
exports.default = app;
