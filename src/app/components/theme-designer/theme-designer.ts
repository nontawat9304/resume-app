import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeSettings } from '../../services/pdf.service';

@Component({
    selector: 'app-theme-designer',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './theme-designer.html',
    styleUrls: ['./theme-designer.scss']
})
export class ThemeDesignerComponent {
    @Output() apply = new EventEmitter<ThemeSettings>();
    @Output() close = new EventEmitter<void>();

    settings: ThemeSettings = {
        primaryColor: '#007bff',
        backgroundColor: 'white',
        fontFamily: 'sans',
        headerStyle: 'banner'
    };

    colors = [
        '#007bff', // Blue
        '#dc3545', // Red
        '#28a745', // Green
        '#6610f2', // Purple
        '#fd7e14', // Orange
        '#20c997', // Teal
        '#343a40'  // Dark
    ];

    applyTheme() {
        this.apply.emit(this.settings);
    }

    closeModal() {
        this.close.emit();
    }
}
