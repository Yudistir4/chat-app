import { ConversationDocument } from '@/database/models/conversation';
import { UserDocument } from '@/database/models/user';
import { create } from 'zustand';

interface ConversationState {
  currentConversation: ConversationDocument | null;
  setCurrentConversation: (user: ConversationDocument) => void;
  isCurrentConversationUserOnline: boolean;
  setIsCurrentConversationUserOnline: (status: boolean) => void;
}

const useConversation = create<ConversationState>((set) => ({
  isCurrentConversationUserOnline: false,
  setIsCurrentConversationUserOnline: (status: boolean) =>
    set({ isCurrentConversationUserOnline: status }),
  currentConversation: null,
  setCurrentConversation: (user: ConversationDocument) =>
    set({ currentConversation: user }),
}));

export default useConversation;
