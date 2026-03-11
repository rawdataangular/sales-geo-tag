import { ApplicationConfig, provideZonelessChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {
  LucideAngularModule,
  Plus,
  Users,
  ClipboardList,
  MapPin,
  Smartphone,
  Send,
  LayoutDashboard,
  FileText,
  Search,
  Filter,
  Calendar,
  User,
  ArrowUpDown
} from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    importProvidersFrom(
      LucideAngularModule.pick({
        Plus,
        Users,
        ClipboardList,
        MapPin,
        Smartphone,
        Send,
        LayoutDashboard,
        FileText,
        Search,
        Filter,
        Calendar,
        User,
        ArrowUpDown
      })
    )
  ]
};
