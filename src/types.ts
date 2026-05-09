export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  experience: number;
  availability: string[];
  image: string;
  bio: string;
}

export interface PatientProfile {
  uid: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  onboardingCompleted: boolean;
  isConfirmed: boolean;
  avatar?: string;
  age?: number;
  bloodType?: string;
  allergies: string[];
  medicalHistory: string;
  specialty?: string;
  experience?: number;
  rating?: number;
  bio?: string;
  isOnline?: boolean;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorAvatar?: string;
  patientId: string;
  patientName: string;
  patientAvatar?: string;
  date: string;
  type: "Telemedicine" | "In-Person";
  status: "pending" | "confirmed" | "completed" | "cancelled";
  specialty?: string;
  createdAt?: any;
}

export interface HealthData {
  timestamp: string;
  heartRate: number;
  steps: number;
  sleepHours: number;
  airQuality: number;
}
