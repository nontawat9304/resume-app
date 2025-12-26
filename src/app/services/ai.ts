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
    // if (!apiKey) console.warn('AI Service: Missing API Key!');
    // else console.log('AI Service: Key loaded (ends with ' + apiKey.slice(-4) + ')');

    this.genAI = new GoogleGenerativeAI(apiKey);
    // Trying gemini-1.5-flash with the NEW KEY.
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  }

  async generateSummary(jobTitle: string, keywords: string[]): Promise<string> {
    // MOCK DATA RESPONSE
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(`ผู้เชี่ยวชาญด้าน ${jobTitle} ที่มีความกระตือรือล้นและมีประสบการณ์ในการแก้ปัญหา มีทักษะในด้าน ${keywords.join(', ')} พร้อมที่จะเรียนรู้เทคโนโลยีใหม่ๆ และมุ่งมั่นที่จะพัฒนาตนเองเพื่อสร้างคุณค่าให้กับองค์กร (Mock Data Generated)`);
      }, 1000);
    });

    /* REAL AI IMPLEMENTATION (Disabled due to API/Region issues)
    const prompt = `Write a professional resume summary...`;
    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) { ... } 
    */
  }

  // Wrapper to return Observable
  generateSummaryObs(jobTitle: string, keywords: string[]): Observable<string> {
    return from(this.generateSummary(jobTitle, keywords)).pipe(
      catchError(err => of('Error generating summary. Please check API Key/Region.'))
    );
  }

  generateExperienceDescription(title: string, company: string): Observable<string> {
    return this.generateExperienceDescriptionObs(title, company);
  }

  async generateExperienceDescriptionPromise(title: string, company: string): Promise<string> {
    // MOCK DATA RESPONSE
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(`• รับผิดชอบงานในตำแหน่ง ${title} ที่ ${company}\n• ประสานงานและร่วมมือกับทีมเพื่อบรรลุเป้าหมายของโครงการ\n• แก้ไขปัญหาหน้างานและปรับปรุงกระบวนการทำงานให้มีประสิทธิภาพ (Mock Data Generated)`);
      }, 1000);
    });

    /* REAL AI IMPLEMENTATION (Disabled)
    const prompt = `Write a professional resume job description...`;
    ... 
    */
  }

  generateExperienceDescriptionObs(title: string, company: string): Observable<string> {
    return from(this.generateExperienceDescriptionPromise(title, company)).pipe(
      catchError(err => {
        console.error('AI Service Error:', err);
        return of('Error generating description.');
      })
    );
  }
}
