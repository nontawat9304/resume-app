import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, from, of, switchMap, map, tap, catchError, throwError } from 'rxjs';
import { Auth, user, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User as FirebaseUser, setPersistence, browserSessionPersistence } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, updateDoc, collection, getDocs, deleteDoc } from '@angular/fire/firestore';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  avatar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private router: Router = inject(Router);

  // Observable of the current Firebase user
  user$ = user(this.auth);

  // Signal for the current app user (with role/profile data)
  currentUser = signal<User | null>(null);

  constructor() {
    // Attempt to set persistence
    // Attempt to set persistence (Temporarily disabled due to SDK mismatch 'cls is not a constructor')
    /*
    try {
      setPersistence(this.auth, browserSessionPersistence)
        .then(() => {})
        .catch(err => console.error('Auth Persistence Failed:', err));
    } catch (e) {
      console.error('Critical Auth Persistence Error:', e);
    }
    */

    // Sync Firebase Auth state with our User interface
    this.user$.pipe(
      switchMap(firebaseUser => {
        if (!firebaseUser) return of(null);
        return this.getUserDocument(firebaseUser.uid);
      })
    ).subscribe(user => {
      this.currentUser.set(user);
    });
  }

  // --- Auth Actions ---

  login(email: string, password: string): Observable<any> {

    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(

      switchMap(credential =>
        this.getUserDocument(credential.user.uid).pipe(
          map(user => ({ user, uid: credential.user.uid }))
        )
      ),
      map(({ user, uid }) => {

        if (user) {
          // Self-Healing
          if (user.email === 'admin@test.com' && user.role !== 'admin') {
            user.role = 'admin';
            const userRef = doc(this.firestore, `users/${uid}`);
            updateDoc(userRef, { role: 'admin' }).catch(e => console.error("Admin auto-update failed", e));
          }
          if (!user.isActive) {
            signOut(this.auth);
            return { success: false, message: 'AUTH.USER_DISABLED' };
          }
          // Navigate only after knowing success
          // Delay navigation slightly to let component receive success
          if (user.role === 'admin') this.router.navigate(['/admin']);
          else this.router.navigate(['/dashboard']);
          return { success: true, user };
        } else {
          // Recovery
          const currentUser = this.auth.currentUser;
          if (currentUser || uid) {

            const recoveryUser: User = {
              id: uid,
              name: currentUser?.displayName || 'User',
              email: currentUser?.email || email || '',
              role: (currentUser?.email || email) === 'admin@test.com' ? 'admin' : 'user',
              isActive: true,
              avatar: ''
            };
            this.createUserDocument(recoveryUser);
            this.router.navigate(['/dashboard']);
            return { success: true, user: recoveryUser };
          }
          return { success: false, message: 'AUTH.USER_NOT_FOUND' };
        }
      }),
      catchError(err => {
        console.error('[Auth] Login Error Stream:', err);
        return throwError(() => this.mapFirebaseError(err));
      })
    );
  }

  register(userData: any): Observable<any> {
    return from(createUserWithEmailAndPassword(this.auth, userData.email, userData.password)).pipe(
      switchMap(async (credential) => {
        const newUser: User = {
          id: credential.user.uid,
          name: userData.name,
          email: userData.email,
          role: userData.email === 'admin@test.com' ? 'admin' : 'user', // Auto-admin for legacy admin email
          isActive: true,
          avatar: ''
        };
        await this.createUserDocument(newUser);
        return { success: true, user: newUser };
      }),
      catchError(err => throwError(() => this.mapFirebaseError(err)))
    );
  }

  logout() {
    signOut(this.auth).then(() => {
      this.router.navigate(['/login']);
    });
  }

  // --- Helpers ---

  private mapFirebaseError(err: any): string {
    const code = err.code || '';
    switch (code) {
      case 'auth/email-already-in-use': return 'AUTH.EMAIL_EXISTS';
      case 'auth/invalid-credential': return 'AUTH.INVALID_CREDENTIALS';
      case 'auth/weak-password': return 'AUTH.WEAK_PASSWORD';
      case 'auth/user-disabled': return 'AUTH.USER_DISABLED';
      case 'auth/operation-not-allowed': return 'AUTH.OPERATION_NOT_ALLOWED'; // Config error
      case 'auth/user-not-found': return 'AUTH.USER_NOT_FOUND';
      case 'auth/wrong-password': return 'AUTH.WRONG_PASSWORD';
      case 'auth/too-many-requests': return 'AUTH.TOO_MANY_REQUESTS';
      case 'auth/network-request-failed': return 'AUTH.NETWORK_ERROR';
      default:
        // Log raw error for debugging 400s
        console.error('Firebase Auth Error:', err);
        if (err.message && err.message.includes('INVALID_LOGIN_CREDENTIALS')) {
          return 'AUTH.INVALID_CREDENTIALS';
        }
        if (err.message && (err.message.includes('offline') || err.message.includes('400'))) {
          // 400 Bad Request usually means Invalid Payload or Key, but can be credentials
          return 'AUTH.INVALID_CREDENTIALS';
        }
        return code || err.message; // Return raw code if not found
    }
  }

  // --- Firestore Helpers ---

  private async createUserDocument(user: User) {
    const userRef = doc(this.firestore, `users/${user.id}`);
    await setDoc(userRef, user);
  }

  private getUserDocument(uid: string): Observable<User | null> {
    const userRef = doc(this.firestore, `users/${uid}`);
    return from(getDoc(userRef)).pipe(
      map(snapshot => snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as User : null)
    );
  }

  // --- Admin / Public Helpers ---

  getAllUsers(): Observable<User[]> {
    // CAUTION: This fetches ALL users. Safe for small apps, dangerous for large ones.
    const usersRef = collection(this.firestore, 'users');
    return from(getDocs(usersRef)).pipe(
      map(snapshot => snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() } as User)))
    );
  }

  updateUserStatus(userId: string, isActive: boolean) {
    const userRef = doc(this.firestore, `users/${userId}`);
    updateDoc(userRef, { isActive });
  }

  deleteUser(userId: string) {
    const userRef = doc(this.firestore, `users/${userId}`);
    // Note: This only deletes the User document, not their Auth account. 
    // Deleting Auth account requires Admin SDK (Cloud Functions) or client-side deleteUser(user) if logged in as that user.
    // For this simple app, we just remove the data record.
    deleteDoc(userRef);
  }

  // --- Account Management ---

  updateUser(user: User) {
    if (!this.currentUser()) return;
    const userRef = doc(this.firestore, `users/${user.id}`);
    updateDoc(userRef, { ...user }).then(() => {
      this.currentUser.set(user); // Optimistic update
    });
  }

  // Admin capabilities would be moved to a separate AdminService or secured via Firestore Rules
  // For now, keeping properties for compatibility
  get isLoggedIn() { return !!this.currentUser(); }
  get isAdmin() { return this.currentUser()?.role === 'admin'; }
}
