# Billing Notification Platform Database Design

## ER Diagram Description

```
+----------------+       +-----------------+
|     roles      |       |     users       |
+----------------+       +-----------------+
| id (PK)        |<------| id (PK)         |
| name           |       | email           |
| description    |       | password_hash   |
| created_at     |       | first_name      |
| updated_at     |       | last_name       |
+----------------+       | phone           |
                         | patient_id      |
                         | role_id (FK)    |
                         | status          |
                         | email_verified  |
                         | verification_token |
                         | created_at      |
                         | updated_at      |
                         +-----------------+
                                | 1
                                |
                                | *
+----------------+       +-----------------+
| notification_  |       | user_notif_     |
| types          |       | preferences     |
+----------------+       +-----------------+
| id (PK)        |<------| id (PK)         |
| name           |       | user_id (FK)    |
| description    |       | notif_type_id (FK)|
| default_channels|      | channels_enabled|
| created_at     |       | enabled         |
| updated_at     |       | created_at      |
+----------------+       | updated_at      |
                         +-----------------+

+-----------------+
|     bills       |
+-----------------+
| id (PK)         |
| user_id (FK)    |
| billing_ref_id  |
| amount          |
| description     |
| due_date        |
| status          |
| created_by (FK) |
| created_at      |
| updated_at      |
+-----------------+
        | 1
        |
        | *
+-----------------+
|  notifications  |
+-----------------+
| id (PK)         |
| user_id (FK)    |
| notif_type_id (FK)|
| title           |
| message         |
| channels        |
| sent_at         |
| status          |
| error_message   |
| created_at      |
+-----------------+

+-----------------+
|   audit_logs    |
+-----------------+
| id (PK)         |
| user_id (FK)    |
| action          |
| table_name      |
| record_id       |
| old_values      |
| new_values      |
| timestamp       |
| ip_address      |
| user_agent      |
+-----------------+
```

### Relationships:
- **roles** 1:N **users** (Each user has one role)
- **users** 1:N **bills** (Users can have multiple bills)
- **users** 1:N **user_notification_preferences** (Users can have preferences for each notification type)
- **users** 1:N **notifications** (Users receive multiple notifications)
- **users** 1:N **audit_logs** (Users perform actions that are logged)
- **notification_types** 1:N **user_notification_preferences** (Each type can have preferences per user)
- **notification_types** 1:N **notifications** (Each type generates multiple notifications)
- **users** 1:N **bills** (created_by relationship - who created the bill)
- **bills** 1:N **notifications** (Bills can trigger multiple notifications)

## Design Decisions for Scalability and Security

### Scalability Decisions:

1. **UUID Primary Keys**: Used UUIDs instead of auto-incrementing integers for better distributed system compatibility and to prevent enumeration attacks.

2. **Indexing Strategy**:
   - Email and patient_id indexes on users for fast authentication and lookups
   - Composite indexes on frequently queried combinations (user_id + status, table_name + record_id)
   - Date-based indexes for time-range queries on bills and notifications

3. **Normalized Schema**: Proper normalization reduces data redundancy while maintaining referential integrity.

4. **JSONB for Audit Logs**: Flexible storage for old/new values allows capturing complex data changes without schema modifications.

5. **Array Types for Channels**: PostgreSQL arrays efficiently store multiple notification channels without additional tables.

6. **Views for Complex Queries**: `user_bills_summary` view pre-computes aggregations for dashboard performance.

### Security Decisions:

1. **Password Hashing**: Stores `password_hash` instead of plain passwords, assuming bcrypt or similar secure hashing.

2. **Role-Based Access Control (RBAC)**: Separate roles table with granular permissions (Admin, Billing Officer, Cashier, Patient).

3. **Audit Logging**: Comprehensive audit trail captures all changes to sensitive data (users, bills, notifications) with before/after values.

4. **Input Validation**: CHECK constraints on status fields prevent invalid data entry.

5. **Referential Integrity**: Foreign key constraints ensure data consistency and prevent orphaned records.

6. **Avoidance of Sensitive Data**: Uses `billing_reference_id` instead of storing medical details, complying with privacy regulations.

7. **Email Verification**: Token-based email verification prevents unauthorized account access.

8. **IP Address Logging**: Audit logs capture IP addresses for security monitoring.

### Additional Features:

- **Automatic Timestamps**: `updated_at` triggers ensure data integrity.
- **Overdue Bill Management**: Function to automatically mark bills as overdue.
- **Notification Preferences**: Users can customize which channels they receive notifications on.
- **Multi-Channel Notifications**: Support for in-app, email, and SMS notifications.
- **Pagination-Ready**: Indexes on timestamps enable efficient pagination for notification history.

This design provides a robust, scalable, and secure foundation for the billing notification platform while maintaining compliance with data protection standards.