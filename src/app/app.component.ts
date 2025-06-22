import { Component, OnInit } from '@angular/core';
import { ThemeService } from './core/services/theme.service';
import { FontSizeService } from './core/services/font-size.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'angular-legacy-integration';
  
  constructor(
    private themeService: ThemeService,
    private fontSizeService: FontSizeService
  ) {}
  
  ngOnInit(): void {
    // Services will automatically initialize when injected
  }
}
