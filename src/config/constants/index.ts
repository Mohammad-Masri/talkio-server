export enum RoomTypes {
  Private = 'Private',
  Group = 'Group',
}

export enum ParticipantRoles {
  Admin = 'Admin',
  Member = 'Member',
}

export enum CallStatuses {
  Ringing = 'Ringing',

  Ongoing = 'Ongoing',

  NoAnswer = 'NoAnswer',
  Declined = 'Declined',
  Ended = 'Ended',
}

export const ChatEvents = {
  Send: {
    UserConnected: 'user-connected',
    UserDisconnected: 'user-disconnected',
    RoomJoined: 'room-joined',
    RoomLeaved: 'room-leaved',
    MessageReceived: 'message-received',
    MessageReaded: 'message-readed',
    MessageUpdated: 'message-updated',
    MessageDeleted: 'message-deleted',
    TypingStarted: 'typing-started',
    TypingStopped: 'typing-stopped',
    CallOfferInitialized: 'call-offer-initialized',
    CallOfferReceived: 'call-offer-received',
    CallOfferAnswered: 'call-offer-answered',
    CallOfferDeclined: 'call-offer-declined',
    CandidateReceived: 'candidate-received',
  },
  Receive: {
    JoinRoom: 'join-room',
    LeaveRoom: 'leave-room',
    SendMessage: 'send-message',
    ReadMessage: 'read-message',
    UpdateMessage: 'update-message',
    DeleteMessage: 'delete-message',
    StartTyping: 'start-typing',
    StopTyping: 'stop-typing',
    SendCallOffer: 'send-call-offer',
    AnswerCallOffer: 'answer-call-offer',
    declineCallOffer: 'decline-call-offer',
    ShareCandidate: 'share-candidate',
  },
};
