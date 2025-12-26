import { ApplicationConfig, importProvidersFrom, Injectable, LOCALE_ID } from '@angular/core';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { environment } from '../environments/environment';
import { provideRouter, withRouterConfig } from '@angular/router';
import { routes } from './app.routes';
import { HttpClient, provideHttpClient, withFetch } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
// import { TranslateHttpLoader } from '@ngx-translate/http-loader'; // REMOVED CAUSING ISSUES
import { Observable, of, catchError } from 'rxjs';
import { registerLocaleData } from '@angular/common';
import localeTh from '@angular/common/locales/th';

registerLocaleData(localeTh);

@Injectable({ providedIn: 'root' })
export class CustomTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    const th = {
      "NAV": {
        "BRAND": "ResumeApp",
        "LOGIN": "เข้าสู่ระบบ",
        "REGISTER": "สมัครสมาชิก",
        "DASHBOARD": "แดชบอร์ด",
        "PROFILE": "โปรไฟล์",
        "LOGOUT": "ออกจากระบบ"
      },
      "DASHBOARD": {
        "YOUR_RESUMES": "เรซูเม่ของคุณ",
        "NO_RESUMES": "ยังไม่มีเรซูเม่ เริ่มสร้างเลย!",
        "UPDATE_RESUME": "อัพเดทเรซูเม่",
        "ADDED_CERT": "เพิ่มใบรับรอง",
        "HIDE_DETAILS": "ซ่อนรายละเอียด",
        "VIEW_DETAILS": "ดูรายละเอียด",
        "CREATE_NEW": "สร้างเรซูเม่ใหม่"
      },
      "EDITOR": {
        "TITLE": "แก้ไขเรซูเม่",
        "SAVE": "บันทึก",
        "SAVING": "กำลังบันทึก...",
        "POST": "โพสต์",
        "DETAILS_TITLE": "รายละเอียดงาน",
        "PERSONAL_INFO": "ข้อมูลส่วนตัว",
        "FULL_NAME": "ชื่อ-นามสกุล",
        "JOB_TITLE": "ตำแหน่งงาน",
        "PHONE": "เบอร์โทรศัพท์",
        "LOCATION": "ที่อยู่ / จังหวัด",
        "SUMMARY": "สรุปข้อมูลโดยย่อ",
        "EXPERIENCE": "ประสบการณ์ทำงาน",
        "ADD_POSITION": "เพิ่มประวัติงาน",
        "POSITION": "ตำแหน่ง",
        "FILL_REQUIRED": "ระบุชื่อตำแหน่งก่อนใช้ AI",
        "JOB_TITLE_LABEL": "ชื่อตำแหน่ง",
        "COMPANY_LABEL": "ชื่อบริษัท",
        "DESCRIPTION_LABEL": "รายละเอียด",
        "AI_WRITER": "เขียนด้วย AI",
        "EDUCATION": "การศึกษา",
        "ADD_EDUCATION": "เพิ่มประวัติการศึกษา",
        "SCHOOL": "สถาบันการศึกษา",
        "DEGREE": "วุฒิการศึกษา",
        "FIELD": "สาขาวิชา",
        "EDU_START_DATE": "ปีที่เข้าศึกษา",
        "EDU_END_DATE": "ปีที่จบการศึกษา",
        "TRAINING": "การฝึกอบรม & ใบรับรอง",
        "SKILLS": "ทักษะ",
        "ADD_TRAINING": "เพิ่มประวัติการฝึกอบรม",
        "CERT_NAME": "ชื่อหลักสูตร / ใบรับรอง",
        "COURSE_CODE": "รหัสหลักสูตร",
        "ISSUER": "สถาบัน / ผู้จัด",
        "INSTRUCTOR": "ผู้สอน",
        "DELIVERY_MODE": "รูปแบบการเรียน",
        "TRAINING_LEVEL": "ระดับ",
        "SKILL_TYPE": "ประเภททักษะ",
        "START_DATE": "วันที่เริ่ม",
        "END_DATE": "วันที่สิ้นสุด",
        "CERT_IMAGE": "รูปภาพใบรับรอง",
        "UPLOAD_IMAGE": "อัปโหลดรูปภาพ",
        "SHARE_HINT": "แบ่งปันความสำเร็จใหม่ของคุณกับชุมชน",
        "CODE": "รหัสวิชา",
        "TYPE": "ประเภท",
        "LEVEL": "ระดับ",
        "OBJECTIVE": "สิ่งที่เรียนรู้",
        "PREREQUISITES": "พื้นฐานที่ต้องมี",
        "NOTE": "หมายเหตุ",
        "AT": "ที่",
        "PRESENT": "ปัจจุบัน",
        "NO_SUMMARY": "ไม่มีข้อมูลสรุป",
        "NAME_PLACEHOLDER": "ชื่อคอร์ส / ใบรับรอง",
        "CODE_PLACEHOLDER": "รหัส (ถ้ามี)",
        "INSTITUTE_PLACEHOLDER": "ชื่อสถาบัน / ผู้จัด",
        "SKILLS_PLACEHOLDER": "เช่น Java, Angular, Leadership (คั่นด้วยจุลภาค)",
        "MODES": {
          "ONLINE": "ออนไลน์",
          "ONSITE": "ออนไซต์ (เรียนสด)",
          "HYBRID": "ไฮบริด",
          "WORKSHOP": "เวิร์คช็อป",
          "JOB_TRAINING": "ฝึกงาน / หน้างาน"
        },
        "LEVELS": {
          "BEGINNER": "เบื้องต้น",
          "INTERMEDIATE": "ปานกลาง",
          "ADVANCED": "ขั้นสูง"
        },
        "TYPES": {
          "UPSKILL": "เพิ่มทักษะเดิม (Upskill)",
          "RESKILL": "สร้างทักษะใหม่ (Reskill)",
          "CROSS_SKILL": "ทักษะข้ามสาย (Cross-skill)"
        }
      },
      "AUTH": {
        "LOGIN_TITLE": "เข้าสู่ระบบ",
        "REGISTER_TITLE": "สมัครสมาชิก",
        "EMAIL": "อีเมล",
        "PASSWORD": "รหัสผ่าน",
        "NAME": "ชื่อ-นามสกุล",
        "FIRST_NAME": "ชื่อจริง",
        "LAST_NAME": "นามสกุล",
        "SUBMIT_LOGIN": "เข้าสู่ระบบ",
        "SUBMIT_REGISTER": "สมัครสมาชิก",
        "NO_ACCOUNT": "ยังไม่มีบัญชี?",
        "HAS_ACCOUNT": "มีบัญชีแล้ว?",
        "REGISTER_LINK": "สมัครสมาชิกที่นี่",
        "LOGIN_LINK": "เข้าสู่ระบบที่นี่",
        "REGISTER_SUCCESS": "สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ",
        "LOGOUT": "ออกจากระบบ",
        "LOGGING_IN": "กำลังเข้าสู่ระบบ...",
        "EMAIL_EXISTS": "อีเมลนี้มีผู้ใช้งานแล้ว",
        "INVALID_CREDENTIALS": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
        "WEAK_PASSWORD": "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร",
        "INVALID_EMAIL": "กรุณากรอกอีเมลให้ถูกต้อง",
        "PASSWORD_REQUIRED": "กรุณากรอกรหัสผ่าน",
        "PASSWORD_MIN_LENGTH": "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
        "REQUIRED_FIELD": "ข้อมูลนี้จำเป็นต้องกรอก",
        "USER_DISABLED": "บัญชีนี้ถูกระงับการใช้งาน",
        "OPERATION_NOT_ALLOWED": "ระบบยังไม่เปิดใช้งานการเข้าสู่ระบบ (กรุณาตั้งค่า Firebase Console)",
        "USER_NOT_FOUND": "ไม่พบผู้ใช้งานนี้",
        "WRONG_PASSWORD": "รหัสผ่านไม่ถูกต้อง",
        "TOO_MANY_REQUESTS": "ทำรายการเกินกำหนด กรุณารอสักครู่",
        "DATABASE_ERROR": "ไม่พบฐานข้อมูล (กรุณาสร้าง Firestore Database ใน Console)",
        "NETWORK_ERROR": "การเชื่อมต่อขัดข้อง กรุณาตรวจสอบอินเทอร์เน็ต"
      },
      "HOME": {
        "TITLE": "สร้างเรซูเม่และพอร์ตโฟลิโอของคุณ",
        "SUBTITLE": "ออกแบบโปรไฟล์มืออาชีพได้ง่ายๆ ในไม่กี่นาที",
        "GET_STARTED": "เริ่มต้นใช้งานฟรี"
      },
      "ALERT": {
        "IMAGE_TOO_LARGE": "รูปภาพมีขนาดใหญ่เกินไป! กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB",
        "FORM_INVALID": "กรุณากรอกข้อมูลในช่องที่มีเครื่องหมาย * ให้ครบถ้วน",
        "SAVE_SUCCESS_RESUME": "บันทึกข้อมูลเรียบร้อยแล้ว! 💾",
        "SAVE_SUCCESS_NEW": "สร้างเรซูเม่ใหม่เรียบร้อยแล้ว! ไปดูที่หน้าแดชบอร์ดกันเลย 🚀",
        "SAVE_ERROR": "เกิดข้อผิดพลาดในการบันทึก... กรุณาลองใหม่อีกครั้ง",
        "SESSION_EXPIRED": "เซสชั่นหมดอายุ... กรุณาเข้าสู่ระบบใหม่",
        "UPDATE_TRAINING": "อัปเดตข้อมูลการฝึกอบรมเรียบร้อยแล้ว! 🎓",
        "ADD_TRAINING": "เพิ่มประวัติการฝึกอบรมสำเร็จแล้ว! 🎉",
        "DELETE_TRAINING_CONFIRM": "คุณต้องการลบข้อมูลการฝึกอบรมนี้ใช่หรือไม่?",
        "DELETE_RESUME_CONFIRM": "คุณแน่ใจว่าต้องการลบเรซูเม้นี้? (ไม่สามารถกู้คืนได้) 🗑️",
        "DELETE_SUCCESS": "ลบข้อมูลเรียบร้อยแล้ว"
      },
      "COMMON": {
        "CANCEL": "ยกเลิก",
        "CONFIRM": "ยืนยัน",
        "EDIT": "แก้ไข",
        "DELETE": "ลบ",
        "EXPORT": "ส่งออก PDF",
        "SELECT_THEME": "เลือกธีม",
        "EXPORT_DEFAULT": "แบบมาตรฐาน",
        "EXPORT_MODERN": "แบบทันสมัย (สีฟ้า)",
        "EXPORT_CLASSIC": "แบบคลาสสิค (Serif)",
        "EXPORT_CUSTOM": "ปรับแต่งเอง..."
      }
    };

    const en = {
      "NAV": {
        "BRAND": "ResumeApp",
        "LOGIN": "Login",
        "REGISTER": "Register",
        "DASHBOARD": "Dashboard",
        "PROFILE": "Profile",
        "LOGOUT": "Logout"
      },
      "DASHBOARD": {
        "YOUR_RESUMES": "Your Resumes",
        "NO_RESUMES": "No resumes yet. Create one now!",
        "UPDATE_RESUME": "Update Resume",
        "ADDED_CERT": "Added Certificate",
        "HIDE_DETAILS": "Hide Details",
        "VIEW_DETAILS": "View Details",
        "CREATE_NEW": "Create New Resume"
      },
      "EDITOR": {
        "TITLE": "Edit Resume",
        "SAVE": "Save",
        "SAVING": "Saving...",
        "POST": "Post",
        "DETAILS_TITLE": "Job Details",
        "PERSONAL_INFO": "Personal Info",
        "FULL_NAME": "Full Name",
        "JOB_TITLE": "Job Title",
        "PHONE": "Phone",
        "LOCATION": "Location",
        "SUMMARY": "Summary",
        "EXPERIENCE": "Work Experience",
        "ADD_POSITION": "Add Position",
        "POSITION": "Position",
        "FILL_REQUIRED": "Please fill position name before using AI",
        "JOB_TITLE_LABEL": "Position Title",
        "COMPANY_LABEL": "Company",
        "DESCRIPTION_LABEL": "Description",
        "AI_WRITER": "Write with AI",
        "EDUCATION": "Education",
        "ADD_EDUCATION": "Add Education",
        "SCHOOL": "School / University",
        "DEGREE": "Degree",
        "FIELD": "Field of Study",
        "EDU_START_DATE": "Start Year",
        "EDU_END_DATE": "End Year / Graduation",
        "TRAINING": "Training & Certifications",
        "SKILLS": "Skills",
        "ADD_TRAINING": "Add Training",
        "CERT_NAME": "Course / Certificate Name",
        "COURSE_CODE": "Course Code",
        "ISSUER": "Issuer / Institute",
        "INSTRUCTOR": "Instructor",
        "DELIVERY_MODE": "Delivery Mode",
        "TRAINING_LEVEL": "Level",
        "SKILL_TYPE": "Skill Type",
        "START_DATE": "Start Date",
        "END_DATE": "End Date",
        "CERT_IMAGE": "Certificate Image",
        "UPLOAD_IMAGE": "Upload Image",
        "SHARE_HINT": "Share your achievement with the community",
        "CODE": "Code",
        "TYPE": "Type",
        "LEVEL": "Level",
        "OBJECTIVE": "Learning Objective",
        "PREREQUISITES": "Prerequisites",
        "NOTE": "Note",
        "AT": "at",
        "PRESENT": "Present",
        "NO_SUMMARY": "No summary provided",
        "NAME_PLACEHOLDER": "Course Name / Certificate",
        "CODE_PLACEHOLDER": "Code (Optional)",
        "INSTITUTE_PLACEHOLDER": "Institute / Issuer Name",
        "SKILLS_PLACEHOLDER": "e.g. Java, Angular, Leadership (comma separated)",
        "MODES": {
          "ONLINE": "Online",
          "ONSITE": "Onsite",
          "HYBRID": "Hybrid",
          "WORKSHOP": "Workshop",
          "JOB_TRAINING": "On-the-job Training"
        },
        "LEVELS": {
          "BEGINNER": "Beginner",
          "INTERMEDIATE": "Intermediate",
          "ADVANCED": "Advanced"
        },
        "TYPES": {
          "UPSKILL": "Upskill",
          "RESKILL": "Reskill",
          "CROSS_SKILL": "Cross-skill"
        }
      },
      "AUTH": {
        "LOGIN_TITLE": "Login",
        "REGISTER_TITLE": "Register",
        "EMAIL": "Email",
        "PASSWORD": "Password",
        "NAME": "Full Name",
        "FIRST_NAME": "First Name",
        "LAST_NAME": "Last Name",
        "SUBMIT_LOGIN": "Login",
        "SUBMIT_REGISTER": "Register",
        "NO_ACCOUNT": "No account?",
        "HAS_ACCOUNT": "Already have an account?",
        "REGISTER_LINK": "Register here",
        "LOGIN_LINK": "Login here",
        "REGISTER_SUCCESS": "Registration successful! Please login.",
        "LOGOUT": "Logout",
        "LOGGING_IN": "Logging in...",
        "EMAIL_EXISTS": "Email already exists",
        "INVALID_CREDENTIALS": "Invalid email or password",
        "WEAK_PASSWORD": "Password must be at least 6 characters",
        "INVALID_EMAIL": "Please enter a valid email",
        "PASSWORD_REQUIRED": "Password is required",
        "PASSWORD_MIN_LENGTH": "Password must be at least 6 characters",
        "REQUIRED_FIELD": "This field is required",
        "USER_DISABLED": "User account is disabled",
        "OPERATION_NOT_ALLOWED": "Login operation not allowed",
        "USER_NOT_FOUND": "User not found",
        "WRONG_PASSWORD": "Wrong password",
        "TOO_MANY_REQUESTS": "Too many requests, please try again later",
        "DATABASE_ERROR": "Database error",
        "NETWORK_ERROR": "Network error, please checking your connection"
      },
      "HOME": {
        "TITLE": "Create Your Resume & Portfolio",
        "SUBTITLE": "Design a professional profile in minutes.",
        "GET_STARTED": "Get Started Free"
      },
      "ALERT": {
        "IMAGE_TOO_LARGE": "Image too large! Please choose file size under 5MB",
        "FORM_INVALID": "Please fill in all required fields marked with *",
        "SAVE_SUCCESS_RESUME": "Resume saved successfully! 💾",
        "SAVE_SUCCESS_NEW": "New resume created! Check it out in your dashboard 🚀",
        "SAVE_ERROR": "Error saving data... Please try again",
        "SESSION_EXPIRED": "Session expired... Please login again",
        "UPDATE_TRAINING": "Training data updated! 🎓",
        "ADD_TRAINING": "Training history added successfully! 🎉",
        "DELETE_TRAINING_CONFIRM": "Are you sure you want to delete this training?",
        "DELETE_RESUME_CONFIRM": "Are you sure you want to delete this resume? (Cannot be undone) 🗑️",
        "DELETE_SUCCESS": "Deleted successfully"
      },
      "COMMON": {
        "CANCEL": "Cancel",
        "CONFIRM": "Confirm",
        "EDIT": "Edit",
        "DELETE": "Delete",
        "EXPORT": "Export PDF",
        "SELECT_THEME": "Select Theme",
        "EXPORT_DEFAULT": "Standard",
        "EXPORT_MODERN": "Modern (Blue)",
        "EXPORT_CLASSIC": "Classic (Serif)",
        "EXPORT_CUSTOM": "Custom..."
      }
    };

    // Robust Selection Logic
    if (lang && lang.toLowerCase().startsWith('th')) {
      return of(th);
    }
    // Default to English for everything else (en, es, fr, etc.)
    return of(en);
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withRouterConfig({ onSameUrlNavigation: 'reload' })),
    provideHttpClient(),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: CustomTranslateLoader
        },
        defaultLanguage: 'th'
      })
    ),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ]
};
