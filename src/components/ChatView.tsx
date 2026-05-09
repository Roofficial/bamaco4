import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Image, MoreVertical, Search, ChevronLeft, Phone, Video } from "lucide-react";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, limit, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "../context/AuthContext";
import { PatientProfile } from "../types";
import { format } from "date-fns";

interface ChatViewProps {
  onInitiateCall: (user: PatientProfile) => void;
  selectedContact?: PatientProfile;
  allUsers: PatientProfile[];
}

export default function ChatView({ onInitiateCall, selectedContact, allUsers }: ChatViewProps) {
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid),
      orderBy("lastMessageTimestamp", "desc")
    );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const convos = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as any[];
        setConversations(convos);

      // If we came from a contact selection, try to find that conversation
      if (selectedContact && !activeChat) {
        const existing = convos.find(c => c.participants.includes(selectedContact.uid));
        if (existing) {
          setActiveChat(existing);
        } else {
          // Temporarily set active chat as a shell until first message
          setActiveChat({
            id: "new",
            participants: [user.uid, selectedContact.uid],
            otherUser: selectedContact
          });
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "conversations");
    });

    return () => unsubscribe();
  }, [user, selectedContact]);

  useEffect(() => {
    if (!activeChat || activeChat.id === "new") {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, "conversations", activeChat.id, "messages"),
      orderBy("timestamp", "asc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `conversations/${activeChat.id}/messages`);
    });

    return () => unsubscribe();
  }, [activeChat]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !user || !activeChat) return;

    try {
      const text = messageText;
      setMessageText("");

      let chatId = activeChat.id;

      if (chatId === "new") {
        // Create conversation
        const participants = activeChat.participants;
        const convoRef = doc(collection(db, "conversations"));
        chatId = convoRef.id;
        
        await setDoc(convoRef, {
          participants,
          lastMessage: text,
          lastMessageTimestamp: serverTimestamp(),
          lastMessageSenderId: user.uid,
          unreadCount: participants.reduce((acc: any, uid: string) => {
            acc[uid] = uid === user.uid ? 0 : 1;
            return acc;
          }, {})
        });
        
        setActiveChat({ ...activeChat, id: chatId });
      } else {
        // Update existing conversation
        await setDoc(doc(db, "conversations", chatId), {
          lastMessage: text,
          lastMessageTimestamp: serverTimestamp(),
          lastMessageSenderId: user.uid,
        }, { merge: true });
      }

      // Add message
      await addDoc(collection(db, "conversations", chatId, "messages"), {
        senderId: user.uid,
        senderName: profile?.name || user.displayName || "User",
        text,
        timestamp: serverTimestamp(),
        type: "text"
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "conversations");
    }
  };

  return (
    <div className="flex bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[600px] lg:h-[calc(100vh-200px)]">
      {/* Sidebar - Conversation List */}
      <div className={`w-full md:w-80 border-r border-slate-50 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search chats..." 
              className="pl-10 rounded-xl bg-slate-50 border-none h-10"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.length > 0 ? (
              conversations.map((convo) => {
                  const otherUserId = convo.participants.find((p: string) => p !== user?.uid);
                  const otherUser = allUsers.find(u => u.uid === otherUserId);
                  return (
                    <button
                      key={convo.id}
                      onClick={() => setActiveChat({ ...convo, otherUser })}
                      className={`w-full p-4 flex items-center gap-4 rounded-2xl transition-all ${
                        activeChat?.id === convo.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-50'
                      }`}
                    >
                      <Avatar className="w-12 h-12 ring-2 ring-white/10">
                        <AvatarImage src={otherUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUserId}`} />
                        <AvatarFallback>{(otherUser?.name || "U").charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="text-left flex-1 overflow-hidden">
                        <div className="flex justify-between items-center mb-1">
                          <p className={`font-bold truncate ${activeChat?.id === convo.id ? 'text-white' : 'text-slate-900'}`}>
                            {otherUser?.name || `User ${otherUserId?.slice(-4)}`}
                          </p>
                          <p className={`text-[10px] ${activeChat?.id === convo.id ? 'text-white/70' : 'text-slate-400'}`}>
                            {convo.lastMessageTimestamp?.toDate ? format(convo.lastMessageTimestamp.toDate(), 'HH:mm') : '...'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          {otherUser?.isOnline && <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0" />}
                          <p className={`text-xs truncate ${activeChat?.id === convo.id ? 'text-white/80' : 'text-slate-500'}`}>
                            {convo.lastMessage}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
              })
            ) : (
              <div className="py-20 text-center text-slate-400 space-y-2">
                <Search className="w-8 h-8 mx-auto opacity-20" />
                <p className="text-sm font-medium">No conversations yet</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-slate-50/30 ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        {activeChat ? (
          <>
            {/* Header */}
            <div className="px-6 py-4 bg-white border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setActiveChat(null)}
                  className="md:hidden"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Avatar className="w-10 h-10 ring-2 ring-primary/5">
                  <AvatarImage src={activeChat.otherUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeChat.id}`} />
                  <AvatarFallback>{(activeChat.otherUser?.name || "U").charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-slate-900">{activeChat.otherUser?.name || `Chat with ${activeChat.id.slice(-4)}`}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${activeChat.otherUser?.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${activeChat.otherUser?.isOnline ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {activeChat.otherUser?.isOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-50" onClick={() => onInitiateCall(activeChat.otherUser)}>
                  <Video className="w-5 h-5 text-slate-400" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-50">
                  <MoreVertical className="w-5 h-5 text-slate-400" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {messages.map((msg, i) => {
                  const isOwn = msg.senderId === user?.uid;
                  return (
                    <div key={msg.id || i} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] space-y-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                        <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                          isOwn 
                            ? 'bg-primary text-white rounded-tr-none' 
                            : 'bg-white text-slate-900 rounded-tl-none border border-slate-100'
                        }`}>
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold px-1 uppercase tracking-tighter">
                          {msg.timestamp?.toDate ? format(msg.timestamp.toDate(), 'HH:mm a') : 'Sending...'}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-6 bg-white border-t border-slate-50">
              <form onSubmit={sendMessage} className="flex items-center gap-4">
                <Button variant="ghost" size="icon" type="button" className="rounded-xl hover:bg-slate-50">
                  <Image className="w-5 h-5 text-slate-400" />
                </Button>
                <Input 
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message..." 
                  className="flex-1 rounded-xl bg-slate-50 border-none h-12 focus-visible:ring-primary"
                />
                <Button 
                  type="submit" 
                  disabled={!messageText.trim()}
                  className="bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 rounded-xl h-12 w-12 p-0"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
            <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center animate-pulse">
              <MessageSquare className="w-12 h-12 text-slate-300" />
            </div>
            <div className="max-w-xs space-y-2">
              <h3 className="text-xl font-serif font-bold text-slate-900">Your Messages</h3>
              <p className="text-sm text-slate-500">Pick a conversation from the left to start messaging securely with your doctors or patients.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
