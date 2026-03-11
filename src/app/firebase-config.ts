import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAHiM9Z4_m2JZstWg0_GQEn3gFlBEIyTrg",
    authDomain: "sales-geo-tag.firebaseapp.com",
    projectId: "sales-geo-tag",
    storageBucket: "sales-geo-tag.appspot.com",
    messagingSenderId: "179195110088",
    appId: "1:179195110088:web:bd5065b1a4c48ccbb23bfd",
    measurementId: "G-BM1SJ34G5B"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
