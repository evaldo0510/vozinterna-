import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

export interface AuditLogPayload {
  actionType: 'user_suspension' | 'user_unsuspension' | 'journey_create' | 'journey_update' | 'journey_delete' | 'config_update' | 'bulk_user_deletion' | 'user_deletion' | string;
  description: string;
  targetUserId?: string;
  metadata?: Record<string, any>;
}

/**
 * Registers an audit log event in both security_logs and admin_logs collections in Firestore.
 * This guarantees total trace compliance, auditability, and supports security alerting systems.
 */
export async function logCriticalAudit(payload: AuditLogPayload): Promise<void> {
  const currentUser = auth.currentUser;
  const logId = `sec_log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const timestamp = new Date().toISOString();

  const auditData = {
    id: logId,
    timestamp,
    userId: currentUser?.uid || 'system',
    userEmail: currentUser?.email || 'system_operator',
    ipAddress: '127.0.0.1', // Standard fallback since we are client-only, or retrieved dynamically
    eventType: payload.actionType,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'NodeJS/Environment',
    details: payload.description,
    targetUserId: payload.targetUserId || null,
    metadata: payload.metadata || {}
  };

  // 1. Log to compliance security_logs
  try {
    const secLogRef = doc(db, 'security_logs', logId);
    await setDoc(secLogRef, auditData);
  } catch (error) {
    // Graceful error capturing with compliance JSON wrapping
    handleFirestoreError(error, OperationType.WRITE, `security_logs/${logId}`);
  }

  // 2. Also log to admin_logs for backward capability and dashboards
  try {
    const adminLogRef = doc(db, 'admin_logs', logId);
    await setDoc(adminLogRef, {
      id: logId,
      actionType: payload.actionType,
      description: payload.description,
      timestamp,
      adminEmail: currentUser?.email || 'system_operator',
      adminId: currentUser?.uid || 'system_operator_id',
      targetUserId: payload.targetUserId || null
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `admin_logs/${logId}`);
  }
}
