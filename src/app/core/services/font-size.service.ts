import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type FontSize = 'small' | 'medium' | 'large';

@Injectable({
  providedIn: 'root'
})
export class FontSizeService {
  private storageKey = 'font-size-preference';
  private fontSizeSubject = new BehaviorSubject<FontSize>('medium');
  
  // Observable that components can subscribe to
  public fontSize$ = this.fontSizeSubject.asObservable();
  
  // Font size values in pixels
  private fontSizeValues: Record<FontSize, string> = {
    'small': '14px',
    'medium': '16px',
    'large': '18px'
  };
  
  constructor() {
    this.initFontSize();
  }
  
  /**
   * Initialize the font size based on stored preference
   */
  private initFontSize(): void {
    // Check if there's a stored preference
    const storedSize = localStorage.getItem(this.storageKey) as FontSize | null;
    
    if (storedSize && this.isValidFontSize(storedSize)) {
      this.setFontSize(storedSize, false);
    } else {
      // Use medium as default
      this.setFontSize('medium', false);
    }
  }

  /**
   * Type guard to check if a string is a valid FontSize
   */
  private isValidFontSize(size: string): size is FontSize {
    return ['small', 'medium', 'large'].includes(size);
  }
  
  /**
   * Apply a font size to the document
   */
  private applyFontSize(size: FontSize): void {
    document.documentElement.style.setProperty('--base-font-size', this.fontSizeValues[size]);
    this.fontSizeSubject.next(size);
  }
  
  /**
   * Get the current font size
   */
  getCurrentFontSize(): FontSize {
    return this.fontSizeSubject.getValue();
  }
  
  /**
   * Set a specific font size
   */
  setFontSize(size: FontSize, saveToStorage = true): void {
    this.applyFontSize(size);
    if (saveToStorage) {
      localStorage.setItem(this.storageKey, size);
    }
  }
}
