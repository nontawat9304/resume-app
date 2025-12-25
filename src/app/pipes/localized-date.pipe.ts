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
        const currentLang = this.translate.currentLang || this.translate.defaultLang || 'en';

        // Check if formatting for Thai to apply Buddhist Era
        if (currentLang === 'th' || currentLang === 'th-TH') {
            try {
                let date: Date | undefined;

                // Handle Firestore Timestamp or similar objects
                if (value && typeof value.toDate === 'function') {
                    date = value.toDate();
                } else if (value && typeof value.seconds === 'number') {
                    date = new Date(value.seconds * 1000);
                } else {
                    // Try standard Date parsing
                    date = new Date(value);
                }

                if (date && !isNaN(date.getTime())) {
                    const options: Intl.DateTimeFormatOptions = {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        calendar: 'buddhist'
                    };
                    return new Intl.DateTimeFormat('th-TH', options).format(date);
                }
            } catch (e) {
                console.warn('Thai date handling failed, fallback to standard', e);
            }
        }

        try {
            const datePipe = new DatePipe(currentLang);
            return datePipe.transform(value, format);
        } catch (e) {
            console.error('Date pipe error', e);
            return value;
        }
    }
}
