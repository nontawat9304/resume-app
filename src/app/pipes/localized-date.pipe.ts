import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
    name: 'locDate',
    standalone: true,
    pure: false // To update when language changes
})
export class LocalizedDatePipe implements PipeTransform {

    constructor(private translate: TranslateService) { }

    transform(value: any, format: string = 'mediumDate'): any {
        if (!value) return null;
        // Robust fallback: current -> default -> 'th' -> 'en'
        const currentLang = this.translate.currentLang || this.translate.defaultLang || 'th';

        try {
            // Basic format mapping if needed, or rely on DatePipe
            const datePipe = new DatePipe(currentLang);
            return datePipe.transform(value, format);
        } catch (e) {
            console.error('Date pipe error', e);
            return value;
        }
    }
}
