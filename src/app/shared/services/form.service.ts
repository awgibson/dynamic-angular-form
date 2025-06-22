import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

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

@Injectable({
  providedIn: 'root'
})
export class FormService {
  private questionsData = new BehaviorSubject<Question[]>([]);
  public questions$ = this.questionsData.asObservable();
  
  private currentIndexSubject = new BehaviorSubject<number>(0);
  public currentIndex$ = this.currentIndexSubject.asObservable();
  
  public  currentQuestion$ = this.currentIndex$.pipe(
    map(index => {
      const questions = this.questionsData.getValue();
      return questions.length > 0 ? questions[index] : null;
    })
  );

  constructor(private http: HttpClient, private fb: FormBuilder) {}

  loadQuestions(): Observable<Question[]> {
    console.log('Loading questions from mock-data.json');
    return this.http.get<QuestionsData>('assets/mock-data.json').pipe(
      tap(data => console.log('Received data:', data)),
      map(data => data.questions),
      tap(questions => {
        console.log('Processed questions:', questions);
        this.questionsData.next(questions);
      })
    );
  }

  navigateToQuestion(id: string): void {
    const questions = this.questionsData.getValue();
    const index = questions.findIndex(q => q.id === id);
    
    if (index !== -1) {
      this.currentIndexSubject.next(index);
    }
  }

  nextQuestion(): void {
    const currentIndex = this.currentIndexSubject.getValue();
    const questions = this.questionsData.getValue();
    
    if (currentIndex < questions.length - 1) {
      this.currentIndexSubject.next(currentIndex + 1);
    }
  }

  previousQuestion(): void {
    const currentIndex = this.currentIndexSubject.getValue();
    
    if (currentIndex > 0) {
      this.currentIndexSubject.next(currentIndex - 1);
    }
  }

  canGoNext(): Observable<boolean> {
    return this.currentIndex$.pipe(
      map(index => {
        const questions = this.questionsData.getValue();
        return index < questions.length - 1;
      })
    );
  }

  canGoPrevious(): Observable<boolean> {
    return this.currentIndex$.pipe(
      map(index => index > 0)
    );
  }

  getCurrentQuestionId(): Observable<string | null> {
    return this.currentQuestion$.pipe(
      map(question => question ? question.id : null)
    );
  }
  
  // Get the current question synchronously
  getCurrentQuestion(): Question | null {
    const questions = this.questionsData.getValue();
    const currentIndex = this.currentIndexSubject.getValue();
    return questions.length > 0 && currentIndex >= 0 && currentIndex < questions.length 
      ? questions[currentIndex] 
      : null;
  }
}
