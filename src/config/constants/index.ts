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
  },
  Receive: {
    JoinRoom: 'join-room',
    LeaveRoom: 'leave-room',
    SendMessage: 'send-message',
    ReadMessage: 'read-message',
    UpdateMessage: 'update-message',
    DeleteMessage: 'delete-message',
  },
};
