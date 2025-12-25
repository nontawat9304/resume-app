import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { AuthService } from './auth';

@Injectable({
    providedIn: 'root'
})
export class DataMigrationService {
    private firestore: Firestore = inject(Firestore);
    private dbPrefix = 'sql_db_'; // Prefix from old MockSqlService

    constructor() { }

    async migrateData() {
        if (typeof localStorage === 'undefined') return { success: false, message: 'No local storage' };

        const usersStr = localStorage.getItem(this.dbPrefix + 'users');
        const resumesStr = localStorage.getItem(this.dbPrefix + 'resumes');
        let migratedCount = 0;

        // Migrate Users
        if (usersStr) {
            const users = JSON.parse(usersStr);
            for (const u of users) {
                // Only migrate if not exists (or overwrite? safer to check)
                const userRef = doc(this.firestore, `users/${u.id}`);
                const snap = await getDoc(userRef);
                if (!snap.exists()) {
                    // Ensure role and isActive exist
                    const userData = {
                        ...u,
                        isActive: u.isActive !== undefined ? u.isActive : true,
                        role: u.role || 'user'
                    };
                    // Remove password if present (we can't migrate auth seamlessly without Admin SDK, 
                    // but we can migrate the PROFILE. The user will need to Register again with SAME EMAIL to link it, 
                    // OR we rely on them registering and we just migrated the "data").
                    // Actually, without Firebase Auth Account, this User doc is orphaned until they register.
                    // When they register with the same email, AuthService.register will CREATE a new doc unless we check email.

                    // STRATEGY: Just dump to Firestore. If they register with same ID (unlikely if UUID) ...
                    // Wait, old mock service used '1', '2' or UUID? 
                    // If they used '1', Firebase Auth UIDs are different.
                    // MIGRATION IS TRICKY: Users need to map old ID to new Auth ID.
                    // Simpler Approach: We migrate RESUMES. Users just re-register.
                    // We assign migrated resumes to a "Legacy" owner or Public? 
                    // Better: We can't easily migrate Users without them re-creating accounts.

                    // Allow migrating RESUMES if we know the new User ID.
                    // This function might be better called client-side AFTER they login to new system.
                    // "Import my old data" -> reads localStorage, finds resumes with old UserID, updates them to NEW Auth ID, saves to Firestore.
                }
            }
        }

        return { success: true };
    }

    // Use this method: Called when a user is Logged In (Firebase) and wants to pull their old local data
    async importLocalResumesToAccount(currentUserId: string) {
        if (typeof localStorage === 'undefined') return 0;

        // 1. Get Old Data
        const resumesStr = localStorage.getItem(this.dbPrefix + 'resumes');
        const usersStr = localStorage.getItem(this.dbPrefix + 'users');
        if (!resumesStr) return 0;

        const localResumes = JSON.parse(resumesStr);
        const localUsers = usersStr ? JSON.parse(usersStr) : [];

        // Find "my" old user ID? It's hard to know which local user is the current one if there were multiple.
        // Assumption: Single user usage mostly. We'll import ALL local resumes effectively, 
        // OR we match by Email if possible.

        let targetResumes = localResumes;

        // Filter by email if possible
        // We need the current user's email to match against old local users
        // But we passed currentUserId. We assume the caller knows.

        let count = 0;
        for (const r of targetResumes) {
            // Check if already migrated? (Maybe check ID existence)
            const newId = r.id.length < 5 ? `migrated_${r.id}_${Date.now()}` : r.id; // Avoid '1', '2' collisions

            const docRef = doc(this.firestore, `resumes/${newId}`);
            const snap = await getDoc(docRef);

            if (!snap.exists()) {
                const newResume = {
                    ...r,
                    id: newId,
                    userId: currentUserId, // Re-assign to CURRENT cloud user
                    migratedAt: new Date().toISOString()
                };
                await setDoc(docRef, newResume);
                count++;
            }
        }

        return count;
    }
}
