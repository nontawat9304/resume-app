import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../../environments/environment';
import { from, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = (environment as any).GEMINI_API_KEY || '';
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  generateSummary(jobTitle: string, keywords: string[]): Observable<string> {
    if (!jobTitle) return of('');

    const prompt = `Write a professional resume summary for a ${jobTitle}. 
    Keywords to include: ${keywords.join(', ')}. 
    Keep it under 50 words. Professional tone.`;

    return from(this.model.generateContent(prompt)).pipe(
      map((result: any) => result.response.text()),
      catchError(err => {
        console.error('AI Generation Error:', err);
        return of('Error generating summary. Please try again.');
      })
    );
  }

  generateExperienceDescription(role: string, company: string): Observable<string> {
    const prompt = `Write 3 bullet points for a resume experience section.
    Role: ${role}
    Company: ${company}
    Focus on achievements and impact. match the style of a modern tech resume.`;

    return from(this.model.generateContent(prompt)).pipe(
      map((result: any) => result.response.text()),
      catchError(err => {
        console.error('AI Generation Error:', err);
        return of('Could not generate description.');
      })
    );
  }
}
