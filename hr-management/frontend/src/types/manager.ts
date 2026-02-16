export interface ManagerOverview {
    totalActiveUsers: number;
    clockedIn: number;
    remoteCount: number;
    officeCount: number;
    attendanceRate: number;
    pendingApprovals: number;
    alerts: ManagerAlert[];
    remoteUsers: TeamMemberStatus[];
}

export interface ManagerAlert {
    id: string;
    type: 'LATE' | 'OVERTIME' | 'LEAVE_OVERLAP' | 'MISSING_ENTRY';
    message: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    createdAt: string;
}

export interface TeamMemberStatus {
    id: string;
    name: string;
    status: 'ONLINE' | 'OFFLINE' | 'REMOTE' | 'OAK';
    clockIn: string;
    location?: string;
    department?: string;
    avatar?: string;
}

export interface LeaveRequest {
    id: string;
    userId: string;
    type: string;
    startDate: string;
    endDate: string;
    reason?: string;
    status: string;
    createdAt: string;
    user: {
        name: string;
        email: string;
        department?: string;
    }
}
