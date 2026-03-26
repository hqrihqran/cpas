-- ============================================================
--  CPAS: Notifications table migration
--  Run via: mysql -u root -p cpas_db < cpas_notifications_migration.sql
-- ============================================================

USE cpas_db;

-- ─── Create notifications table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id          INT            AUTO_INCREMENT PRIMARY KEY,

    -- NULL means it is a role-broadcast (no specific recipient).
    user_id     INT            NULL,

    -- For broadcast notifications ("Student", "Faculty", etc.).
    target_role VARCHAR(50)    NULL,

    -- "Job", "Task", "Alert", "System", etc.
    type        VARCHAR(50)    NOT NULL DEFAULT 'System',

    title       VARCHAR(255)   NOT NULL,
    message     TEXT           NOT NULL,

    is_read     TINYINT(1)     NOT NULL DEFAULT 0,
    created_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Soft FK – references users(id) but ON DELETE SET NULL so
    -- broadcast rows (user_id IS NULL) are still valid.
    CONSTRAINT fk_notif_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL,

    INDEX idx_notif_user      (user_id),
    INDEX idx_notif_role      (target_role),
    INDEX idx_notif_created   (created_at DESC),
    INDEX idx_notif_is_read   (is_read)
);

-- ─── Verify ──────────────────────────────────────────────────────────────────
SELECT 'notifications' AS tbl, COUNT(*) AS rows FROM notifications;
