import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { getFirestore, collection, doc, setDoc, deleteDoc, query, where, getDocs, onSnapshot, Firestore } from 'firebase/firestore';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

export interface Experience {
  id?: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
  currentlyWorking: boolean;
}

export interface Education {
  id?: string;
  degree: string;
  school: string;
  fieldOfStudy?: string;
  graduationDate: string; // or endDate
  startDate?: string;
  description?: string;
}

export interface Training {
  name: string;
  courseCode?: string;
  skillCategory?: string;
  instructor?: string;
  learningObjective?: string;
  startDate?: string;
  endDate?: string;
  deliveryMode?: 'online' | 'onsite' | 'hybrid' | 'workshop' | 'job training';
  trainingLevel?: 'beginner' | 'intermediate' | 'advanced';
  skillType?: 'Reskill' | 'Upskill' | 'Cross-skill';
  prerequisites?: string;
  trainingCost?: number;
  note?: string;

  issuer: string;
  date: string;
  image?: string;
  showDetails?: boolean;
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  experience: Experience[];
  education: Education[];
  training: Training[];
  skills: string[];
  updatedAt: Date;
  isPublic?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ResumeService {
  private firestore: Firestore;
  private app: FirebaseApp;

  constructor() {
    // STANDALONE INIT: Bypass AngularFire DI to avoid SDK version mismatch
    this.app = getApps().length === 0 ? initializeApp(environment.firebase) : getApp();
    this.firestore = getFirestore(this.app);
    console.log('ResumeService: Firestore initialized standalone', this.firestore);
  }

  getResumesByUser(userId: string): Observable<Resume[]> {
    return new Observable((observer) => {
      let unsubscribe = () => { };
      try {
        const resumesRef = collection(this.firestore, 'resumes');
        const q = query(resumesRef, where('userId', '==', userId));

        unsubscribe = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          observer.next(this.mapDates(data));
        }, (error) => {
          console.error('Firestore Error (getResumesByUser):', error);
          observer.error(error);
        });
      } catch (err) {
        console.error('Critical Setup Error:', err);
        observer.error(err);
      }
      return () => unsubscribe();
    });
  }

  getResumeById(id: string): Observable<Resume | null> {
    return new Observable((observer) => {
      let unsubscribe = () => { };
      try {
        const resumeRef = doc(this.firestore, `resumes/${id}`);
        unsubscribe = onSnapshot(resumeRef, (snapshot) => {
          if (snapshot.exists()) {
            observer.next(this.mapDateSingle({ id: snapshot.id, ...snapshot.data() }) as Resume);
          } else {
            observer.next(null);
          }
        }, (error) => {
          console.error('Firestore Error (getResumeById):', error);
          observer.error(error);
        });
      } catch (err) {
        observer.error(err);
      }
      return () => unsubscribe();
    });
  }

  /**
   * Search with Client-side filtering for broader search,
   * or use a specific Firestore query for exact matches.
   * Note: Full-text search on Firestore requires Algolia/Typesense.
   * tailored here for basic "Public" resume search.
   */
  searchResumes(term: string): Observable<Resume[]> {
    const lowerTerm = term.toLowerCase().trim();
    if (!lowerTerm) return of([]);

    return from((async () => {
      // Fetches ALL public resumes (caution: scaling issue in production)
      const resumesRef = collection(this.firestore, 'resumes');
      const q = query(resumesRef, where('isPublic', '==', true));

      const snapshot = await getDocs(q);
      const allPublic = snapshot.docs.map(d => this.mapDateSingle({ id: d.id, ...d.data() })) as Resume[];

      return allPublic.filter(r => {
        const nameMatch = r.personalInfo?.fullName?.toLowerCase().includes(lowerTerm);
        const titleMatch = r.title?.toLowerCase().includes(lowerTerm);
        const skillMatch = r.skills?.some((s: string) => s.toLowerCase().includes(lowerTerm));
        return nameMatch || titleMatch || skillMatch;
      });
    })());
  }

  saveResume(resume: Resume): Observable<any> {
    const resumeRef = doc(this.firestore, `resumes/${resume.id}`);
    const dataToSave = {
      ...resume,
      updatedAt: new Date().toISOString() // Store as ISO String for consistency or Firestore Timestamp
    };
    return from(setDoc(resumeRef, dataToSave)).pipe(
      map(() => ({ success: true, id: resume.id }))
    );
  }

  deleteResume(id: string): Observable<any> {
    const resumeRef = doc(this.firestore, `resumes/${id}`);
    return from(deleteDoc(resumeRef)).pipe(
      map(() => ({ success: true }))
    );
  }

  // Helper to handle Firestore Timestamps if they return as objects
  private mapDates(data: any[]): any[] {
    return data.map(item => this.mapDateSingle(item));
  }

  private mapDateSingle(item: any): any {
    if (item.updatedAt && typeof item.updatedAt.toDate === 'function') {
      item.updatedAt = item.updatedAt.toDate();
    }
    return item;
  }
}
