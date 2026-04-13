import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl?: string;
  provider?: string;
  emailVerified?: boolean;
  avatarEmoji?: string;   // ← new field
}
 
export interface UpdateProfileRequest {
  avatarEmoji: string | null;
}
 
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API = `${environment.apiUrl}/api/user`;
 
  constructor(private http: HttpClient) {}
 
  // GET /api/user/me — requires JWT (jwt-interceptor adds it automatically)
  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.API}/me`);
  }
 
  // PUT /api/user/me — saves avatarEmoji (add more fields here later)
  updateProfile(data: UpdateProfileRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.API}/me`, data);
  }
}
 

