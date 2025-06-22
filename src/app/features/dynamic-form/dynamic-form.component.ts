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
  validationErrors: { [fieldId: string]: string } = {};
  
  // Object to store form data with structure { pageId: { inputId: value } }
  formData: { [pageId: string]: { [inputId: string]: any } } = {};

  // Validation state for the entire page
  pageValid = true;
  
  // Track if validation has been triggered (only show errors after user tries to navigate)
  showValidationErrors = false;

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
    this.formService.loadQuestions((success: boolean) => {
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
    
    // Reset validation state when changing questions
    this.validationErrors = {};
    this.pageValid = true;
    this.showValidationErrors = false;
    
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
        } else if (field.type === 'complex-address') {
          // For complex address, initialize with a default address structure
          defaultValue = {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'USA',
            addressType: ''
          };
        }
        
        // Initialize the field value in formData if not exists
        if (this.formData[question.id][field.id] === undefined) {
          this.formData[question.id][field.id] = defaultValue;
        }
        
        // Check for required fields with empty values
        if (field.required) {
          const value = this.formData[question.id][field.id];
          if (value === '' || value === undefined || value === null) {
            this.validationErrors[field.id] = `${field.label} is required`;
            this.pageValid = false;
          }
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
    // Set the flag to show validation errors
    this.showValidationErrors = true;
    
    // Explicitly validate any complex address components 
    if (this.currentQuestion) {
      const complexFields = this.currentQuestion.subTypes.filter((field: any) => field.type === 'complex-address' && field.required);
      complexFields.forEach((field: any) => {
        const addressValue = this.formData[this.currentQuestion!.id][field.id];
        if (!this.validateComplexField(addressValue)) {
          this.validationErrors[field.id] = `${field.label} has missing required information`;
        }
      });
    }

    // Now validate the current page including all complex field validations
    if (!this.validateCurrentPage()) {
      console.log('Validation failed. Cannot proceed.');
      // Scroll to top to show validation messages
      window.scrollTo(0, 0);
      return;
    }
    
    // Reset validation flag when navigating
    this.showValidationErrors = false;
    this.formService.nextQuestion();
  }

  previous(): void {
    // No validation needed when going back
    this.showValidationErrors = false;
    this.formService.previousQuestion();
  }

  onSubmit(): void {
    // Set the flag to show validation errors
    this.showValidationErrors = true;
    
    // Validate before submitting
    if (!this.validateCurrentPage()) {
      console.log('Validation failed. Cannot submit.');
      // Scroll to top to show validation messages
      window.scrollTo(0, 0);
      return;
    }
    
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
    
    // Silently validate the field after it's updated
    if (this.currentQuestion) {
      const field = this.currentQuestion.subTypes.find((f: any) => f.id === fieldId);
      if (field && field.required) {
        if (value === '' || value === undefined || value === null) {
          this.validationErrors[fieldId] = `${field.label} is required`;
        } else {
          // Clear the error if value is now valid
          delete this.validationErrors[fieldId];
        }
      }
      // Update page validity
      this.pageValid = Object.keys(this.validationErrors).length === 0;
    }
  }

  // Handle complex component value changes
  updateComplexValue(pageId: string, fieldId: string, value: any): void {
    if (!this.formData[pageId]) {
      this.formData[pageId] = {};
    }
    this.formData[pageId][fieldId] = value;
    console.log(`Updated complex field: ${pageId}.${fieldId}`, value);

    // Validate complex field
    if (this.currentQuestion) {
      const field = this.currentQuestion.subTypes.find((f: any) => f.id === fieldId);
      if (field && field.required) {
        // Check if all required properties in the complex object have values
        if (!value || !this.validateComplexField(value)) {
          this.validationErrors[fieldId] = `${field.label} has missing required information`;
        } else {
          // Clear the error if value is now valid
          delete this.validationErrors[fieldId];
        }
      }
      // Update page validity
      this.pageValid = Object.keys(this.validationErrors).length === 0;
    }
  }

  // Helper method to validate complex fields
  validateComplexField(value: any): boolean {
    // If it's an address object, check that all required fields are filled
    if (value && typeof value === 'object' && 'street' in value) {
      // Validate all required fields in the address
      const requiredFields = ['street', 'city', 'state', 'zipCode', 'addressType'];
      for (const field of requiredFields) {
        if (!value[field] || value[field].trim() === '') {
          return false;
        }
      }
      
      // Validate zip code format if provided
      if (value.zipCode && !/^\d{5}(-\d{4})?$/.test(value.zipCode)) {
        return false;
      }
      
      return true;
    }
    
    // Add more complex field validation as needed
    return false;
  }
  
  // Handle validation events from complex-address component
  onComplexValidationChange(pageId: string, fieldId: string, isValid: boolean): void {
    if (this.currentQuestion) {
      const field = this.currentQuestion.subTypes.find((f: any) => f.id === fieldId);
      if (field && field.required) {
        if (!isValid) {
          this.validationErrors[fieldId] = `${field.label} has missing required information`;
        } else {
          // Clear the error if value is now valid
          delete this.validationErrors[fieldId];
        }
      }
      // Update page validity
      this.pageValid = Object.keys(this.validationErrors).length === 0;
    }
  }
  
  // Method to reload form data if needed
  reloadData(): void {
    this.loading = true;
    this.error = null;
    this.formService.loadQuestions((success: boolean) => {
      this.loading = false;
      if (!success) {
        this.error = 'Failed to reload form data.';
      }
    });
  }
  
  /**
   * Validate the current page
   * @returns boolean - Whether the current page is valid
   */
  validateCurrentPage(): boolean {
    if (!this.currentQuestion) {
      return false;
    }
    
    // Reset validation state
    this.validationErrors = {};
    let isValid = true;
    
    // Check each field for validation errors
    this.currentQuestion.subTypes.forEach((field: any) => {
      if (field.required) {
        const value = this.formData[this.currentQuestion!.id][field.id];
        
        // Handle complex address component
        if (field.type === 'complex-address') {
          // If it's a complex address, validate all its required fields
          if (!value || !this.validateComplexField(value)) {
            this.validationErrors[field.id] = `${field.label} has missing required information`;
            isValid = false;
          }
        } 
        // Check for empty values on standard fields
        else if (value === '' || value === undefined || value === null) {
          this.validationErrors[field.id] = `${field.label} is required`;
          isValid = false;
        }
      }
    });
    
    this.pageValid = isValid;
    return isValid;
  }
  
  /**
   * Check if a specific field has validation errors
   */
  hasError(fieldId: string): boolean {
    return !!this.validationErrors[fieldId];
  }
  
  /**
   * Get the error message for a field
   */
  getErrorMessage(fieldId: string): string {
    return this.validationErrors[fieldId] || '';
  }
}
