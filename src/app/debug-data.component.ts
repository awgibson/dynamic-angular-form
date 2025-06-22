import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-debug-data',
  template: `
    <div class="debug-container">
      <h3>Data Loading Test</h3>
      <div *ngIf="loading">Loading...</div>
      <div *ngIf="error">Error: {{ error }}</div>
      <pre *ngIf="data">{{ data | json }}</pre>
      <button (click)="loadData()" class="btn btn-primary">Reload Data</button>
    </div>
  `,
  styles: [`
    .debug-container {
      padding: 20px;
      background-color: var(--debug-bg-color, #f8f9fa);
      border-radius: 5px;
      margin-top: 20px;
      border: 1px solid var(--border-color, #ced4da);
      transition: background-color 0.3s ease, border-color 0.3s ease;
      color: var(--text-color, #333333);
    }
    pre {
      background-color: var(--debug-code-bg-color, #e9ecef);
      padding: 10px;
      border-radius: 3px;
      max-height: 300px;
      overflow: auto;
      color: var(--text-color, #333333);
      border: 1px solid var(--border-color, #ced4da);
    }
    button {
      margin-top: 10px;
    }
    h3 {
      margin-bottom: 15px;
      color: var(--text-color, #333333);
    }
  `]
})
export class DebugDataComponent implements OnInit {
  loading = false;
  error: string | null = null;
  data: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;
    this.data = null;

    this.http.get('assets/mock-data.json').subscribe({
      next: (data) => {
        console.log('Debug data loaded:', data);
        this.data = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading debug data:', err);
        this.error = err.message || 'Unknown error';
        this.loading = false;
      }
    });
  }
}
