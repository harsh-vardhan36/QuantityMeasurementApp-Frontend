import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { UserService, UserProfile } from '../../services/user.service';
import { MeasurementService, MeasurementResult } from '../../services/measurement';
 
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
 
  user: UserProfile | null = null;
  isLoading = true;
  isSaving = false;
  saveSuccess = false;
  saveError = '';
 
  stats = [
    { label: 'Total Calculations', value: 0, icon: '🔢' },
    { label: 'Comparisons',        value: 0, icon: '⚖️' },
    { label: 'Conversions',        value: 0, icon: '🔄' },
    { label: 'Arithmetic Ops',     value: 0, icon: '➕' },
  ];
 
  recentActivity: { type: string; description: string; time: string; icon: string }[] = [];
 
  // ── Emoji Picker ──────────────────────────────────────────────
  showEmojiPicker = false;
  emojiSearch = '';
  activeCategory = 0;
 
  emojiCategories = [
    { label: 'Smileys',    emojis: ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','😉','😌','😍','🥰','😘','😋','😛','😜','🤪','😝','🤑','🤗','🤔','😎','🤓','🧐','😏','😒','😔'] },
    { label: 'People',     emojis: ['👶','🧒','👦','👧','🧑','👱','👨','🧔','👩','🧓','👴','👵','🧙','🧚','🧛','🧜','🧝','🦸','🦹','🧌'] },
    { label: 'Animals',    emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🦆','🦅','🦉','🦇','🐺','🦝','🐴','🦄','🐝','🦋','🐢','🦎','🐬'] },
    { label: 'Food',       emojis: ['🍎','🍊','🍋','🍇','🍓','🫐','🍒','🍑','🥭','🍍','🥝','🍅','🥑','🌮','🍕','🍔','🍜','🍣','🍩','🎂'] },
    { label: 'Activities', emojis: ['⚽','🏀','🏈','⚾','🎾','🏐','🥊','🎯','🎮','🎲','🎭','🎨','🎸','🎺','🎻','🥁','🎤','🏆','🥇','🎪'] },
    { label: 'Nature',     emojis: ['🌸','🌺','🌻','🌹','🌷','🌱','🌿','🍃','🍂','🍁','🌵','🌴','🍀','☘️','🌊','🔥','⚡','❄️','🌈','🌙'] },
    { label: 'Objects',    emojis: ['💎','👑','🔮','🧿','⭐','🌟','✨','🚀','💡','🔬','🔭','📚','💻','🎵','🎶','📐','🧮','⚗️','🏺','🗝️'] },
  ];
 
  get filteredEmojis(): string[] {
    if (this.emojiSearch.trim()) return this.emojiCategories.flatMap(c => c.emojis);
    return this.emojiCategories[this.activeCategory].emojis;
  }
 
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private measurementService: MeasurementService,
    private router: Router
  ) {}
 
  ngOnInit(): void {
    this.loadProfile();
    this.loadStats();
  }
 
  // ── Data Loading ──────────────────────────────────────────────
  loadProfile(): void {
    this.userService.getProfile().subscribe({
      next: (profile) => {
        this.user = profile;
        this.isLoading = false;
      },
      error: () => {
        // Fallback: decode name/email from JWT
        const info = this.authService.getUserInfo();
        if (info) {
          this.user = {
            id: 0,
            firstName: info.given_name || '',
            lastName:  info.family_name || '',
            email:     info.sub || info.email || '',
            provider:  'GOOGLE',
          };
        }
        this.isLoading = false;
      }
    });
  }
 
  loadStats(): void {
    const ops = ['COMPARE', 'CONVERT', 'ADD', 'SUBTRACT', 'MULTIPLY', 'DIVIDE'];
    let done = 0;
    let total = 0, comparisons = 0, conversions = 0, arithmetic = 0;
    const allRecords: MeasurementResult[] = [];
 
    ops.forEach(op => {
      this.measurementService.getHistory(op).subscribe({
        next: (records) => {
          allRecords.push(...records);
          total += records.length;
          if (op === 'COMPARE') comparisons += records.length;
          if (op === 'CONVERT') conversions += records.length;
          if (['ADD','SUBTRACT','MULTIPLY','DIVIDE'].includes(op)) arithmetic += records.length;
          done++;
          if (done === ops.length) {
            this.stats[0].value = total;
            this.stats[1].value = comparisons;
            this.stats[2].value = conversions;
            this.stats[3].value = arithmetic;
            this.buildRecentActivity(allRecords);
          }
        },
        error: () => { done++; }
      });
    });
  }
 
  private buildRecentActivity(records: MeasurementResult[]): void {
    const iconMap: Record<string, string> = {
      COMPARE: '⚖️', CONVERT: '🔄',
      ADD: '➕', SUBTRACT: '➖', MULTIPLY: '✖️', DIVIDE: '➗'
    };
 
    this.recentActivity = records.slice(-10).reverse().map(r => ({
      type:        this.capitalize(r.operation || ''),
      description: this.formatRecord(r),
      time:        'Recently',
      icon:        iconMap[r.operation || ''] || '🔢'
    }));
  }
 
  private formatRecord(r: MeasurementResult): string {
    if (r.error) return r.errorMessage || 'Error';
    if (r.operation === 'CONVERT') return `${r.thisValue} ${r.thisUnit} → ${r.thatUnit}`;
    if (r.operation === 'COMPARE') return r.resultString || '';
    if (r.resultValue !== undefined && r.resultUnit)
      return `${r.thisValue} ${r.thisUnit} = ${Math.round(r.resultValue * 1e6) / 1e6} ${r.resultUnit}`;
    return r.resultString || '';
  }
 
  private capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }
 
  // ── Emoji Picker ──────────────────────────────────────────────
  togglePicker(event: MouseEvent): void {
    event.stopPropagation();
    this.showEmojiPicker = !this.showEmojiPicker;
    if (this.showEmojiPicker) this.emojiSearch = '';
  }
 
  selectEmoji(emoji: string): void {
    if (this.user) this.user.avatarEmoji = emoji;
    this.showEmojiPicker = false;
  }
 
  clearEmoji(): void {
    if (this.user) this.user.avatarEmoji = undefined;
    this.showEmojiPicker = false;
  }
 
  @HostListener('document:click')
  onDocumentClick(): void {
    this.showEmojiPicker = false;
  }
 
  // ── Save ──────────────────────────────────────────────────────
  saveProfile(): void {
    if (!this.user) return;
    this.isSaving = true;
    this.saveSuccess = false;
    this.saveError = '';
 
    this.userService.updateProfile({ avatarEmoji: this.user.avatarEmoji ?? null }).subscribe({
      next: (updated) => {
        this.user = updated;
        this.isSaving = false;
        this.saveSuccess = true;
        setTimeout(() => this.saveSuccess = false, 3000);
      },
      error: (err) => {
        this.isSaving = false;
        this.saveError = err.error?.message || 'Failed to save.';
      }
    });
  }
 
  // ── Helpers ───────────────────────────────────────────────────
  getFullName(): string {
    if (!this.user) return '';
    return `${this.user.firstName} ${this.user.lastName}`.trim();
  }
 
  getInitials(): string {
    if (!this.user) return '';
    return `${this.user.firstName?.[0] ?? ''}${this.user.lastName?.[0] ?? ''}`.toUpperCase();
  }
 
  // ── Navigation ────────────────────────────────────────────────
  goToMeasurement(): void { this.router.navigate(['/measurement']); }
  goToHistory():     void { this.router.navigate(['/history']); }
  logout():          void { this.authService.logout(); }
}
 

