import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface QuestionOption {
  value: string;
  label: string;
}

export interface QuestionSubType {
  type: string;
  id: string;
  label: string;
  options?: QuestionOption[];
}

export interface Question {
  id: string;
  name: string;
  type: string;
  subTypes: QuestionSubType[];
}

export interface QuestionsData {
  questions: Question[];
}

/**
 * Event listener interface for handling form navigation events
 */
export interface FormEventListener {
  onQuestionChange(question: Question | null): void;
}

@Injectable({
  providedIn: 'root'
})
export class FormService {
  // Store questions data
  private questions: Question[] = [];
  
  // Keep track of the current index
  private currentIndex: number = 0;
  
  // Event listeners for navigation
  private eventListeners: FormEventListener[] = [];

  constructor(private http: HttpClient) {}

  /**
   * Load questions from the JSON file
   * @param callback Function to call when questions are loaded
   */
  loadQuestions(callback?: (success: boolean) => void): void {
    console.log('Loading questions from mock-data.json');
    
    this.http.get<QuestionsData>('assets/mock-data.json').subscribe({
      next: (data) => {
        console.log('Received data:', data);
        this.questions = data.questions;
        console.log('Processed questions:', this.questions);
        this.notifyListeners();
        if (callback) callback(true);
      },
      error: (error) => {
        console.error('Error loading questions:', error);
        if (callback) callback(false);
      }
    });
  }

  /**
   * Navigate to a specific question by ID
   */
  navigateToQuestion(id: string): boolean {
    const index = this.questions.findIndex(q => q.id === id);
    
    if (index !== -1) {
      this.currentIndex = index;
      this.notifyListeners();
      return true;
    }
    return false;
  }

  /**
   * Go to next question
   */
  nextQuestion(): boolean {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      this.notifyListeners();
      return true;
    }
    return false;
  }

  /**
   * Go to previous question
   */
  previousQuestion(): boolean {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.notifyListeners();
      return true;
    }
    return false;
  }

  /**
   * Check if we can go to the next question
   */
  canGoNext(): boolean {
    return this.currentIndex < this.questions.length - 1;
  }

  /**
   * Check if we can go to the previous question
   */
  canGoPrevious(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Get the current question's ID
   */
  getCurrentQuestionId(): string | null {
    const currentQuestion = this.getCurrentQuestion();
    return currentQuestion ? currentQuestion.id : null;
  }
  
  /**
   * Get the current question
   */
  getCurrentQuestion(): Question | null {
    return this.questions.length > 0 && 
           this.currentIndex >= 0 && 
           this.currentIndex < this.questions.length 
      ? this.questions[this.currentIndex] 
      : null;
  }
  
  /**
   * Get all questions
   */
  getQuestions(): Question[] {
    return [...this.questions]; // Return a copy to prevent mutation
  }
  
  /**
   * Register a listener for question changes
   */
  registerListener(listener: FormEventListener): void {
    this.eventListeners.push(listener);
  }
  
  /**
   * Remove a listener
   */
  removeListener(listener: FormEventListener): void {
    const index = this.eventListeners.indexOf(listener);
    if (index !== -1) {
      this.eventListeners.splice(index, 1);
    }
  }
  
  /**
   * Notify all listeners about question changes
   */
  private notifyListeners(): void {
    const currentQuestion = this.getCurrentQuestion();
    this.eventListeners.forEach(listener => {
      listener.onQuestionChange(currentQuestion);
    });
  }
}
