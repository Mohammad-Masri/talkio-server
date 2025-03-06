export enum RoomTypes {
  Private = 'Private',
  Group = 'Group',
}

export enum ParticipantRoles {
  Admin = 'Admin',
  Member = 'Member',
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

    PrivateCallReceived: 'private-call-received',
    PrivateCallAnswered: 'private-call-answered',
    PrivateCallDeclined: 'private-call-declined',

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

    StartPrivateCall: 'start-private-call',
    AnswerPrivateCall: 'answer-private-call',
    DeclinePrivateCall: 'decline-private-call',

    ShareCandidate: 'share-candidate',
  },
};
