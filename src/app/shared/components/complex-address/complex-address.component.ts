import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

export interface AddressData {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  addressType: string;
}

@Component({
  selector: 'app-complex-address',
  templateUrl: './complex-address.component.html',
  styleUrls: ['./complex-address.component.scss']
})
export class ComplexAddressComponent implements OnInit {
  @Input() value: AddressData = this.getDefaultAddress();
  @Input() required: boolean = false;
  @Input() showValidation: boolean = false;
  @Input() parentId: string = '';
  @Input() fieldId: string = '';
  
  @Output() valueChange = new EventEmitter<AddressData>();

  states = [
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    // Add more states as needed
  ];

  addressTypes = [
    { value: 'home', label: 'Home' },
    { value: 'work', label: 'Work' },
    { value: 'mailing', label: 'Mailing' },
    { value: 'billing', label: 'Billing' },
    { value: 'legal', label: 'Legal' }
  ];

  validationErrors: { [fieldId: string]: string } = {};

  constructor() {}

  ngOnInit(): void {
    // Initialize with default values if empty
    if (!this.value) {
      this.value = this.getDefaultAddress();
    }
  }

  getDefaultAddress(): AddressData {
    return {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
      addressType: ''
    };
  }

  updateValue(field: keyof AddressData, value: string): void {
    this.value = { ...this.value, [field]: value };
    this.validateField(field);
    this.valueChange.emit(this.value);
  }

  validateField(field: keyof AddressData): void {
    const fieldValue = this.value[field];
    
    if (this.required && !fieldValue) {
      this.validationErrors[field] = `${this.capitalizeFirstLetter(field)} is required.`;
    } else if (field === 'zipCode' && fieldValue && !/^\d{5}(-\d{4})?$/.test(fieldValue)) {
      this.validationErrors[field] = 'Please enter a valid zip code (e.g., 12345 or 12345-6789).';
    } else {
      delete this.validationErrors[field];
    }
  }

  validateAllFields(): boolean {
    const fields: (keyof AddressData)[] = ['street', 'city', 'state', 'zipCode', 'country', 'addressType'];
    fields.forEach(field => this.validateField(field));
    return Object.keys(this.validationErrors).length === 0;
  }

  capitalizeFirstLetter(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).replace(/([A-Z])/g, ' $1');
  }

  hasError(fieldName: string): boolean {
    return !!this.validationErrors[fieldName];
  }

  getErrorMessage(fieldName: string): string {
    return this.validationErrors[fieldName] || '';
  }
}
