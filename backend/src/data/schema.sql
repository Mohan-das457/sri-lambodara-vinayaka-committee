-- Sri Lambodara Vinayaka Committee Management System
-- Database Schema for MySQL 8.x / MariaDB

CREATE DATABASE IF NOT EXISTS `temple_committee`
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `temple_committee`;

-- 1. Members Table
CREATE TABLE IF NOT EXISTS `members` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `member_code` VARCHAR(30) NOT NULL UNIQUE,
  `full_name` VARCHAR(150) NOT NULL,
  `full_name_te` VARCHAR(150) DEFAULT NULL,
  `phone` VARCHAR(20) NOT NULL UNIQUE,
  `email` VARCHAR(150) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `designation` VARCHAR(100) DEFAULT 'Member', -- President, Vice President, Secretary, Treasurer, Executive Member, Member
  `designation_te` VARCHAR(100) DEFAULT 'సభ్యుడు',
  `join_date` DATE NOT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `avatar_url` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_member_status (`status`),
  INDEX idx_member_phone (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Users Table for Auth and Role-Based Access
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `member_id` INT NULL,
  `username` VARCHAR(60) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'treasurer', 'secretary', 'member') NOT NULL DEFAULT 'member',
  `status` ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
  `last_login` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_users_member` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE SET NULL,
  INDEX idx_users_role (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Funds Table (General and Festival Fund)
CREATE TABLE IF NOT EXISTS `funds` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `fund_code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `name_te` VARCHAR(100) NOT NULL,
  `balance` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Monthly Dues Table
CREATE TABLE IF NOT EXISTS `monthly_dues` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `member_id` INT NOT NULL,
  `due_month` INT NOT NULL, -- 1-12
  `due_year` INT NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL DEFAULT 1000.00,
  `paid_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `status` ENUM('pending', 'partial', 'paid') NOT NULL DEFAULT 'pending',
  `due_date` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_member_month_year` (`member_id`, `due_month`, `due_year`),
  CONSTRAINT `fk_dues_member` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE CASCADE,
  INDEX idx_dues_status (`status`),
  INDEX idx_dues_year_month (`due_year`, `due_month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Payments Table
CREATE TABLE IF NOT EXISTS `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `receipt_number` VARCHAR(50) NOT NULL UNIQUE,
  `member_id` INT NOT NULL,
  `due_id` INT NULL,
  `fund_code` VARCHAR(50) NOT NULL DEFAULT 'general',
  `amount` DECIMAL(10, 2) NOT NULL,
  `payment_mode` ENUM('Cash', 'UPI') NOT NULL DEFAULT 'Cash',
  `upi_ref` VARCHAR(100) DEFAULT NULL,
  `payment_date` DATE NOT NULL,
  `received_by` VARCHAR(100) NOT NULL,
  `remarks` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_payments_member` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_payments_due` FOREIGN KEY (`due_id`) REFERENCES `monthly_dues`(`id`) ON DELETE SET NULL,
  INDEX idx_payment_date (`payment_date`),
  INDEX idx_payment_receipt (`receipt_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Expenses Table
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `voucher_number` VARCHAR(50) NOT NULL UNIQUE,
  `fund_code` VARCHAR(50) NOT NULL DEFAULT 'general',
  `title` VARCHAR(200) NOT NULL,
  `title_te` VARCHAR(200) DEFAULT NULL,
  `category` VARCHAR(100) NOT NULL, -- Pooja Items, Maintenance, Electricity, Prasad, Ganesh Idol, Tent/Pandals, Sound/Light, Procession, Other
  `amount` DECIMAL(12, 2) NOT NULL,
  `expense_date` DATE NOT NULL,
  `paid_to` VARCHAR(150) NOT NULL,
  `approved_by` VARCHAR(150) NOT NULL,
  `bill_receipt_ref` VARCHAR(100) DEFAULT NULL,
  `remarks` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_expense_fund (`fund_code`),
  INDEX idx_expense_date (`expense_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Other Income / Donations Table
CREATE TABLE IF NOT EXISTS `other_income` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `receipt_number` VARCHAR(50) NOT NULL UNIQUE,
  `fund_code` VARCHAR(50) NOT NULL DEFAULT 'general',
  `donor_name` VARCHAR(150) NOT NULL,
  `donor_phone` VARCHAR(20) DEFAULT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `income_date` DATE NOT NULL,
  `payment_mode` ENUM('Cash', 'UPI') NOT NULL DEFAULT 'Cash',
  `upi_ref` VARCHAR(100) DEFAULT NULL,
  `purpose` VARCHAR(200) NOT NULL, -- Pooja Sponsorship, Annadanam, Festival Contribution, General Donation
  `received_by` VARCHAR(100) NOT NULL,
  `remarks` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_income_fund (`fund_code`),
  INDEX idx_income_date (`income_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Meetings Table
CREATE TABLE IF NOT EXISTS `meetings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `title_te` VARCHAR(200) DEFAULT NULL,
  `meeting_date` DATE NOT NULL,
  `meeting_time` TIME NOT NULL DEFAULT '19:30:00',
  `venue` VARCHAR(255) NOT NULL DEFAULT 'Sri Lambodara Vinayaka Temple Hall',
  `venue_te` VARCHAR(255) DEFAULT 'శ్రీ లంబోదర వినాయక ఆలయ ప్రాంగణం',
  `agenda` TEXT NOT NULL,
  `agenda_te` TEXT DEFAULT NULL,
  `minutes` TEXT DEFAULT NULL,
  `minutes_te` TEXT DEFAULT NULL,
  `decisions` TEXT DEFAULT NULL,
  `status` ENUM('Scheduled', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Scheduled',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_meeting_date (`meeting_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Meeting Attendance Table
CREATE TABLE IF NOT EXISTS `meeting_attendance` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `meeting_id` INT NOT NULL,
  `member_id` INT NOT NULL,
  `status` ENUM('Present', 'Absent', 'Excused') NOT NULL DEFAULT 'Absent',
  `notes` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_meeting_member` (`meeting_id`, `member_id`),
  CONSTRAINT `fk_att_meeting` FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_att_member` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Announcements Table
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `title_te` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `message_te` TEXT NOT NULL,
  `category` ENUM('Meeting', 'Festival', 'Dues', 'General') NOT NULL DEFAULT 'General',
  `priority` ENUM('Normal', 'High', 'Urgent') NOT NULL DEFAULT 'Normal',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Documents Table
CREATE TABLE IF NOT EXISTS `documents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `category` VARCHAR(100) NOT NULL, -- Meeting Resolution, Financial Statement, Government Registration, Festival Budget
  `file_path` VARCHAR(255) NOT NULL,
  `file_size` INT DEFAULT 0,
  `uploaded_by` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
