import { Component, OnInit, signal, computed, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MessagingService, MessageDTO } from '../../../core/services/messaging.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.scss']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  conversationId = signal<string>('');
  messages = signal<MessageDTO[]>([]);
  newMessage = signal<string>('');
  currentUserId = signal<string>('');

  loading = signal(true);
  sending = signal(false);
  conversation = signal<ConversationDTO | null>(null);

  constructor(
    private messagingService: MessagingService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.currentUserId.set(user.id);
    }

    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.conversationId.set(id);
        this.loadMessages(id);
      }
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  loadMessages(id: string) {
    this.loading.set(true);

    // Charger la conversation pour le header
    this.messagingService.getUserConversations(this.currentUserId()).subscribe(convs => {
      const c = convs.find(x => x.id === id);
      if (c) this.conversation.set(c);
    });

    this.messagingService.getMessages(id).subscribe({
      next: (data) => {
        this.messages.set(data);
        this.loading.set(false);
        this.scrollToBottom();
      },
      error: (err) => {
        console.error('Erreur de chargement des messages', err);
        this.loading.set(false);
      }
    });
  }

  sendMessage() {
    const txt = this.newMessage().trim();
    if (!txt || this.sending()) return;

    this.sending.set(true);
    this.messagingService.sendMessage(this.conversationId(), txt).subscribe({
      next: (msg) => {
        this.messages.update(msgs => [...msgs, msg]);
        this.newMessage.set('');
        this.sending.set(false);
      },
      error: (err) => {
        console.error('Erreur lors de l envoi', err);
        this.sending.set(false);
      }
    });
  }

  isMine(msg: MessageDTO): boolean {
    return msg.expediteurId === this.currentUserId();
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }
}
