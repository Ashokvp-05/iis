-- CreateEnum
CREATE TYPE "PayslipStatus" AS ENUM ('GENERATED', 'SENT', 'DOWNLOADED');

-- CreateTable
CREATE TABLE "payslips" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "file_url" TEXT NOT NULL,
    "status" "PayslipStatus" NOT NULL DEFAULT 'GENERATED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payslips_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payslips_user_id_idx" ON "payslips"("user_id");

-- CreateIndex
CREATE INDEX "payslips_year_month_idx" ON "payslips"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "payslips_user_id_month_year_key" ON "payslips"("user_id", "month", "year");

-- AddForeignKey
ALTER TABLE "payslips" ADD CONSTRAINT "payslips_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
