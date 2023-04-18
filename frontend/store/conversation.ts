import { ConversationDocument } from '@/database/models/conversation';
import { UserDocument } from '@/database/models/user';
import { create } from 'zustand';

interface CounterState {
  currentConversation: ConversationDocument | null;
  setCurrentConversation: (user: ConversationDocument) => void;
  //   decrement: () => void;
}

const useConversation = create<CounterState>((set) => ({
  currentConversation: null,
  setCurrentConversation: (user: ConversationDocument) =>
    set({ currentConversation: user }),
  //   decrement: () => set((state) => ({ count: state.count - 1 })),
}));

export default useConversation;
