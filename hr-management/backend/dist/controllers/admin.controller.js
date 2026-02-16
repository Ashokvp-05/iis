"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.resetUserPassword = exports.toggleUserStatus = exports.updateSettings = exports.getSettings = exports.getAuditLogs = exports.getRoles = exports.syncToSheets = exports.getOverview = exports.getStats = exports.rejectUser = exports.approveUser = exports.getPendingUsers = void 0;
const adminService = __importStar(require("../services/admin.service"));
const googleSheets = __importStar(require("../services/googleSheets.service"));
const configService = __importStar(require("../services/config.service"));
const auditService = __importStar(require("../services/audit.service"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = __importDefault(require("../config/db"));
const getPendingUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield adminService.getPendingUsers();
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getPendingUsers = getPendingUsers;
const approveUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        // @ts-ignore - req.user is populated by authenticate middleware
        const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const user = yield adminService.approveUser(id, adminId);
        res.json({ message: 'User approved', user });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.approveUser = approveUser;
const rejectUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        // @ts-ignore
        const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const user = yield adminService.rejectUser(id, adminId);
        res.json({ message: 'User rejected', user });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.rejectUser = rejectUser;
const cache_1 = __importDefault(require("../config/cache"));
const getStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cached = cache_1.default.get("admin_stats");
        if (cached)
            return res.json(cached);
        const stats = yield adminService.getDatabaseStats();
        cache_1.default.set("admin_stats", stats, 300); // Cache for 5 mins
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getStats = getStats;
const getOverview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cached = cache_1.default.get("admin_overview");
        if (cached)
            return res.json(cached);
        const overview = yield adminService.getDashboardOverview();
        cache_1.default.set("admin_overview", overview, 60); // Cache for 1 min
        res.json(overview);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getOverview = getOverview;
const syncToSheets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { spreadsheetId } = req.body;
        if (!spreadsheetId) {
            return res.status(400).json({ error: 'spreadsheetId is required' });
        }
        const result = yield googleSheets.exportAttendanceToSheets(spreadsheetId);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.syncToSheets = syncToSheets;
const getRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = yield db_1.default.role.findMany();
        res.json(roles);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getRoles = getRoles;
const getAuditLogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch top 50 logs
        const logs = yield db_1.default.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        // Manually join Admin details (Name & Position)
        const adminIds = [...new Set(logs.map(log => log.adminId))].filter(Boolean);
        const admins = yield db_1.default.user.findMany({
            where: { id: { in: adminIds } },
            select: { id: true, name: true, designation: true, department: true }
        });
        // Use a Map for O(1) lookups
        const adminMap = new Map(admins.map(a => [a.id, a]));
        const enrichedLogs = logs.map(log => (Object.assign(Object.assign({}, log), { admin: adminMap.get(log.adminId) || { name: 'System', designation: 'Automated' } })));
        res.json(enrichedLogs);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getAuditLogs = getAuditLogs;
// System Configuration
const getSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const configs = yield configService.getAllConfigs();
        res.json(configs);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getSettings = getSettings;
const updateSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield configService.updateBulkConfigs(req.body);
        const adminId = req.user.id;
        auditService.logAction('SYSTEM_CONFIG_UPDATE', adminId, 'SYSTEM', `Updated system settings: ${Object.keys(req.body).join(', ')}`);
        res.json({ message: "Settings updated successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updateSettings = updateSettings;
// Advanced User Control
const toggleUserStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body; // ACTIVE, SUSPENDED, INACTIVE
        const user = yield db_1.default.user.update({
            where: { id },
            data: { status }
        });
        const adminId = req.user.id;
        auditService.logAction('USER_STATUS_CHANGE', adminId, id, `Changed status for ${user.name} to ${status}`);
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.toggleUserStatus = toggleUserStatus;
const resetUserPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        yield db_1.default.user.update({
            where: { id },
            data: { password: hashedPassword }
        });
        const adminId = req.user.id;
        auditService.logAction('USER_PASSWORD_RESET', adminId, id, `Forced password reset for user ID ${id}`);
        res.json({ message: "Password reset successful" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.resetUserPassword = resetUserPassword;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield db_1.default.user.findUnique({ where: { id } });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        yield db_1.default.user.delete({ where: { id } });
        const adminId = req.user.id;
        auditService.logAction('USER_DELETE', adminId, id, `Permanently deleted user ${user.name} (${user.email})`);
        res.json({ message: "User deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.deleteUser = deleteUser;
