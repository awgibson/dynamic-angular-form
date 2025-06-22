import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService, Question, FormEventListener } from '../../shared/services/form.service';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit, OnDestroy, FormEventListener {
  canGoNext = false;
  canGoPrevious = false;
  loading = true;
  error: string | null = null;
  currentQuestion: Question | null = null;
  
  // Object to store form data with structure { pageId: { inputId: value } }
  formData: { [pageId: string]: { [inputId: string]: any } } = {};

  constructor(
    private formService: FormService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    console.log('DynamicFormComponent initialized');
    this.loading = true;
    
    // Register this component as a listener for question changes
    this.formService.registerListener(this);
    
    // Load questions
    this.formService.loadQuestions((success) => {
      console.log('Questions loaded in component:', success);
      this.loading = false;
      
      if (success) {
        // Check if there's a question ID in the URL
        const questionId = this.route.snapshot.paramMap.get('questionId');
        console.log('Question ID from URL:', questionId);
        if (questionId) {
          this.formService.navigateToQuestion(questionId);
        } else {
          // If no question ID in URL, initialize with first question
          this.initializeCurrentQuestion(this.formService.getCurrentQuestion());
        }
      } else {
        this.error = 'Failed to load form data. Please try again later.';
      }
    });
  }
  
  ngOnDestroy(): void {
    // Clean up by removing the listener
    this.formService.removeListener(this);
  }
  
  /**
   * Handle question change events from the form service
   */
  onQuestionChange(question: Question | null): void {
    this.initializeCurrentQuestion(question);
    this.updateNavigationState();
    this.updateUrl();
  }
  
  /**
   * Initialize the current question and its form data
   */
  private initializeCurrentQuestion(question: Question | null): void {
    this.currentQuestion = question;
    
    if (question) {
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
  }
  
  /**
   * Update the navigation state (can go next/previous)
   */
  private updateNavigationState(): void {
    this.canGoNext = this.formService.canGoNext();
    this.canGoPrevious = this.formService.canGoPrevious();
  }
  
  /**
   * Update the URL based on the current question
   */
  private updateUrl(): void {
    const questionId = this.formService.getCurrentQuestionId();
    if (questionId) {
      this.router.navigate(['/form', questionId], { replaceUrl: true });
    }
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
  
  // Method to reload form data if needed
  reloadData(): void {
    this.loading = true;
    this.error = null;
    this.formService.loadQuestions((success) => {
      this.loading = false;
      if (!success) {
        this.error = 'Failed to reload form data.';
      }
    });
  }
}
