import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService, Question } from '../../shared/services/form.service';
import { Observable, filter, map, tap } from 'rxjs';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit {
  currentQuestion$: Observable<Question | null>;
  canGoNext$: Observable<boolean>;
  canGoPrevious$: Observable<boolean>;
  loading = true;
  error: string | null = null;
  currentQuestion: Question | null = null;
  
  // Object to store form data with structure { pageId: { inputId: value } }
  formData: { [pageId: string]: { [inputId: string]: any } } = {};

  constructor(
    private formService: FormService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.currentQuestion$ = this.formService.currentQuestion$;
    this.canGoNext$ = this.formService.canGoNext();
    this.canGoPrevious$ = this.formService.canGoPrevious();
  }

  ngOnInit(): void {
    console.log('DynamicFormComponent initialized');
    this.loading = true;
    this.formService.loadQuestions().subscribe({
      next: (questions) => {
        console.log('Questions loaded in component:', questions);
        this.loading = false;
        // Check if there's a question ID in the URL
        this.route.paramMap.pipe(
          map(params => params.get('questionId')),
          filter(questionId => !!questionId),
          tap(questionId => {
            console.log('Question ID from URL:', questionId);
            if (questionId) {
              this.formService.navigateToQuestion(questionId);
            }
          })
        ).subscribe();
      },
      error: (err) => {
        console.error('Error loading questions:', err);
        this.loading = false;
        this.error = 'Failed to load form data. Please try again later.';
      }
    });

    // Initialize formData for current question when it changes
    this.currentQuestion$.pipe(
      filter(question => !!question),
      tap(question => {
        if (question) {
          this.currentQuestion = question;
          
          // Initialize formData for this page if not exist
          if (!this.formData[question.id]) {
            this.formData[question.id] = {};
          }
          
          // Initialize default values for each field
          question.subTypes.forEach(field => {
            // Initialize with appropriate default value based on field type
            let defaultValue: any = '';
            if (field.type === 'checkbox') {
              defaultValue = false;
            } else if (field.type === 'radio' && field.options && field.options.length > 0) {
              // For radio buttons, don't pre-select any option
              defaultValue = '';
            }
            
            // Initialize the field value in formData if not exists
            if (this.formData[question.id][field.id] === undefined) {
              this.formData[question.id][field.id] = defaultValue;
            }
          });
          
          console.log('Current form data structure:', this.formData);
        }
      })
    ).subscribe();

    // Update URL when question changes
    this.formService.getCurrentQuestionId().pipe(
      filter(id => !!id),
      tap(id => {
        if (id) {
          this.router.navigate(['/form', id], { replaceUrl: true });
        }
      })
    ).subscribe();
  }

  next(): void {
    this.formService.nextQuestion();
  }

  previous(): void {
    this.formService.previousQuestion();
  }

  onSubmit(): void {
    console.log('Complete form data:', this.formData);
    // You would typically send this data to a backend service
    alert('Form submitted successfully!');
  }
  
  // Update a single field in the form data
  updateFormValue(pageId: string, fieldId: string, value: any): void {
    if (!this.formData[pageId]) {
      this.formData[pageId] = {};
    }
    this.formData[pageId][fieldId] = value;
    console.log(`Updated field: ${pageId}.${fieldId} = ${value}`);
    console.log('Current formData:', this.formData);
  }
}
