import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, PhoneOff, Video, VideoOff, Mic, MicOff,
  Monitor, Plus, Users, X, Clock,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CallRoom {
  id: string;
  name: string;
  type: 'video' | 'audio';
  status: 'waiting' | 'active' | 'ended';
  created_by: string;
  created_at: string;
}

type CallState = 'lobby' | 'connecting' | 'connected' | 'ended';

export default function CallsPage() {
  const [rooms, setRooms] = useState<CallRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomType, setNewRoomType] = useState<'video' | 'audio'>('video');

  // In-call state
  const [activeRoom, setActiveRoom] = useState<CallRoom | null>(null);
  const [callState, setCallState] = useState<CallState>('lobby');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenShare, setScreenShare] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStream = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  // Fetch rooms
  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('call_rooms')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setRooms(data as CallRoom[]);
      setLoading(false);
    };
    fetch();
  }, []);

  const createRoom = async () => {
    if (!newRoomName.trim()) return;
    const { data } = await supabase
      .from('call_rooms')
      .insert({ name: newRoomName.trim(), type: newRoomType, created_by: 'Alex Chen' })
      .select()
      .single();
    if (data) {
      setRooms((prev) => [data as CallRoom, ...prev]);
      setNewRoomName('');
      setShowCreate(false);
    }
  };

  const joinRoom = async (room: CallRoom) => {
    setActiveRoom(room);
    setCallState('connecting');
    setCamOn(room.type === 'video');

    // Get local media
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: room.type === 'video',
        audio: true,
      });
      localStream.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch {
      // Fallback: proceed without media (permissions denied)
    }

    // Simulate connection delay
    setTimeout(() => {
      setCallState('connected');
      // Update room status
      supabase.from('call_rooms').update({ status: 'active' }).eq('id', room.id).then();
    }, 1500);

    // Start timer
    timerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
  };

  const leaveCall = useCallback(() => {
    localStream.current?.getTracks().forEach((t) => t.stop());
    localStream.current = null;
    if (timerRef.current) clearInterval(timerRef.current);

    if (activeRoom) {
      supabase.from('call_rooms').update({ status: 'ended' }).eq('id', activeRoom.id).then();
      setRooms((prev) => prev.map((r) => r.id === activeRoom.id ? { ...r, status: 'ended' } : r));
    }

    setCallState('ended');
    setCallDuration(0);
    setChatMessages([]);
    setMeetingNotes('');

    setTimeout(() => {
      setActiveRoom(null);
      setCallState('lobby');
    }, 800);
  }, [activeRoom]);

  const toggleMic = () => {
    if (localStream.current) {
      localStream.current.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    }
    setMicOn(!micOn);
  };

  const toggleCam = () => {
    if (localStream.current) {
      localStream.current.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    }
    setCamOn(!camOn);
  };

  const toggleScreen = async () => {
    if (!screenShare) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        stream.getVideoTracks()[0].onended = () => {
          if (localStream.current && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream.current;
          }
          setScreenShare(false);
        };
        setScreenShare(true);
      } catch { /* cancelled */ }
    } else {
      if (localStream.current && localVideoRef.current) {
        localVideoRef.current.srcObject = localStream.current;
      }
      setScreenShare(false);
    }
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { sender: 'Alex Chen', text: chatInput.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setChatInput('');
  };

  const fmtDuration = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // Cleanup on unmount
  useEffect(() => () => {
    localStream.current?.getTracks().forEach((t) => t.stop());
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // In-call view
  if (activeRoom && callState !== 'lobby') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-[calc(100vh-6rem)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-foreground">{activeRoom.name}</h2>
            {callState === 'connected' && (
              <span className="flex items-center gap-1.5 text-xs text-[hsl(var(--success))]">
                <span className="w-2 h-2 rounded-full bg-[hsl(var(--success))] animate-pulse" />
                Live · {fmtDuration(callDuration)}
              </span>
            )}
            {callState === 'connecting' && (
              <span className="text-xs text-muted-foreground animate-pulse">Connecting...</span>
            )}
          </div>
        </div>

        <div className="flex flex-1 gap-3 min-h-0">
          {/* Video area */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            <div className="flex-1 glass rounded-2xl overflow-hidden relative flex items-center justify-center">
              {callState === 'connecting' ? (
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-full gradient-primary mx-auto flex items-center justify-center animate-pulse">
                    <Phone className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">Joining call...</p>
                </div>
              ) : callState === 'ended' ? (
                <div className="text-center space-y-2">
                  <p className="text-foreground font-medium">Call ended</p>
                  <p className="text-xs text-muted-foreground">Duration: {fmtDuration(callDuration)}</p>
                </div>
              ) : camOn || screenShare ? (
                <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              ) : (
                <div className="text-center space-y-3">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold text-primary">AC</span>
                  </div>
                  <p className="text-sm text-foreground">Alex Chen</p>
                  <p className="text-xs text-muted-foreground">Camera off</p>
                </div>
              )}

              {/* Simulated remote participant */}
              {callState === 'connected' && (
                <div className="absolute bottom-3 right-3 w-32 h-24 rounded-xl bg-card/80 border border-border flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-1">
                      <span className="text-xs font-bold text-accent">SK</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Sarah Kim</span>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 py-2">
              <button onClick={toggleMic} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${micOn ? 'bg-secondary text-foreground hover:bg-secondary/80' : 'bg-destructive/20 text-destructive'}`}>
                {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
              {activeRoom.type === 'video' && (
                <button onClick={toggleCam} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${camOn ? 'bg-secondary text-foreground hover:bg-secondary/80' : 'bg-destructive/20 text-destructive'}`}>
                  {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>
              )}
              <button onClick={toggleScreen} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${screenShare ? 'bg-primary/20 text-primary' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}>
                <Monitor className="w-5 h-5" />
              </button>
              <button onClick={leaveCall} className="w-12 h-12 rounded-full bg-destructive flex items-center justify-center text-white hover:bg-destructive/90 transition-colors">
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Side panel: chat + notes */}
          <div className="w-72 shrink-0 hidden lg:flex flex-col gap-3">
            {/* In-call chat */}
            <div className="flex-1 glass rounded-2xl flex flex-col overflow-hidden">
              <div className="px-3 py-2 border-b border-border">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Chat</span>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
                {chatMessages.map((m, i) => (
                  <div key={i} className="text-xs">
                    <span className="font-medium text-foreground">{m.sender}</span>
                    <span className="text-muted-foreground ml-1.5">{m.time}</span>
                    <p className="text-foreground/80 mt-0.5">{m.text}</p>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-border flex gap-1.5">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                  placeholder="Type a message..."
                  className="flex-1 px-2 py-1.5 text-xs rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Meeting notes */}
            <div className="h-48 glass rounded-2xl flex flex-col overflow-hidden">
              <div className="px-3 py-2 border-b border-border">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Meeting Notes</span>
              </div>
              <textarea
                value={meetingNotes}
                onChange={(e) => setMeetingNotes(e.target.value)}
                placeholder="Take notes during the call..."
                className="flex-1 p-3 text-xs bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none resize-none scrollbar-thin"
              />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Room list (lobby)
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton-shimmer h-8 w-48" />
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton-shimmer h-20 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Calls</h1>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New Call Room
        </button>
      </div>

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="glass-strong rounded-2xl p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Create Call Room</h2>
                <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>
              <input value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} placeholder="Room name" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              <div className="flex gap-2">
                {(['video', 'audio'] as const).map((t) => (
                  <button key={t} onClick={() => setNewRoomType(t)} className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${newRoomType === t ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-secondary text-muted-foreground border border-border'}`}>
                    {t === 'video' ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              <button onClick={createRoom} className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">Create Room</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rooms grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {rooms.map((room) => {
          const statusLabel = room.status === 'active' ? 'Live' : room.status === 'waiting' ? 'Waiting' : 'Ended';
          const statusClass = room.status === 'active' ? 'text-[hsl(var(--success))]' : room.status === 'waiting' ? 'text-primary' : 'text-muted-foreground';

          return (
            <motion.div key={room.id} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-xl p-4 flex flex-col gap-3 hover:bg-card/70 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {room.type === 'video' ? <Video className="w-4 h-4 text-primary" /> : <Phone className="w-4 h-4 text-accent" />}
                  <span className="font-medium text-sm text-foreground">{room.name}</span>
                </div>
                <span className={`text-xs font-medium flex items-center gap-1 ${statusClass}`}>
                  {room.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--success))] animate-pulse" />}
                  {statusLabel}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />1 participant</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(room.created_at).toLocaleDateString()}</span>
              </div>
              <button
                onClick={() => joinRoom(room)}
                disabled={room.status === 'ended'}
                className="w-full py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-primary/15 text-primary hover:bg-primary/25"
              >
                {room.status === 'ended' ? 'Ended' : 'Join Call'}
              </button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
