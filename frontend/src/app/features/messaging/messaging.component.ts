import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MessagesList } from './messages-list/messages-list';
import { CreateConversation } from './create-conversation/create-conversation';

@Component({
    selector: 'app-messaging',
    standalone: true,
    imports: [CommonModule, RouterModule, RouterOutlet, MessagesList, CreateConversation],
    templateUrl: './messaging.component.html',
    styleUrls: ['./messaging.component.scss']
})
export class MessagingComponent implements OnInit {

    showCreateModal = signal(false);

    constructor() { }

    ngOnInit(): void { }

    openCreateModal() {
        this.showCreateModal.set(true);
    }

    closeCreateModal() {
        this.showCreateModal.set(false);
    }

    onConversationCreated(id: string) {
        this.closeCreateModal();
        // Logic to select or navigate to the new conversation will be handled by the child or router
    }
}
