-- CreateIndex
CREATE INDEX "leave_requests_user_id_status_idx" ON "leave_requests"("user_id", "status");

-- CreateIndex
CREATE INDEX "time_entries_user_id_status_idx" ON "time_entries"("user_id", "status");

-- CreateIndex
CREATE INDEX "time_entries_clock_in_idx" ON "time_entries"("clock_in");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");
