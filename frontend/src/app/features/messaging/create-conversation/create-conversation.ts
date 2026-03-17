import { Component, OnInit, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagingService, Participant } from '../../../core/services/messaging.service';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';

@Component({
    selector: 'app-create-conversation',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './create-conversation.html',
    styleUrls: ['./create-conversation.scss']
})
export class CreateConversation implements OnInit {

    onClose = output<void>();
    onCreated = output<string>(); // returns conversation ID

    title = signal('');
    type = signal<'PRIVE' | 'GROUPE'>('PRIVE');

    searchQuery = new Subject<string>();
    searchResults = signal<Participant[]>([]);
    selectedParticipants = signal<Participant[]>([]);

    loading = signal(false);
    creating = signal(false);

    constructor(private messagingService: MessagingService) { }

    ngOnInit(): void {
        this.searchQuery.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(q => {
                if (q.length < 2) return [];
                this.loading.set(true);
                return this.messagingService.searchUsers(q);
            })
        ).subscribe({
            next: (results) => {
                this.searchResults.set(results);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    onSearch(event: any) {
        this.searchQuery.next(event.target.value);
    }

    addParticipant(p: Participant) {
        if (!this.selectedParticipants().some(sp => sp.id === p.id)) {
            this.selectedParticipants.update(list => [...list, p]);
        }
    }

    removeParticipant(pId: string) {
        this.selectedParticipants.update(list => list.filter(p => p.id !== pId));
    }

    create() {
        if (this.selectedParticipants().length === 0 || this.creating()) return;

        this.creating.set(true);
        const dto = {
            titre: this.title() || 'Nouvelle discussion',
            type: this.type(),
            participantIds: this.selectedParticipants().map(p => p.id)
        };

        this.messagingService.createConversation(dto).subscribe({
            next: (conv) => {
                this.onCreated.emit(conv.id);
                this.creating.set(false);
            },
            error: (err) => {
                console.error('Erreur création conversation', err);
                this.creating.set(false);
            }
        });
    }

    close() {
        this.onClose.emit();
    }
}
