import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Calendar, User, Filter, ArrowUpDown } from 'lucide-angular';
import { MeetingService } from '../meeting.service';
import { Meeting, Customer } from '../models/meeting.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="dashboard-container">
      <div class="filter-bar glass-panel p-6 mb-8">
        <h2 class="mb-4 text-xl font-semibold flex items-center gap-2">
          <lucide-icon [name]="'Filter'" class="w-5 h-5"></lucide-icon>
          Filters
        </h2>
        <div class="grid-filters">
          <div class="filter-group">
            <label>User Name</label>
            <div class="input-wrapper">
              <lucide-icon [name]="'User'" class="input-icon"></lucide-icon>
              <input type="text" [(ngModel)]="filterUser" (ngModelChange)="applyFilters()" placeholder="Search user..." class="input-field pl-10">
            </div>
          </div>
          
          <div class="filter-group">
            <label>Customer</label>
            <select [(ngModel)]="filterCustomer" (ngModelChange)="applyFilters()" class="input-field">
              <option value="">All Customers</option>
              <option *ngFor="let c of customers()" [value]="c.name">{{c.name}}</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Date Range</label>
            <div class="flex gap-2">
              <input type="date" [(ngModel)]="filterStartDate" (ngModelChange)="applyFilters()" class="input-field text-sm">
              <input type="date" [(ngModel)]="filterEndDate" (ngModelChange)="applyFilters()" class="input-field text-sm">
            </div>
          </div>
        </div>
      </div>

      <div class="table-container glass-panel overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-white/5 border-b border-white/10">
              <th class="p-4 font-semibold">Date</th>
              <th class="p-4 font-semibold">User</th>
              <th class="p-4 font-semibold">Customer</th>
              <th class="p-4 font-semibold">Notes</th>
              <th class="p-4 font-semibold">Device</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let m of meetings()" class="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td class="p-4">{{ formatTimestamp(m.timestamp) }}</td>
              <td class="p-4 font-medium text-primary">{{ m.userName }}</td>
              <td class="p-4"><span class="badge">{{ m.customerName }}</span></td>
              <td class="p-4 text-muted max-w-xs truncate">{{ m.meetingNotes }}</td>
              <td class="p-4 text-xs font-mono text-muted">{{ m.deviceInfo }}</td>
            </tr>
            <tr *ngIf="meetings().length === 0">
              <td colspan="5" class="p-12 text-center text-muted">
                <div class="flex flex-col items-center gap-3">
                  <lucide-icon [name]="'Search'" class="w-12 h-12 opacity-20"></lucide-icon>
                  No meetings found matching your filters.
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { animation: fadeIn 0.5s ease-out; }
    .grid-filters { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
    .input-wrapper { position: relative; }
    .input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: var(--text-muted); }
    .pl-10 { padding-left: 40px; }
    .badge { background: var(--primary); color: white; padding: 4px 10px; border-radius: 99px; font-size: 0.75rem; font-weight: 500; }
    .text-primary { color: var(--primary); }
    .p-6 { padding: 1.5rem; }
    .p-4 { padding: 1rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-8 { margin-bottom: 2rem; }
    .font-semibold { font-weight: 600; }
    .w-full { width: 100%; }
    .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class DashboardComponent implements OnInit {
  meetings = signal<Meeting[]>([]);
  customers = signal<Customer[]>([]);

  filterUser = '';
  filterCustomer = '';
  filterStartDate = '';
  filterEndDate = '';

  readonly Filter = Filter;
  readonly Search = Search;
  readonly User = User;

  constructor(private meetingService: MeetingService) { }

  ngOnInit() {
    this.loadCustomers();
    this.applyFilters();
  }

  async loadCustomers() {
    this.customers.set(await this.meetingService.getCustomers());
  }

  applyFilters() {
    const start = this.filterStartDate ? new Date(this.filterStartDate) : undefined;
    const end = this.filterEndDate ? new Date(this.filterEndDate) : undefined;

    this.meetingService.getFilteredMeetings(
      this.filterUser,
      this.filterCustomer,
      start,
      end
    ).subscribe(data => {
      this.meetings.set(data);
    });
  }

  formatTimestamp(ts: any): string {
    if (!ts) return 'N/A';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleString();
  }
}
