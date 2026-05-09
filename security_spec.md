# Security Specification - PurePulse

## Data Invariants
1. A conversation must have at least two participants.
2. A user can only read or write to a conversation if they are a listed participant.
3. A message must belong to a valid conversation.
4. Timestamps must be server-generated.
5. IDs must be valid strings with restricted characters and length.

## The "Dirty Dozen" Payloads (Red Team Test Cases)

1. **Identity Spoofing**: Attempt to create a conversation where I am not a participant.
2. **Identity Spoofing**: Attempt to send a message as another user ID.
3. **Privilege Escalation**: Attempt to update a conversation's participants list to add myself to a chat I'm not in.
4. **Unauthorized Read**: Attempt to list all conversations (global read).
5. **Unauthorized Read**: Attempt to get a specific conversation ID where I am not a participant.
6. **Unauthorized Read**: Attempt to read messages from a conversation I am not a participant in.
7. **Resource Poisoning**: Attempt to create a conversation with a 1MB string as a participant ID.
8. **Malicious ID**: Attempt to create a document with ID `../../secrets`.
9. **Timestamp Fraud**: Attempt to set a `lastMessageTimestamp` to a future date from the client.
10. **State Corruption**: Attempt to decrement `unreadCount` for another user.
11. **Shadow Field**: Attempt to add `isAdmin: true` to a conversation document.
12. **Orphaned Write**: Attempt to send a message to a non-existent conversation ID (if using a batch or logic that expects existence).

## Firestore Rules Draft (Hardened)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Default Deny
    match /{document=**} {
      allow read, write: if false;
    }

    // --- Helpers ---
    function isSignedIn() { return request.auth != null; }
    function isEmailVerified() { return isSignedIn() && request.auth.token.email_verified == true; }
    function isOwner(userId) { return isSignedIn() && request.auth.uid == userId; }
    function isValidId(id) { return id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$'); }
    function incoming() { return request.resource.data; }
    function existing() { return resource.data; }
    
    function isAdmin() {
      return isEmailVerified() && 
        (request.auth.token.email == "ronnexpro65@gmail.com" || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin");
    }

    // --- Collections ---

    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isOwner(userId); // Simplified for this spec, actual rules have more
      allow update: if isOwner(userId) || isAdmin();
    }

    match /conversations/{chatId} {
      function isParticipant() {
        return isSignedIn() && request.auth.uid in existing().participants;
      }
      
      function isValidConversation(data) {
        return data.participants is list && 
               data.participants.size() >= 2 && 
               data.participants.size() <= 10 &&
               request.auth.uid in data.participants &&
               data.lastMessage is string && data.lastMessage.size() <= 500 &&
               data.lastMessageTimestamp == request.time &&
               data.lastMessageSenderId == request.auth.uid;
      }

      allow list: if isSignedIn() && request.auth.uid in resource.data.participants;
      allow get: if isParticipant() || isAdmin();
      
      allow create: if isSignedIn() && isValidConversation(incoming()) && isValidId(chatId);
      
      allow update: if (isParticipant() || isAdmin()) && (
        // Action: Update last message
        incoming().diff(existing()).affectedKeys().hasOnly(['lastMessage', 'lastMessageTimestamp', 'lastMessageSenderId', 'unreadCount']) &&
        incoming().lastMessageTimestamp == request.time &&
        incoming().lastMessageSenderId == request.auth.uid
      );
    }

    match /conversations/{chatId}/messages/{msgId} {
      function isParticipant() {
        return isSignedIn() && request.auth.uid in get(/databases/$(database)/documents/conversations/$(chatId)).data.participants;
      }

      function isValidMessage(data) {
        return data.senderId == request.auth.uid &&
               data.text is string && data.text.size() <= 2000 &&
               data.timestamp == request.time &&
               data.type in ['text', 'image'];
      }

      allow read: if isParticipant() || isAdmin();
      allow create: if isParticipant() && isValidMessage(incoming()) && isValidId(msgId);
    }
  }
}
```
