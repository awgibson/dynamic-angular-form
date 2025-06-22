import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FormService } from './services/form.service';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { FontSizeSelectorComponent } from './components/font-size-selector/font-size-selector.component';
import { ComplexAddressComponent } from './components/complex-address/complex-address.component';

@NgModule({
  declarations: [
    ThemeToggleComponent,
    FontSizeSelectorComponent,
    ComplexAddressComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ThemeToggleComponent,
    ComplexAddressComponent,
    FontSizeSelectorComponent
  ],
  providers: [FormService]
})
export class SharedModule { }