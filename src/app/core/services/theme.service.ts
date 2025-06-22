import { Injectable } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private storageKey = 'theme-preference';
  private currentTheme: Theme = 'light';
  
  constructor() {
    this.initTheme();
  }
  
  /**
   * Initialize the theme based on stored preference or system preference
   */
  private initTheme(): void {
    // First check if there's a stored preference
    const storedTheme = localStorage.getItem(this.storageKey) as Theme | null;
    
    if (storedTheme) {
      this.currentTheme = storedTheme;
    } else {
      // Use system preference as fallback
      this.currentTheme = this.getSystemPreference();
    }
    
    // Apply the theme
    this.applyTheme(this.currentTheme);
  }
  
  /**
   * Get the user's system preference if available
   */
  private getSystemPreference(): Theme {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }
  
  /**
   * Apply a theme to the document
   */
  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
    this.currentTheme = theme;
  }
  
  /**
   * Get the current theme
   */
  getTheme(): Theme {
    return this.currentTheme;
  }
  
  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): Theme {
    const newTheme: Theme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
    localStorage.setItem(this.storageKey, newTheme);
    return newTheme;
  }
  
  /**
   * Set a specific theme
   */
  setTheme(theme: Theme): void {
    this.applyTheme(theme);
    localStorage.setItem(this.storageKey, theme);
  }
}
