"use strict";
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
exports.requireRole = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../config/db"));
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // --- TOKEN VERSION CHECK (FOR LOGOUT OTHER DEVICES) ---
        const user = yield db_1.default.user.findUnique({
            where: { id: decoded.id },
            select: { tokenVersion: true, status: true }
        });
        if (!user || user.tokenVersion !== decoded.tokenVersion) {
            return res.status(401).json({ error: 'Session expired or invalidated' });
        }
        req.user = decoded;
        // --- LOCKDOWN CHECK ---
        const lockdownConfig = yield db_1.default.systemConfig.findUnique({
            where: { key: 'lockdownMode' }
        });
        const isLockdown = (lockdownConfig === null || lockdownConfig === void 0 ? void 0 : lockdownConfig.value) === true;
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(decoded.role || '');
        if (isLockdown && !isAdmin) {
            return res.status(503).json({
                error: 'System In Lockdown',
                message: 'Terminal access restricted by command authority. Please contact security.'
            });
        }
        // Check if user is active
        const status = user.status;
        if (status !== 'ACTIVE' && status !== 'PENDING') {
            return res.status(403).json({ error: 'Account is not active' });
        }
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
});
exports.authenticate = authenticate;
const authorize = (allowedRoles) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user || !req.user.roleId) {
            return res.status(403).json({ error: 'Access denied: No role assigned' });
        }
        try {
            const role = yield db_1.default.role.findUnique({
                where: { id: req.user.roleId }
            });
            if (!role || !allowedRoles.includes(role.name)) {
                return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
            }
            next();
        }
        catch (error) {
            console.error('Authorization error', error);
            res.status(500).json({ error: 'Authorization error' });
        }
    });
};
exports.authorize = authorize;
exports.requireRole = exports.authorize;
