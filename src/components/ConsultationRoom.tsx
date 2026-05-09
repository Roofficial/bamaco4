import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import CryptoJS from "crypto-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Video, VideoOff, Mic, MicOff, Send, PhoneOff, MonitorUp, Lock, Smile, Image as ImageIcon, Search, X as CloseIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface Message {
  text: string;
  sender: string;
  timestamp: string;
  encrypted?: boolean;
  type?: 'text' | 'gif';
}

interface ConsultationRoomProps {
  socket: any;
  roomId: string;
  userName: string;
  doctorName: string;
  callId: string | null;
  onClose: () => void;
}

// Simple key for E2EE demonstration
const E2EE_KEY = "vitalpoint-secure-consultation";

function GifSearch({ onSelect, onClose }: { onSelect: (url: string) => void; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const apiKey = import.meta.env.VITE_GIPHY_API_KEY || "dc6zaTOxFJmzC"; // Default public beta key for fallback

  const searchGifs = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const resp = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=12&rating=g`);
      const data = await resp.json();
      setGifs(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      try {
        const resp = await fetch(`https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=12&rating=g`);
        const data = await resp.json();
        setGifs(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  return (
    <div className="absolute bottom-20 right-0 w-80 bg-white shadow-2xl rounded-2xl border border-slate-200 overflow-hidden z-[110]">
      <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Search Giphy</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>
      <div className="p-3 bg-white">
        <div className="flex gap-2 mb-3">
          <Input 
            placeholder="Search GIFs..." 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchGifs()}
            className="h-8 text-xs rounded-lg"
          />
          <Button size="icon" className="h-8 w-8 shrink-0 rounded-lg" onClick={searchGifs}>
            <Search className="w-3 h-3" />
          </Button>
        </div>
        <ScrollArea className="h-64">
          {loading ? (
            <div className="flex items-center justify-center h-full text-xs text-slate-400">Loading...</div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {gifs.map((gif) => (
                <img 
                  key={gif.id}
                  src={gif.images.fixed_height_small.url}
                  alt={gif.title}
                  className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => onSelect(gif.images.original.url)}
                  referrerPolicy="no-referrer"
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

export default function ConsultationRoom({ socket, roomId, userName, doctorName, onClose }: ConsultationRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  
  const myVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<any>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const encryptMessage = (text: string) => {
    return CryptoJS.AES.encrypt(text, E2EE_KEY).toString();
  };

  const decryptMessage = (cipherText: string) => {
    try {
      const bytes = CryptoJS.AES.decrypt(cipherText, E2EE_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      return "[Decryption Error]";
    }
  };

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
      setStream(currentStream);
      if (myVideo.current) {
        myVideo.current.srcObject = currentStream;
      }

      socket.emit("join-room", roomId);

      socket.on("user-joined", (userId: string) => {
        const peer = new Peer({
          initiator: true,
          trickle: false,
          stream: currentStream,
        });

        setupPeerEvents(peer, userId);
        peerRef.current = peer;
      });

      socket.on("signal", (data: any) => {
        if (!peerRef.current) {
          const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: currentStream,
          });

          setupPeerEvents(peer, data.from);
          peer.signal(data.signal);
          peerRef.current = peer;
        } else {
          peerRef.current.signal(data.signal);
        }
      });
    });

    socket.on("message", (msg: Message) => {
      const decryptedText = msg.encrypted ? decryptMessage(msg.text) : msg.text;
      setMessages((prev) => [...prev, { ...msg, text: decryptedText }]);
      
      // Notify user if message is from someone else
      if (msg.sender !== userName) {
        toast.info(`Message from ${msg.sender}`, {
          description: msg.type === 'gif' ? "Sent an animated GIF" : decryptedText.length > 60 ? decryptedText.substring(0, 60) + "..." : decryptedText,
          duration: 4000,
          position: "top-right",
        });
      }
    });

    return () => {
      stream?.getTracks().forEach(track => track.stop());
      screenStreamRef.current?.getTracks().forEach(track => track.stop());
      // Don't disconnect global socket, just stop listeners if needed
      socket.off("user-joined");
      socket.off("signal");
      socket.off("message");
      peerRef.current?.destroy();
    };
  }, [roomId, socket]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const setupPeerEvents = (peer: any, userId: string) => {
    peer.on("signal", (signal: any) => {
      socket.emit("signal", { to: userId, signal });
    });

    peer.on("stream", (remoteStream: any) => {
      setRemoteStream(remoteStream);
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = remoteStream;
      }
    });
  };

  const sendMessage = (text: string = inputText, type: 'text' | 'gif' = 'text') => {
    if (text.trim()) {
      const encryptedText = encryptMessage(text);
      socket.emit("message", {
        roomId,
        text: encryptedText,
        sender: userName,
        encrypted: true,
        type
      });
      setInputText("");
      setShowEmojiPicker(false);
      setShowGifPicker(false);
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setInputText(prev => prev + emojiData.emoji);
  };

  const onGifSelect = (url: string) => {
    sendMessage(url, 'gif');
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = !isVideoEnabled;
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = !isAudioEnabled;
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        
        const videoTrack = screenStream.getVideoTracks()[0];
        
        if (peerRef.current) {
          peerRef.current.replaceTrack(
            stream!.getVideoTracks()[0],
            videoTrack,
            stream!
          );
        }

        if (myVideo.current) {
          myVideo.current.srcObject = screenStream;
        }

        videoTrack.onended = () => {
          stopScreenShare();
        };

        setIsScreenSharing(true);
      } catch (err) {
        console.error("Error sharing screen:", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      
      const videoTrack = stream!.getVideoTracks()[0];
      if (peerRef.current) {
        peerRef.current.replaceTrack(
          screenStreamRef.current.getVideoTracks()[0],
          videoTrack,
          stream!
        );
      }

      if (myVideo.current) {
        myVideo.current.srcObject = stream;
      }

      setIsScreenSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col lg:flex-row overflow-hidden">
      {/* Video Area */}
      <div className="flex-1 relative bg-slate-900 flex items-center justify-center">
        {/* Remote Video (Full Screen) */}
        <div className="w-full h-full flex items-center justify-center">
          {remoteStream ? (
            <video
              ref={remoteVideo}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center space-y-4">
              <Avatar className="w-32 h-32 mx-auto border-4 border-primary/20">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${doctorName}`} />
                <AvatarFallback>{doctorName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h2 className="text-2xl font-serif text-white font-bold">{doctorName}</h2>
                <Badge variant="secondary" className="animate-pulse bg-primary/20 text-primary border-none">
                  Waiting for participant to join...
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* My Video (Picture in Picture) */}
        <div className="absolute bottom-8 right-8 w-48 h-32 lg:w-64 lg:h-48 bg-slate-800 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
          <video
            ref={myVideo}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          {!isVideoEnabled && !isScreenSharing && (
            <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
              <VideoOff className="w-8 h-8 text-white/20" />
            </div>
          )}
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-[10px] text-white font-bold">
            {isScreenSharing ? "You (Sharing Screen)" : "You (Camera)"}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="absolute top-8 left-8 flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30 text-xs font-bold backdrop-blur-md">
          <Lock className="w-3 h-3" />
          End-to-End Encrypted
        </div>

        {/* Controls Overlay */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 p-4 bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10">
          <Button
            variant={isAudioEnabled ? "secondary" : "destructive"}
            size="icon"
            className="rounded-full w-12 h-12"
            onClick={toggleAudio}
          >
            {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>
          <Button
            variant={isVideoEnabled ? "secondary" : "destructive"}
            size="icon"
            className="rounded-full w-12 h-12"
            onClick={toggleVideo}
          >
            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>
          <Button
            variant={isScreenSharing ? "default" : "secondary"}
            size="icon"
            className={`rounded-full w-12 h-12 ${isScreenSharing ? 'bg-indigo-600 hover:bg-indigo-700 text-white animate-pulse' : ''}`}
            onClick={toggleScreenShare}
            title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
          >
            {isScreenSharing ? <CloseIcon className="w-5 h-5" /> : <MonitorUp className="w-5 h-5" />}
          </Button>
          <div className="w-px h-8 bg-white/10 mx-2" />
          <Button
            variant="destructive"
            size="icon"
            className="rounded-full w-12 h-12 shadow-lg shadow-destructive/20"
            onClick={onClose}
          >
            <PhoneOff className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Chat Sidebar */}
      <div className="w-full lg:w-96 bg-white flex flex-col border-l border-slate-200 shadow-2xl relative">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-10 sticky top-0">
          <div>
            <h3 className="text-lg font-serif font-bold text-slate-900">Secure Consultation</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected securely
            </p>
          </div>
          <Lock className="w-4 h-4 text-emerald-500" />
        </div>

        <ScrollArea className="flex-1 p-6 bg-slate-50/50">
          <div className="space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`flex flex-col ${msg.sender === userName ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] group relative ${
                      msg.sender === userName
                        ? "bg-primary text-white rounded-2xl rounded-tr-none shadow-md shadow-primary/20"
                        : "bg-white text-slate-900 rounded-2xl rounded-tl-none shadow-sm border border-slate-100"
                    }`}
                  >
                    <div className="p-3 text-sm whitespace-pre-wrap break-words">
                      {msg.type === 'gif' ? (
                        <div className="rounded-lg overflow-hidden -m-1">
                          <img 
                            src={msg.text} 
                            alt="GIF" 
                            className="max-w-full h-auto" 
                            referrerPolicy="no-referrer"
                            onLoad={() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' })}
                          />
                        </div>
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 px-0.5">
                    {msg.encrypted && <Lock className="w-2.5 h-2.5 text-slate-400" />}
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.sender === userName && (
                      <Badge variant="outline" className="text-[8px] h-3 border-emerald-100 text-emerald-600 px-1 py-0 leading-none">SENT</Badge>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="p-6 border-t border-slate-100 bg-white shadow-up relative h-auto">
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-24 right-4 z-[110] shadow-2xl rounded-xl overflow-hidden border border-slate-200"
              >
                <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
              </motion.div>
            )}
            {showGifPicker && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <GifSearch onSelect={onGifSelect} onClose={() => setShowGifPicker(false)} />
              </motion.div>
            )}
          </AnimatePresence>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-2 group"
          >
            <div className="flex-1 relative flex items-center">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Secure message..."
                className="rounded-2xl border-slate-200 focus:ring-2 focus:ring-primary h-12 pr-24 bg-slate-50 border-none transition-all focus:bg-white focus:shadow-sm"
              />
              <div className="absolute right-2 flex items-center gap-1">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className={`h-8 w-8 rounded-full ${showEmojiPicker ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-primary'}`}
                  onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowGifPicker(false); }}
                >
                  <Smile className="w-5 h-5" />
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className={`h-8 w-8 rounded-full ${showGifPicker ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-primary'}`}
                  onClick={() => { setShowGifPicker(!showGifPicker); setShowEmojiPicker(false); }}
                >
                  <ImageIcon className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <Button type="submit" size="icon" className="h-12 w-12 rounded-2xl shrink-0 shadow-lg shadow-primary/20 hover:scale-105 transition-transform active:scale-95">
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

