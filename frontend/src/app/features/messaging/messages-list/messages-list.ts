import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MessagingService, ConversationDTO } from '../../../core/services/messaging.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-messages-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './messages-list.html',
  styleUrls: ['./messages-list.scss']
})
export class MessagesList implements OnInit {

  conversations = signal<ConversationDTO[]>([]);
  loading = signal(true);
  activeConversationId = signal<string | null>(null);
  searchQuery = signal('');

  filteredConversations = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.conversations().filter(c => c.titre?.toLowerCase().includes(q));
  });

  constructor(
    private messagingService: MessagingService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const currentUser = this.authService.currentUser();
    if (currentUser && currentUser.id) {
      this.loadConversations(currentUser.id);
    } else {
      this.loading.set(false);
    }

    // Follow active route
    this.router.events.subscribe(() => {
      const id = this.router.url.split('/').pop();
      if (id && id !== 'messages') this.activeConversationId.set(id);
    });
  }

  loadConversations(userId: string) {
    this.messagingService.getUserConversations(userId).subscribe({
      next: (data) => {
        this.conversations.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement conversations', err);
        this.loading.set(false);
      }
    });
  }

  goToChat(id: string) {
    this.router.navigate(['/messages', id]);
  }
}
