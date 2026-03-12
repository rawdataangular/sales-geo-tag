import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Calendar, User, Filter, ArrowUpDown, MapPin } from 'lucide-angular';
import { MeetingService } from '../meeting.service';
import { Meeting, Customer } from '../models/meeting.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="dashboard-container">
      <!-- Filters -->
      <div class="filter-bar glass-panel p-6 mb-8">
        <h2 class="mb-4 text-xl font-semibold flex items-center gap-2">
          <lucide-icon [name]="'Filter'" class="w-5 h-5 text-primary"></lucide-icon>
          History & Filters
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

      <!-- Desktop Table View -->
      <div class="table-view glass-panel overflow-hidden shadow-2xl">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-white/5 border-b border-white/10">
              <th class="p-4 font-semibold text-xs uppercase tracking-wider text-muted">Date</th>
              <th class="p-4 font-semibold text-xs uppercase tracking-wider text-muted">User</th>
              <th class="p-4 font-semibold text-xs uppercase tracking-wider text-muted">Customer</th>
              <th class="p-4 font-semibold text-xs uppercase tracking-wider text-muted">Location</th>
              <th class="p-4 font-semibold text-xs uppercase tracking-wider text-muted">Notes</th>
              <th class="p-4 font-semibold text-xs uppercase tracking-wider text-muted text-center">Map</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let m of meetings()" class="border-b border-white/5 hover:bg-white/5 transition-colors group">
              <td class="p-4">
                <div class="text-sm font-medium">{{ formatTimestamp(m.timestamp).split(',')[0] }}</div>
                <div class="text-[10px] text-muted opacity-60">{{ formatTimestamp(m.timestamp).split(',')[1] }}</div>
              </td>
              <td class="p-4 font-medium text-primary">{{ m.userName }}</td>
              <td class="p-4"><span class="badge">{{ m.customerName }}</span></td>
              <td class="p-4">
                <div *ngIf="m.location; else noLocation" class="flex flex-col gap-0.5">
                  <span class="text-[10px] font-mono text-emerald-500">Lat: {{ m.location.latitude | number:'1.3-3' }}</span>
                  <span class="text-[10px] font-mono text-indigo-400">Lng: {{ m.location.longitude | number:'1.3-3' }}</span>
                </div>
                <ng-template #noLocation><span class="text-xs text-muted italic">No GPS</span></ng-template>
              </td>
              <td class="p-4 text-muted max-w-xs truncate" [title]="m.meetingNotes">{{ m.meetingNotes }}</td>
              <td class="p-4 text-center">
                <button *ngIf="m.location" (click)="openMap(m.location.latitude, m.location.longitude)" 
                        class="map-btn" title="View on Google Maps">
                  <lucide-icon [name]="'MapPin'" class="w-4 h-4"></lucide-icon>
                </button>
              </td>
            </tr>
            <tr *ngIf="meetings().length === 0">
              <td colspan="6" class="p-12 text-center text-muted">
                <div class="flex flex-col items-center gap-3">
                  <lucide-icon [name]="'Search'" class="w-12 h-12 opacity-10"></lucide-icon>
                  <p class="text-lg opacity-40">No entries matched your criteria</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Card View -->
      <div class="mobile-grid">
         <div *ngFor="let m of meetings()" class="meeting-card glass-panel p-5 mb-4 border border-white/10 shadow-lg">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-primary font-bold text-lg">{{ m.userName }}</h3>
                    <p class="text-[10px] text-muted uppercase tracking-tighter opacity-70">{{ formatTimestamp(m.timestamp) }}</p>
                </div>
                <span class="badge h-fit">{{ m.customerName }}</span>
            </div>
            
            <div class="card-content mb-4 p-4 bg-white/5 rounded-2xl text-sm border border-white/5 text-slate-300 leading-relaxed">
                {{ m.meetingNotes }}
            </div>

            <div class="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                <div class="flex items-center gap-2">
                    <div *ngIf="m.location; else mobileNoLocation" class="flex flex-col">
                        <span class="text-[9px] text-muted uppercase tracking-widest font-bold">Location</span>
                        <span class="text-[11px] font-mono text-slate-400">
                          {{ m.location.latitude | number:'1.2-2' }}, {{ m.location.longitude | number:'1.2-2' }}
                        </span>
                    </div>
                    <ng-template #mobileNoLocation>
                        <span class="text-xs text-muted italic">GPS Not Available</span>
                    </ng-template>
                </div>
                <button *ngIf="m.location" (click)="openMap(m.location.latitude, m.location.longitude)" class="btn-primary-sm">
                    <lucide-icon [name]="'MapPin'" class="w-3.5 h-3.5"></lucide-icon>
                    Open Map
                </button>
            </div>
         </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { animation: fadeIn 0.5s ease-out; }
    .grid-filters { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
    .input-wrapper { position: relative; }
    .input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: var(--text-muted); }
    .pl-10 { padding-left: 40px; }
    .badge { background: var(--primary); color: white; padding: 4px 12px; border-radius: 99px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    .text-primary { color: var(--primary); }
    .p-6 { padding: 1.5rem; }
    .p-4 { padding: 1rem; }
    .p-5 { padding: 1.25rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-8 { margin-bottom: 2rem; }
    .font-semibold { font-weight: 600; }
    .w-full { width: 100%; }
    .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    
    .map-btn {
        background: rgba(99, 102, 241, 0.1);
        border: 1px solid rgba(99, 102, 241, 0.2);
        color: var(--primary);
        padding: 10px;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }
    
    .map-btn:hover {
        background: var(--primary);
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }

    .btn-primary-sm {
        background: var(--primary);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 10px;
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: 0.3s;
    }

    .btn-primary-sm:hover { opacity: 0.9; transform: translateY(-1px); }
    .btn-primary-sm:active { transform: scale(0.95); }

    .mobile-grid { display: none; }

    @media (max-width: 768px) {
        .table-view { display: none; }
        .mobile-grid { display: block; }
    }

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

  openMap(lat: number, lng: number) {
    if (lat === undefined || lng === undefined) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, '_blank');
  }
}
