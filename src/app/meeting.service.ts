import { Injectable } from '@angular/core';
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    onSnapshot,
    Timestamp,
    serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase-config';
import { Meeting, Customer } from './models/meeting.model';
import { Observable, from } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MeetingService {
    private meetingsCollection = collection(db, 'meetings');
    private customersCollection = collection(db, 'customers');

    constructor() { }

    async getCustomers(): Promise<Customer[]> {
        const snapshot = await getDocs(this.customersCollection);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
    }

    async addCustomer(name: string): Promise<string> {
        const docRef = await addDoc(this.customersCollection, { name });
        return name; // Or return docRef.id if you prefer IDs
    }

    async saveMeeting(meeting: Partial<Meeting>): Promise<void> {
        const meetingData = {
            ...meeting,
            timestamp: serverTimestamp()
        };
        await addDoc(this.meetingsCollection, meetingData);
    }

    getFilteredMeetings(userName?: string, customerName?: string, startDate?: Date, endDate?: Date): Observable<Meeting[]> {
        return new Observable(observer => {
            let q = query(this.meetingsCollection, orderBy('timestamp', 'desc'));

            // Note: Firestore has limitations with multiple "where" filters on different fields 
            // without index. We'll implement basic structural filters and refine in-memory if needed,
            // but I'll try to provide the most direct queries.

            const unsubscribe = onSnapshot(q, (snapshot) => {
                let meetings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Meeting));

                // Apply additional filters in-memory for responsiveness and to avoid index complexitiy in a new project
                if (userName) {
                    meetings = meetings.filter(m => m.userName.toLowerCase().includes(userName.toLowerCase()));
                }
                if (customerName) {
                    meetings = meetings.filter(m => m.customerName === customerName);
                }
                if (startDate) {
                    meetings = meetings.filter(m => {
                        const mDate = (m.timestamp as any)?.toDate ? (m.timestamp as any).toDate() : new Date(m.timestamp);
                        return mDate >= startDate;
                    });
                }
                if (endDate) {
                    meetings = meetings.filter(m => {
                        const mDate = (m.timestamp as any)?.toDate ? (m.timestamp as any).toDate() : new Date(m.timestamp);
                        return mDate <= endDate;
                    });
                }

                observer.next(meetings);
            }, error => observer.error(error));

            return () => unsubscribe();
        });
    }
}
