export interface Meeting {
    id?: string;
    customerName: string;
    meetingNotes: string;
    timestamp: any; // Firestore Timestamp
    userName: string;
    location: {
        latitude: number;
        longitude: number;
    };
    deviceInfo: string;
}

export interface Customer {
    id?: string;
    name: string;
}
