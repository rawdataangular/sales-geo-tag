import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Users, ClipboardList, MapPin, Smartphone, Send, LayoutDashboard, FileText } from 'lucide-angular';
import { MeetingService } from './meeting.service';
import { Meeting, Customer } from './models/meeting.model';
import { DashboardComponent } from './dashboard/dashboard';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LucideAngularModule,
    DashboardComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  meetingForm!: FormGroup;
  customers = signal<Customer[]>([]);
  showNewCustomerInput = false;
  view = signal<'form' | 'dashboard'>('form');
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private meetingService: MeetingService
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.loadCustomers();
  }

  initForm() {
    this.meetingForm = this.fb.group({
      userName: ['', Validators.required],
      customerName: ['', Validators.required],
      newCustomerName: [''],
      meetingNotes: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  async loadCustomers() {
    this.customers.set(await this.meetingService.getCustomers());
  }

  onCustomerChange(event: any) {
    const value = event.target.value;
    if (value === 'ADD_NEW') {
      this.showNewCustomerInput = true;
      this.meetingForm.get('newCustomerName')?.setValidators([Validators.required]);
    } else {
      this.showNewCustomerInput = false;
      this.meetingForm.get('newCustomerName')?.clearValidators();
    }
    this.meetingForm.get('newCustomerName')?.updateValueAndValidity();
  }

  async saveMeetingData() {
    if (this.meetingForm.invalid) {
      this.meetingForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    try {
      const formData = this.meetingForm.value;
      let finalCustomerName = formData.customerName;

      // 1. Handle New Customer
      if (formData.customerName === 'ADD_NEW') {
        finalCustomerName = await this.meetingService.addCustomer(formData.newCustomerName);
        await this.loadCustomers(); // Refresh list
      }

      // 2. Gather Metadata
      const location = await this.getCurrentLocation();
      const deviceInfo = navigator.userAgent;

      // 3. Save Meeting
      await this.meetingService.saveMeeting({
        customerName: finalCustomerName,
        meetingNotes: formData.meetingNotes,
        userName: formData.userName,
        location: location,
        deviceInfo: deviceInfo
      });

      alert('Meeting saved successfully! 🚀');
      this.meetingForm.reset();
      this.showNewCustomerInput = false;
      this.view.set('dashboard');
    } catch (error) {
      console.error('Error saving meeting:', error);
      alert('Failed to save meeting. Check console for details.');
    } finally {
      this.isSubmitting = false;
    }
  }

  getCurrentLocation(): Promise<{ latitude: number, longitude: number }> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ latitude: 0, longitude: 0 });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => resolve({ latitude: 0, longitude: 0 }),
        { timeout: 5000 }
      );
    });
  }

  toggleView(v: 'form' | 'dashboard') {
    this.view.set(v);
  }
}
