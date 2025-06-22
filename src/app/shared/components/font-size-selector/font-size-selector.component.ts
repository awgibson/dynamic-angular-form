import { Component, OnInit } from '@angular/core';
import { FontSizeService, FontSize } from '../../../core/services/font-size.service';

@Component({
  selector: 'app-font-size-selector',
  templateUrl: './font-size-selector.component.html',
  styleUrl: './font-size-selector.component.scss'
})
export class FontSizeSelectorComponent implements OnInit {
  currentFontSize: FontSize = 'medium';
  fontSizes: { value: FontSize, label: string }[] = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
  ];

  constructor(private fontSizeService: FontSizeService) {}

  ngOnInit(): void {
    this.currentFontSize = this.fontSizeService.getCurrentFontSize();
    this.fontSizeService.fontSize$.subscribe(size => {
      this.currentFontSize = size;
    });
  }

  changeFontSize(size: FontSize): void {
    this.fontSizeService.setFontSize(size);
  }
}
