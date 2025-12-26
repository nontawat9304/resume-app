import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas'; // Import html2canvas
import jsPDF from 'jspdf'; // Import jsPDF

export interface ThemeSettings {
    primaryColor: string;
    backgroundColor: string; // 'white' | 'warm' | 'gradient'
    fontFamily: string; // 'sans' | 'serif' | 'mono'
    headerStyle: string; // 'banner' | 'clean' | 'left-bar'
}

@Injectable({
    providedIn: 'root'
})
export class PdfService {

    constructor() { }

    public async exportToPdf(elementId: string, fileName: string, themeClass: string = '', customSettings?: ThemeSettings) {
        const original = document.getElementById(elementId);
        if (!original) {
            console.error('Element not found:', elementId);
            return;
        }

        // 0. Scroll to top to prevent offset issues
        window.scrollTo(0, 0);

        // 1. CLONE the element
        const clone = original.cloneNode(true) as HTMLElement;

        // 2. STYLE the clone for capture
        clone.classList.remove('d-none');
        clone.classList.remove('shadow-lg');

        // Apply Pre-defined Theme
        if (themeClass && themeClass !== 'custom') {
            clone.classList.add(themeClass);
        }

        // Apply Custom Theme via Dynamic CSS
        if (themeClass === 'custom' && customSettings) {
            const styleId = 'pdf-custom-style';
            // Remove existing style element if any, to ensure a clean update
            const oldStyle = document.getElementById(styleId);
            if (oldStyle) {
                oldStyle.remove();
            }

            let styleEl = document.createElement('style');
            styleEl.id = styleId;
            document.head.appendChild(styleEl);

            // Generate CSS
            const uniqueClass = 'custom-theme-' + Date.now();
            const css = this.generateCustomCss(customSettings, clone);

            clone.classList.add(uniqueClass);

            // Replace generic selector with unique class in generated CSS
            // Using split().join() for a more robust replacement of all occurrences
            styleEl.innerHTML = css.split('.custom-theme-scope').join('.' + uniqueClass);
        }

        // CRITICAL FIX: Remove Animations from Clone
        // Animations (like animate.css) restart on the clone, causing opacity: 0 during capture
        const animatedElements = clone.querySelectorAll('[class*="animate__"]');
        animatedElements.forEach(el => {
            const classes = el.getAttribute('class') || '';
            const newClasses = classes.split(' ').filter(c => !c.startsWith('animate__')).join(' ');
            el.setAttribute('class', newClasses);
            // Force visibility
            (el as HTMLElement).style.opacity = '1';
            (el as HTMLElement).style.animation = 'none';
        });

        // Critical styles for html2canvas
        // We place it absolutely on top of everything to ensure it's captured correctly
        clone.style.position = 'absolute';
        clone.style.left = '0';
        clone.style.top = '0';
        clone.style.width = '210mm';
        clone.style.minHeight = '297mm';
        clone.style.background = '#ffffff'; // Force white background
        clone.style.margin = '0';
        clone.style.padding = '20px'; // Add padding
        clone.style.zIndex = '10000'; // Visible on top of everything
        clone.style.overflow = 'visible';

        // 3. APPEND to Body
        document.body.appendChild(clone);

        // 4. WAIT for images/fonts
        const images = clone.getElementsByTagName('img');
        const promises = Array.from(images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve;
            });
        });
        await Promise.all(promises);
        await new Promise(resolve => setTimeout(resolve, 500)); // Short wait

        try {
            // 5. CAPTURE
            const canvas = await html2canvas(clone, {
                scale: 5, // Ultra High Res (Max Sharpness)
                useCORS: true,
                allowTaint: false, // Critical: Must be false to use toDataURL
                logging: false,
                scrollX: 0,
                scrollY: 0,
                x: 0,
                y: 0,
                windowWidth: 1600 // Simulate Large Desktop
            });

            const contentDataURL = canvas.toDataURL('image/jpeg', 1.0); // Max Quality JPEG
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // One Page Logic: If height > 297, scale down to fit? 
            // Better behavior: Standard fit width, let it flow to page 2 if needed (default), 
            // BUT user asked for "One Page". 
            // Strategy: If 'compact' theme, force fit.

            if (themeClass.includes('compact') && imgHeight > 297) {
                pdf.addImage(contentDataURL, 'JPEG', 0, 0, imgWidth, 297); // Squash? No, better scale
                // Scaling to fit 1 page
                const ratio = 297 / imgHeight;
                pdf.addImage(contentDataURL, 'JPEG', 0, 0, imgWidth * ratio, 297);
            } else {
                pdf.addImage(contentDataURL, 'JPEG', 0, 0, imgWidth, imgHeight);
            }

            pdf.save(fileName + '.pdf');
        } catch (error) {
            console.error('PDF Generation Error:', error);
            alert('ขออภัย เกิดข้อผิดพลาดในการสร้าง PDF (อาจเกิดจากรูปภาพ)\nลองเปลี่ยนรูปภาพหรือลองใหม่อีกครั้งนะครับ');
        } finally {
            // 6. REMOVE clone
            document.body.removeChild(clone);
        }
    }

    private generateCustomCss(settings: ThemeSettings, clone: HTMLElement): string {
        const primary = settings.primaryColor || '#000000';
        let bgStyle = '';
        let fontStyle = '';
        let headerCss = '';

        // Background
        if (settings.backgroundColor === 'warm') {
            bgStyle = 'background: #fdfbf7 !important;';
        } else if (settings.backgroundColor === 'gradient') {
            bgStyle = 'background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%) !important;';
        } else {
            bgStyle = 'background: #ffffff !important;';
        }

        // Font
        if (settings.fontFamily === 'serif') {
            fontStyle = "font-family: 'Georgia', 'Times New Roman', serif !important;";
        } else if (settings.fontFamily === 'mono') {
            fontStyle = "font-family: 'Courier New', monospace !important;";
        } else {
            fontStyle = "font-family: 'Segoe UI', Roboto, sans-serif !important;";
        }

        // Header Layout Strategies
        if (settings.headerStyle === 'banner') {
            headerCss = `
                /* Strategy: Container has padding, Header pulls itself out */
                .custom-theme-scope { 
                    padding: 0 100px 100px 100px !important; 
                    border: none; 
                }
                .custom-theme-scope header {
                    background: ${primary} !important;
                    color: white !important;
                    /* Negative margins to span full width over container padding */
                    margin-left: -100px !important;
                    margin-right: -100px !important;
                    padding: 80px 100px !important; 
                    margin-bottom: 50px;
                }
                .custom-theme-scope header h1, .custom-theme-scope header p, .custom-theme-scope header i {
                    color: white !important;
                }
            `;
        } else if (settings.headerStyle === 'left-bar') {
            headerCss = `
                /* Strategy: Thick Left Border acting as bar */
                .custom-theme-scope {
                    border-left: 20px solid ${primary} !important;
                    padding: 60px 100px 60px 100px !important; 
                }
                .custom-theme-scope header {
                    border-bottom: 2px solid ${primary} !important;
                    padding-bottom: 30px;
                    margin-bottom: 40px;
                }
            `;
        } else {
            // Clean
            headerCss = `
                /* Strategy: Standard padded container with simple header */
                .custom-theme-scope { 
                    padding: 80px 100px !important; 
                    border: none; 
                }
                .custom-theme-scope header {
                    border-bottom: 1px solid #ccc;
                    padding-bottom: 30px;
                    margin-bottom: 40px;
                }
            `;
        }

        return `
            .custom-theme-scope {
                ${bgStyle}
                ${fontStyle}
                color: #333 !important;
                font-size: 0.9rem !important;
                line-height: 1.7;
            }
            
            /* Universal Reset for Grid inside PDF Scope */
            .custom-theme-scope .row {
                margin-left: 0 !important;
                margin-right: 0 !important;
                padding: 0 !important;
                width: 100% !important;
            }
            
            /* Columns - Add Gutter but keep content aligned */
            .custom-theme-scope .col-md-8, .custom-theme-scope .col-md-4, .custom-theme-scope .col-12 {
                padding-left: 15px !important;
                padding-right: 15px !important;
            }

            .custom-theme-scope section {
                margin-bottom: 35px !important;
            }

            /* Typography Overrides */
            .custom-theme-scope h1.display-4, .custom-theme-scope h1 {
                font-size: 2.4rem !important;
                font-weight: 800 !important;
                letter-spacing: -0.5px;
            }
            .custom-theme-scope p.lead {
                font-size: 1.2rem !important;
                font-weight: 500;
            }
            .custom-theme-scope h4 {
                font-size: 1.15rem !important;
                font-weight: 700 !important;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-top: 1.5rem;
                margin-bottom: 1.5rem;
                color: ${settings.headerStyle === 'banner' ? '#444' : primary} !important;
                border-bottom: 1px solid #eee;
                padding-bottom: 10px;
            }
            .custom-theme-scope h1, .custom-theme-scope h5, .custom-theme-scope h6 {
                color: ${settings.headerStyle === 'banner' ? '#333' : primary} !important;
            }
             .custom-theme-scope .badge {
                background-color: ${primary} !important;
                color: white !important;
                padding: 0.5em 0.8em;
            }
            ${headerCss}
        `;
    }
}
