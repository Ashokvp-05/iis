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
exports.logoutOthers = exports.changePassword = exports.resetPassword = exports.requestPasswordReset = exports.disable2FA = exports.activate2FA = exports.setup2FA = exports.verify2FALogin = exports.verifyCredentials = exports.requestRegistration = void 0;
const db_1 = __importDefault(require("../config/db"));
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const crypto_1 = __importDefault(require("crypto"));
const emailService = __importStar(require("./email.service"));
const tfaService = __importStar(require("./2fa.service"));
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    name: zod_1.z.string().min(2),
    roleId: zod_1.z.string().optional(),
    roleName: zod_1.z.string().optional(), // Added roleName support
    department: zod_1.z.string().optional(),
    designation: zod_1.z.string().optional()
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
const requestRegistration = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name, roleId, roleName, department, designation } = registerSchema.parse(data);
    const existingUser = yield db_1.default.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        throw new Error('User already exists');
    }
    const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
    let finalRoleId = roleId;
    // If no ID provided, try to find by Name, or default to EMPLOYEE
    if (!finalRoleId) {
        const targetRoleName = roleName ? roleName.toUpperCase() : 'EMPLOYEE';
        const role = yield db_1.default.role.findUnique({
            where: { name: targetRoleName }
        });
        // Fallback to EMPLOYEE if specific role not found (safety net)
        if (!role && targetRoleName !== 'EMPLOYEE') {
            const employeeRole = yield db_1.default.role.findUnique({
                where: { name: 'EMPLOYEE' }
            });
            finalRoleId = employeeRole === null || employeeRole === void 0 ? void 0 : employeeRole.id;
        }
        else {
            finalRoleId = role === null || role === void 0 ? void 0 : role.id;
        }
    }
    const user = yield db_1.default.user.create({
        data: {
            email,
            name,
            password: hashedPassword,
            status: client_1.UserStatus.ACTIVE,
            roleId: finalRoleId,
            department,
            designation
        },
    });
    return { id: user.id, email: user.email, status: user.status };
});
exports.requestRegistration = requestRegistration;
const verifyCredentials = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { email, password } = loginSchema.parse(data);
    const user = yield db_1.default.user.findUnique({
        where: { email },
        include: { role: true }
    });
    if (!user) {
        console.log('User not found:', email);
        throw new Error('Invalid credentials');
    }
    // Cast user to any to avoid TS errors with potentially stale Prisma types
    const userWithPassword = user;
    if (!userWithPassword.password) {
        throw new Error('Invalid credentials');
    }
    const isValid = yield bcryptjs_1.default.compare(password, userWithPassword.password);
    if (!isValid) {
        console.log('Password mismatch for user:', email);
        throw new Error('Invalid credentials');
    }
    if (user.status !== client_1.UserStatus.ACTIVE) {
        // In a real app we might allow login but restrict access, or deny login.
        // For now, let's allow it but the frontend should handle the PENDING state.
        // OR deny it:
        // throw new Error(`Account is ${user.status}`);
    }
    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
        return {
            requires2FA: true,
            email: user.email,
            id: user.id
        };
    }
    const token = jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
        roleId: user.roleId,
        role: (_a = user.role) === null || _a === void 0 ? void 0 : _a.name,
        status: user.status,
        tokenVersion: user.tokenVersion
    }, process.env.JWT_SECRET || 'super-secret-key', { expiresIn: '1d' });
    // Return user info sans password
    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            roleId: user.roleId,
            role: (_b = user.role) === null || _b === void 0 ? void 0 : _b.name,
            status: user.status
        }
    };
});
exports.verifyCredentials = verifyCredentials;
const verify2FALogin = (userId, code) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const user = yield db_1.default.user.findUnique({
        where: { id: userId },
        include: { role: true }
    });
    if (!user || !user.twoFactorSecret) {
        throw new Error('2FA not configured for this user');
    }
    const isValid = tfaService.verifyToken(code, user.twoFactorSecret);
    if (!isValid) {
        throw new Error('Invalid authentication code');
    }
    const token = jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
        roleId: user.roleId,
        role: (_a = user.role) === null || _a === void 0 ? void 0 : _a.name,
        status: user.status,
        tokenVersion: user.tokenVersion
    }, process.env.JWT_SECRET || 'super-secret-key', { expiresIn: '1d' });
    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            roleId: user.roleId,
            role: (_b = user.role) === null || _b === void 0 ? void 0 : _b.name,
            status: user.status
        }
    };
});
exports.verify2FALogin = verify2FALogin;
const setup2FA = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield db_1.default.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new Error('User not found');
    const { secret, otpauth } = tfaService.generateSecret(user.email);
    const qrCode = yield tfaService.generateQRCode(otpauth);
    // Pre-save secret but don't enable it yet
    yield db_1.default.user.update({
        where: { id: userId },
        data: { twoFactorSecret: secret, twoFactorEnabled: false }
    });
    return { qrCode, secret };
});
exports.setup2FA = setup2FA;
const activate2FA = (userId, code) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield db_1.default.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret)
        throw new Error('2FA Setup not initiated');
    const isValid = tfaService.verifyToken(code, user.twoFactorSecret);
    if (!isValid)
        throw new Error('Invalid verification code');
    yield db_1.default.user.update({
        where: { id: userId },
        data: { twoFactorEnabled: true }
    });
    return { message: '2FA Activated successfully' };
});
exports.activate2FA = activate2FA;
const disable2FA = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.user.update({
        where: { id: userId },
        data: { twoFactorEnabled: false, twoFactorSecret: null }
    });
    return { message: '2FA disabled successfully' };
});
exports.disable2FA = disable2FA;
const requestPasswordReset = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield db_1.default.user.findUnique({
        where: { email },
    });
    if (!user) {
        // We don't want to leak user existence, but for internal HR app it might be fine.
        // However, let's keep it safe. In a real app we'd just return success regardless.
        throw new Error('User not found');
    }
    const token = crypto_1.default.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hour
    yield db_1.default.user.update({
        where: { id: user.id },
        data: {
            resetToken: token,
            resetTokenExpiry: expiry,
        },
    });
    // Send email
    yield emailService.sendPasswordResetEmail(user.email, token);
});
exports.requestPasswordReset = requestPasswordReset;
const resetPassword = (token, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield db_1.default.user.findFirst({
        where: {
            resetToken: token,
            resetTokenExpiry: {
                gt: new Date(),
            },
        },
    });
    if (!user) {
        throw new Error('Invalid or expired reset token');
    }
    const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
    yield db_1.default.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null,
        },
    });
});
exports.resetPassword = resetPassword;
const changePassword = (userId, currentPass, newPass) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield db_1.default.user.findUnique({ where: { id: userId } });
    if (!user || !user.password)
        throw new Error("User not found");
    const isValid = yield bcryptjs_1.default.compare(currentPass, user.password);
    if (!isValid)
        throw new Error("Incorrect current password");
    const hashedPassword = yield bcryptjs_1.default.hash(newPass, 10);
    return db_1.default.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
    });
});
exports.changePassword = changePassword;
const logoutOthers = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.default.user.update({
        where: { id: userId },
        data: { tokenVersion: { increment: 1 } }
    });
});
exports.logoutOthers = logoutOthers;
