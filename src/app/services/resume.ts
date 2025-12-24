import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { MockSqlService } from '../mock-db/mock-sql.service';

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
  graduationDate: string;
}

export interface Training {
  name: string; // Course Name (legacy/main)
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
  date: string; // Keep for legacy, maybe map to endDate
  image?: string;
  showDetails?: boolean; // UI State
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
}

@Injectable({
  providedIn: 'root'
})
export class ResumeService {
  constructor(private db: MockSqlService) { }

  getResumesByUser(userId: string) {
    // SQL: SELECT * FROM resumes WHERE userId = ?
    const resumes = this.db.query('resumes', (r) => r.userId === userId);
    return of(resumes);
  }

  getResumeById(id: string) {
    // SQL: SELECT * FROM resumes WHERE id = ?
    const resumes = this.db.query('resumes', (r) => r.id === id);
    return of(resumes[0] || null);
  }

  /**
   * Search with SQL-like LIKE Logic
   * Checks Name, Email, Job Title, or Skills
   */
  searchResumes(term: string) {
    const lowerTerm = term.toLowerCase().trim();
    if (!lowerTerm) return of([]);

    // SQL: SELECT * FROM resumes WHERE lower(fullName) LIKE %term% OR ...
    const results = this.db.query('resumes', (r) => {
      const nameMatch = r.personalInfo?.fullName?.toLowerCase().includes(lowerTerm);
      const emailMatch = r.personalInfo?.email?.toLowerCase().includes(lowerTerm);
      const titleMatch = r.title?.toLowerCase().includes(lowerTerm);

      // Also check if any skill matches
      const skillMatch = r.skills?.some((s: string) => s.toLowerCase().includes(lowerTerm));

      return nameMatch || emailMatch || titleMatch || skillMatch;
    });

    return of(results);
  }

  saveResume(resume: Resume) {
    console.log('[ResumeService] Saving resume:', resume);
    const existing = this.db.query('resumes', (r) => r.id === resume.id);

    if (existing.length > 0) {
      // UPDATE
      console.log('[ResumeService] Updating existing resume');
      this.db.update('resumes', resume, (r) => r.id === resume.id);
    } else {
      // INSERT
      console.log('[ResumeService] Inserting new resume');
      this.db.insert('resumes', resume);
    }
    return of({ success: true, id: resume.id });
  }
  deleteResume(id: string) {
    this.db.delete('resumes', (r) => r.id === id);
    return of({ success: true });
  }
}
