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
exports.exportPDF = exports.exportExcel = exports.getAttendanceReport = void 0;
const timeEntryService = __importStar(require("../services/timeEntry.service"));
const db_1 = __importDefault(require("../config/db"));
const exceljs_1 = __importDefault(require("exceljs"));
const jspdf_1 = require("jspdf");
const jspdf_autotable_1 = __importDefault(require("jspdf-autotable"));
const getAttendanceReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { start, end, userId: queryUserId } = req.query;
        const loggedInUser = req.user;
        if (!start || !end) {
            return res.status(400).json({ error: 'Start and end dates are required' });
        }
        let targetUserId = loggedInUser === null || loggedInUser === void 0 ? void 0 : loggedInUser.id;
        let targetDepartment = undefined;
        // Fetch full user and role to determine permissions
        if (loggedInUser === null || loggedInUser === void 0 ? void 0 : loggedInUser.id) {
            const user = yield db_1.default.user.findUnique({
                where: { id: loggedInUser.id },
                include: { role: true }
            });
            const roleName = (_a = user === null || user === void 0 ? void 0 : user.role) === null || _a === void 0 ? void 0 : _a.name;
            if (roleName === 'ADMIN') {
                // Admin can see ANYONE. If queryUserId provided, filter by it. If not, see ALL (targetUserId = undefined).
                if (queryUserId) {
                    targetUserId = queryUserId;
                }
                else {
                    targetUserId = undefined; // Fetch Logic: undefined userId = ALL users
                }
            }
            else if (roleName === 'MANAGER') {
                // Manager sees their DEPARTMENT.
                if (queryUserId) {
                    targetUserId = queryUserId;
                }
                else {
                    targetUserId = undefined; // Don't filter by ID
                    targetDepartment = (user === null || user === void 0 ? void 0 : user.department) || undefined;
                }
                if (!targetDepartment && !queryUserId) {
                    // Fallback if no dept assigned: See self
                    targetUserId = loggedInUser.id;
                }
            }
            else {
                // Employee: STRICTLY Self
                targetUserId = loggedInUser.id;
            }
        }
        const report = yield timeEntryService.getReport(new Date(start), new Date(end), targetUserId, targetDepartment);
        res.json(report);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getAttendanceReport = getAttendanceReport;
const exportExcel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { start, end, userId: queryUserId } = req.query;
        const loggedInUser = req.user;
        if (!start || !end) {
            return res.status(400).json({ error: 'Start and end dates are required' });
        }
        let targetUserId = loggedInUser === null || loggedInUser === void 0 ? void 0 : loggedInUser.id;
        let targetDepartment = undefined;
        if (loggedInUser === null || loggedInUser === void 0 ? void 0 : loggedInUser.id) {
            const user = yield db_1.default.user.findUnique({ where: { id: loggedInUser.id }, include: { role: true } });
            const roleName = (_a = user === null || user === void 0 ? void 0 : user.role) === null || _a === void 0 ? void 0 : _a.name;
            if (roleName === 'ADMIN') {
                targetUserId = queryUserId ? queryUserId : undefined;
            }
            else if (roleName === 'MANAGER') {
                targetUserId = queryUserId ? queryUserId : undefined;
                targetDepartment = (user === null || user === void 0 ? void 0 : user.department) || undefined;
                if (!targetDepartment && !queryUserId)
                    targetUserId = loggedInUser.id;
            }
            else {
                targetUserId = loggedInUser.id;
            }
        }
        const report = yield timeEntryService.getReport(new Date(start), new Date(end), targetUserId, targetDepartment);
        const workbook = new exceljs_1.default.Workbook();
        const worksheet = workbook.addWorksheet('Attendance Report');
        worksheet.columns = [
            { header: 'Employee', key: 'name', width: 25 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Clock In', key: 'clockIn', width: 20 },
            { header: 'Clock Out', key: 'clockOut', width: 20 },
            { header: 'Type', key: 'type', width: 10 },
            { header: 'Hours Worked', key: 'hours', width: 15 },
        ];
        report.forEach((entry) => {
            worksheet.addRow({
                name: entry.user.name,
                email: entry.user.email,
                date: entry.clockIn.toISOString().split('T')[0],
                clockIn: entry.clockIn.toLocaleTimeString(),
                clockOut: entry.clockOut ? entry.clockOut.toLocaleTimeString() : 'N/A',
                type: entry.clockType,
                hours: entry.hoursWorked ? Number(entry.hoursWorked).toFixed(2) : '0.00'
            });
        });
        // Styling
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Attendance_Report_${start}.xlsx`);
        yield workbook.xlsx.write(res);
        res.end();
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.exportExcel = exportExcel;
const exportPDF = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { start, end, userId: queryUserId } = req.query;
        const loggedInUser = req.user;
        if (!start || !end) {
            return res.status(400).json({ error: 'Start and end dates are required' });
        }
        let targetUserId = loggedInUser === null || loggedInUser === void 0 ? void 0 : loggedInUser.id;
        let targetDepartment = undefined;
        if (loggedInUser === null || loggedInUser === void 0 ? void 0 : loggedInUser.id) {
            const user = yield db_1.default.user.findUnique({ where: { id: loggedInUser.id }, include: { role: true } });
            const roleName = (_a = user === null || user === void 0 ? void 0 : user.role) === null || _a === void 0 ? void 0 : _a.name;
            if (roleName === 'ADMIN') {
                targetUserId = queryUserId ? queryUserId : undefined;
            }
            else if (roleName === 'MANAGER') {
                targetUserId = queryUserId ? queryUserId : undefined;
                targetDepartment = (user === null || user === void 0 ? void 0 : user.department) || undefined;
                if (!targetDepartment && !queryUserId)
                    targetUserId = loggedInUser.id;
            }
            else {
                targetUserId = loggedInUser.id;
            }
        }
        const report = yield timeEntryService.getReport(new Date(start), new Date(end), targetUserId, targetDepartment);
        const doc = new jspdf_1.jsPDF();
        doc.setFontSize(18);
        doc.text('Attendance Report', 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Period: ${start} to ${end}`, 14, 30);
        const tableData = report.map((entry) => [
            entry.user.name,
            entry.clockIn.toISOString().split('T')[0],
            entry.clockIn.toLocaleTimeString(),
            entry.clockOut ? entry.clockOut.toLocaleTimeString() : 'N/A',
            entry.clockType,
            entry.hoursWorked ? Number(entry.hoursWorked).toFixed(2) : '0.00'
        ]);
        (0, jspdf_autotable_1.default)(doc, {
            startY: 40,
            head: [['Employee', 'Date', 'Clock In', 'Clock Out', 'Type', 'Hours']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [99, 102, 241] }
        });
        const pdfOutput = doc.output();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Attendance_Report_${start}.pdf`);
        res.send(Buffer.from(pdfOutput, 'binary'));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.exportPDF = exportPDF;
