import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DynamicFormComponent } from './dynamic-form.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [DynamicFormComponent],
  imports: [
    SharedModule,
    RouterModule,
    FormsModule
  ],
  exports: [DynamicFormComponent]
})
export class DynamicFormModule { }
