# Dynamic Form Application Documentation

## Overview

This documentation provides a detailed guide to the Angular dynamic form application, including explanations of components, services, validation mechanisms, data binding strategies, and how to extend the application with new components and features.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Components](#core-components)
3. [Form Configuration](#form-configuration)
4. [Data Binding & State Management](#data-binding--state-management)
5. [Validation System](#validation-system)
6. [UI Features - Theme & Font Size](#ui-features)
7. [Complex Components](#complex-components)
8. [Component Data Flow](#component-data-flow)
9. [Extending the Application](#extending-the-application)
10. [Examples](#examples)

## Architecture Overview

The application follows a modular Angular architecture with a focus on dynamic form rendering and validation. It consists of:

- **Core Module**: Contains fundamental services like theming and font size management
- **Shared Module**: Hosts reusable components and services
- **Features Module**: Contains the main dynamic form component and feature modules
- **JSON-based Form Configuration**: Forms are defined in JSON, allowing for easy modification without code changes

The dynamic form system supports multiple pages, complex nested components, validation, and persistent state management.

## Core Components

### Dynamic Form Component (`dynamic-form.component.ts`)

This is the main component responsible for rendering form pages and managing navigation.

**Key Functions:**
- `initializeCurrentQuestion()`: Sets up the form data structure for each page
- `validateCurrentPage()`: Validates all fields on the current page before navigation
- `next()`: Validates and proceeds to the next page
- `updateFormValue()`: Updates form data when field values change
- `updateComplexValue()`: Handles changes from complex nested components
- `validateComplexField()`: Validates complex component field data
- `onComplexValidationChange()`: Receives validation status from complex components

### Form Service (`form.service.ts`)

Acts as the central repository for form data and navigation state.

**Key Functions:**
- `loadQuestions()`: Fetches form configuration from JSON
- `getCurrentQuestion()`: Returns the current page
- `nextQuestion()` & `previousQuestion()`: Handles page navigation
- `canGoNext()` & `canGoPrevious()`: Determines navigation availability
- `navigateToQuestion()`: Jumps to a specific page

### Complex Address Component (`complex-address.component.ts`)

Demonstrates how to build a complex form component with nested fields.

**Key Functions:**
- `updateValue()`: Updates the component's internal state when a field changes
- `validateField()`: Validates a specific field
- `validateAllFields()`: Validates all fields within the component
- `emitValidationStatus()`: Reports validation status to the parent form

## Form Configuration

Forms are configured using a JSON structure in `mock-data.json`:

```json
{
  "questions": [
    {
      "id": "address-page",
      "name": "Address Page",
      "type": "group",
      "subTypes": [
        {
          "type": "complex-address",
          "id": "complexAddress",
          "label": "Complete Address Information",
          "required": true
        }
      ]
    },
    // Additional form pages...
  ]
}
```

**Key Properties:**
- `id`: Unique identifier for a page or field
- `name`: Display name for pages
- `type`: Field type or "group" for pages
- `subTypes`: Array of fields for a page
- `required`: Whether a field is mandatory
- `options`: For fields with predefined choices (select, radio)

## Data Binding & State Management

The application uses Angular's template-driven forms with ngModel for two-way binding.

**Form Data Structure:**
```typescript
formData: { [pageId: string]: { [fieldId: string]: any } } = {};
```

This structure enables:
- Persistence of form data across page navigation
- Support for complex nested objects and arrays
- Validation at both page and field levels

**Binding Example:**
```html
<input 
  type="text" 
  class="form-control" 
  [id]="field.id"
  name="{{field.id}}"
  [(ngModel)]="formData[currentQuestion.id][field.id]"
  (ngModelChange)="updateFormValue(currentQuestion.id, field.id, $event)">
```

## Validation System

The application implements a comprehensive validation system:

### Page-Level Validation
- Triggered on navigation attempt
- Controlled by `validateCurrentPage()` in dynamic form component
- Validates all fields, including complex components
- Prevents navigation if invalid

### Field-Level Validation
- Visual feedback via CSS classes
- Error messages displayed below invalid fields
- Validation only shown after navigation attempt (`showValidationErrors` flag)

### Complex Component Validation
- Two-way communication between parent and child components
- Child components report validation status via events
- Parent validates complex components before navigation

**Validation Example:**
```typescript
validateComplexField(value: any): boolean {
  if (value && typeof value === 'object' && 'street' in value) {
    const requiredFields = ['street', 'city', 'state', 'zipCode', 'addressType'];
    for (const field of requiredFields) {
      if (!value[field] || value[field].trim() === '') {
        return false;
      }
    }
    
    // Additional validation logic
    return true;
  }
  return false;
}
```

## UI Features

### Theme Service (`theme.service.ts`)
Manages application-wide dark/light mode:

**Key Functions:**
- `toggleTheme()`: Switches between light and dark mode
- `isDarkMode()`: Returns current theme status
- Uses CSS variables for consistent theming

### Font Size Service (`font-size.service.ts`)
Controls text size across the application:

**Key Functions:**
- `setFontSize()`: Updates the application font size
- `getCurrentSize()`: Returns current font size
- Uses CSS variables to apply size changes

## Complex Components

Complex components are reusable form elements that encapsulate multiple related fields.

### Complex Address Component
Demonstrates how to build a component with multiple fields that functions as a single form control:

**Features:**
- Field-level validation
- Self-contained UI
- Event communication with parent
- Support for pre-filled values

**Integration with Form:**
```html
<app-complex-address
  [value]="formData[currentQuestion.id][field.id]"
  [required]="!!field.required"
  [showValidationFlag]="showValidationErrors"
  [parentId]="currentQuestion.id"
  [fieldId]="field.id"
  (valueChange)="updateComplexValue(currentQuestion.id, field.id, $event)"
  (validationChange)="onComplexValidationChange(currentQuestion.id, field.id, $event)">
</app-complex-address>
```

## Component Data Flow

This section visualizes the flow of data between components in the application, focusing on inputs, outputs, and how they interact.

### Component Relationships Diagram

```
┌─────────────────┐      ┌───────────────┐      ┌─────────────────┐
│                 │      │               │      │                 │
│  AppComponent   │─────▶│  FormService  │◀─────│   JSON Config   │
│                 │      │               │      │                 │
└────────┬────────┘      └───────┬───────┘      └─────────────────┘
         │                       │
         │                       │ (Questions data)
         ▼                       ▼
┌─────────────────────────────────────────────┐
│                                             │
│          DynamicFormComponent               │
│                                             │
│  ┌─────────────┐  ┌─────────────────────┐   │
│  │ Basic Fields │  │ Complex Components  │   │
│  └─────────────┘  └─────────────────────┘   │
│                                             │
└───────────────────┬─────────────────────────┘
                    │
                    ▼
       ┌─────────────────────────────┐
       │                             │
       │    ComplexAddressComponent  │
       │                             │
       └─────────────────────────────┘
```

### Component Inputs & Outputs

#### DynamicFormComponent

**Receives From:**
- **FormService**:
  - Form configuration data (questions, fields)
  - Current page information
  - Navigation state (canGoNext, canGoPrevious)

**Sends To:**
- **FormService**:
  - Navigation requests (next, previous)
  - Form data updates
  
- **Complex Components**:
  - Initial field values (`[value]`)
  - Validation state (`[showValidationFlag]`)
  - Required status (`[required]`)
  - Page and field identifiers (`[parentId]`, `[fieldId]`)

#### ComplexAddressComponent

**Inputs:**
- `value`: The current address data object
- `required`: Boolean indicating if the address is required
- `showValidationFlag`: Boolean to display validation errors
- `parentId`: ID of the parent form page
- `fieldId`: ID of this component in the parent form

**Outputs:**
- `valueChange`: Emits updated address object when any field changes
- `validationChange`: Emits boolean validation status when validation state changes

### Data Flow for Validation

```
┌─────────────────────────────────────────────────┐
│                                                 │
│ ComplexAddressComponent                         │
│                                                 │
│ ┌───────────────┐       ┌────────────────────┐  │
│ │ Field Changes │─────▶ │validateField()     │  │
│ └───────────────┘       └────────┬───────────┘  │
│                                  │              │
│                                  ▼              │
│                         ┌────────────────────┐  │
│                         │emitValidationStatus│  │
│                         └────────┬───────────┘  │
│                                  │              │
└──────────────────────────────────┼──────────────┘
                                   │
                                   │ (validationChange)
                                   ▼
┌─────────────────────────────────────────────────┐
│                                                 │
│ DynamicFormComponent                            │
│                                                 │
│ ┌──────────────────────────┐                    │
│ │onComplexValidationChange │                    │
│ └──────────────┬───────────┘                    │
│                │                                │
│                ▼                                │
│    ┌──────────────────────┐                    │
│    │Update validationErrors│                    │
│    │Update pageValid      │                    │
│    └──────────────────────┘                    │
│                                                │
└────────────────────────────────────────────────┘
```

### Data Flow for Value Updates

```
┌─────────────────────────────────────────────────┐
│                                                 │
│ ComplexAddressComponent                         │
│                                                 │
│ ┌───────────────┐       ┌────────────────────┐  │
│ │ updateValue() │─────▶ │Update internal state│  │
│ └───────────────┘       └────────┬───────────┘  │
│                                  │              │
│                                  ▼              │
│                         ┌────────────────────┐  │
│                         │Emit valueChange    │  │
│                         └────────┬───────────┘  │
│                                  │              │
└──────────────────────────────────┼──────────────┘
                                   │
                                   │ (valueChange)
                                   ▼
┌─────────────────────────────────────────────────┐
│                                                 │
│ DynamicFormComponent                            │
│                                                 │
│ ┌──────────────────────────┐                    │
│ │updateComplexValue()      │                    │
│ └──────────────┬───────────┘                    │
│                │                                │
│                ▼                                │
│    ┌──────────────────────┐                    │
│    │Update formData       │                    │
│    │Validate field        │                    │
│    └──────────────────────┘                    │
│                                                │
└────────────────────────────────────────────────┘
```

### Navigation Flow

```
┌─────────────────────────────────────────────────┐
│                                                 │
│ DynamicFormComponent                            │
│                                                 │
│ ┌───────────────┐       ┌────────────────────┐  │
│ │ next() called │─────▶ │showValidationErrors│  │
│ └───────────────┘       │= true              │  │
│                         └────────┬───────────┘  │
│                                  │              │
│                                  ▼              │
│                         ┌────────────────────┐  │
│                         │validateCurrentPage()│  │
│                         └────────┬───────────┘  │
│                                  │              │
│                  ┌───────────────┴──────────┐   │
│                  │                          │   │
│                  ▼                          ▼   │
│      ┌───────────────────┐   ┌────────────────┐ │
│      │If invalid: show   │   │If valid: proceed│ │
│      │errors & stop      │   │to next question │ │
│      └───────────────────┘   └────────┬───────┘ │
│                                       │         │
└───────────────────────────────────────┼─────────┘
                                        │
                                        ▼
                               ┌────────────────┐
                               │  FormService   │
                               │  nextQuestion()│
                               └────────────────┘
```

## Extending the Application

### Adding a New Field Type

1. Update the JSON schema in `mock-data.json`:
```json
{
  "type": "new-field-type",
  "id": "myField",
  "label": "My Custom Field",
  "required": true
}
```

2. Add a rendering condition in `dynamic-form.component.html`:
```html
<ng-container *ngIf="field.type === 'new-field-type'">
  <!-- Field template here -->
</ng-container>
```

### Creating a New Complex Component

1. Generate the component:
```bash
ng generate component shared/components/my-complex-component
```

2. Implement the component with:
   - Input properties for data binding
   - Output events for changes and validation
   - Internal validation methods

3. Create the interface for the component data:
```typescript
export interface MyComplexData {
  property1: string;
  property2: string;
  // etc.
}
```

4. Register the component in `shared.module.ts`

5. Update the `validateComplexField` method in the dynamic form component to handle the new type

## Examples

### Adding a Custom Date Range Component

**1. Component Interface:**
```typescript
export interface DateRangeData {
  startDate: string;
  endDate: string;
  rangeType: string;
}
```

**2. Component Class:**
```typescript
@Component({
  selector: 'app-date-range',
  templateUrl: './date-range.component.html',
  styleUrls: ['./date-range.component.scss']
})
export class DateRangeComponent implements OnInit {
  @Input() value: DateRangeData = { startDate: '', endDate: '', rangeType: '' };
  @Input() required: boolean = false;
  @Input() showValidation: boolean = false;
  
  @Output() valueChange = new EventEmitter<DateRangeData>();
  @Output() validationChange = new EventEmitter<boolean>();
  
  validationErrors: { [fieldId: string]: string } = {};
  
  ngOnInit(): void {
    if (this.required) {
      this.validateAllFields();
      this.emitValidationStatus();
    }
  }
  
  updateValue(field: keyof DateRangeData, value: string): void {
    this.value = { ...this.value, [field]: value };
    this.validateField(field);
    this.emitValidationStatus();
    this.valueChange.emit(this.value);
  }
  
  validateField(field: keyof DateRangeData): void {
    // Validation logic here
    if (this.required && !this.value[field]) {
      this.validationErrors[field] = `${field} is required.`;
    } else {
      delete this.validationErrors[field];
    }
    
    // Add date-specific validation
    if (field === 'endDate' && this.value.startDate && this.value.endDate) {
      const start = new Date(this.value.startDate);
      const end = new Date(this.value.endDate);
      if (end < start) {
        this.validationErrors[field] = 'End date must be after start date.';
      }
    }
  }
  
  validateAllFields(): boolean {
    // Implementation here
    return Object.keys(this.validationErrors).length === 0;
  }
  
  emitValidationStatus(): void {
    const isValid = Object.keys(this.validationErrors).length === 0;
    this.validationChange.emit(isValid);
  }
}
```

**3. JSON Configuration:**
```json
{
  "type": "date-range",
  "id": "bookingDates",
  "label": "Reservation Period",
  "required": true
}
```

**4. Update Form Component Logic:**
```typescript
validateComplexField(value: any): boolean {
  if (value && typeof value === 'object') {
    // Handle address component
    if ('street' in value) {
      // Address validation logic
    }
    
    // Handle date range component
    if ('startDate' in value && 'endDate' in value) {
      if (!value.startDate || !value.endDate || !value.rangeType) {
        return false;
      }
      
      // Validate date range is valid
      const start = new Date(value.startDate);
      const end = new Date(value.endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
        return false;
      }
      
      return true;
    }
  }
  
  return false;
}
```

## Conclusion

This dynamic form system offers a flexible, extensible foundation for creating complex forms with robust validation. By following the patterns established in this documentation, you can extend the application with new field types, validation rules, and complex components to meet any form requirements.

For further assistance or feature requests, please contact the development team.
