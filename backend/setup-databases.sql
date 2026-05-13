-- ============================================================
-- Transpolink — MySQL Database Setup Script
-- Run this ONCE before starting any backend service
-- ============================================================

CREATE DATABASE IF NOT EXISTS transpolink_identity;
CREATE DATABASE IF NOT EXISTS transpolink_traffic;
CREATE DATABASE IF NOT EXISTS transpolink_transport;
CREATE DATABASE IF NOT EXISTS transpolink_incident;
CREATE DATABASE IF NOT EXISTS transpolink_compliance;
CREATE DATABASE IF NOT EXISTS transpolink_reporting;
CREATE DATABASE IF NOT EXISTS transpolink_notification;

-- Verify
SHOW DATABASES LIKE 'transpolink_%';
