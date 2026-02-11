import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, Send, Plus, Users, Search, Smile } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Channel {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface Message {
  id: string;
  channel_id: string;
  sender_name: string;
  content: string;
  created_at: string;
}

export default function DiscussionsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch channels
  useEffect(() => {
    const fetchChannels = async () => {
      const { data } = await supabase
        .from('discussion_channels')
        .select('*')
        .order('created_at', { ascending: true });
      if (data) {
        setChannels(data);
        if (!activeChannel && data.length > 0) setActiveChannel(data[0]);
      }
      setLoading(false);
    };
    fetchChannels();
  }, []);

  // Fetch messages for active channel
  useEffect(() => {
    if (!activeChannel) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('discussion_messages')
        .select('*')
        .eq('channel_id', activeChannel.id)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();

    // Subscribe to realtime messages
    const channel = supabase
      .channel(`messages-${activeChannel.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'discussion_messages',
          filter: `channel_id=eq.${activeChannel.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChannel?.id]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChannel) return;
    const msg = newMessage.trim();
    setNewMessage('');
    await supabase.from('discussion_messages').insert({
      channel_id: activeChannel.id,
      sender_name: 'Alex Chen',
      content: msg,
    });
  };

  const createChannel = async () => {
    if (!newChannelName.trim()) return;
    const { data } = await supabase
      .from('discussion_channels')
      .insert({ name: newChannelName.trim().toLowerCase().replace(/\s+/g, '-'), description: '' })
      .select()
      .single();
    if (data) {
      setChannels((prev) => [...prev, data]);
      setActiveChannel(data);
      setNewChannelName('');
      setShowNewChannel(false);
    }
  };

  const filteredMessages = messages.filter((m) =>
    search ? m.content.toLowerCase().includes(search.toLowerCase()) : true
  );

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase();

  const getAvatarColor = (name: string) => {
    const colors = ['bg-primary', 'bg-accent', 'bg-[hsl(var(--success))]', 'bg-[hsl(var(--warning))]', 'bg-destructive'];
    return colors[name.length % colors.length];
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton-shimmer h-8 w-48" />
        <div className="flex gap-4 h-[calc(100vh-12rem)]">
          <div className="w-64 space-y-2">
            {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton-shimmer h-10" />)}
          </div>
          <div className="flex-1 skeleton-shimmer" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-[calc(100vh-6rem)]"
    >
      <h1 className="text-2xl font-bold text-foreground mb-4">Team Discussions</h1>

      <div className="flex flex-1 gap-0 glass rounded-2xl overflow-hidden min-h-0">
        {/* Channel sidebar */}
        <div className="w-56 shrink-0 border-r border-border flex flex-col">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Channels</span>
            <button
              onClick={() => setShowNewChannel(!showNewChannel)}
              className="w-6 h-6 rounded-md bg-primary/15 text-primary flex items-center justify-center hover:bg-primary/25 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <AnimatePresence>
            {showNewChannel && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-2 border-b border-border flex gap-1">
                  <input
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && createChannel()}
                    placeholder="channel-name"
                    className="flex-1 px-2 py-1.5 text-xs rounded bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button onClick={createChannel} className="px-2 py-1 text-xs rounded bg-primary text-primary-foreground">
                    Add
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <nav className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-0.5">
            {channels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch)}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                  activeChannel?.id === ch.id
                    ? 'bg-primary/15 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                <Hash className="w-4 h-4 shrink-0" />
                <span className="truncate">{ch.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">{activeChannel?.name}</span>
              <span className="text-xs text-muted-foreground ml-2 hidden sm:block">{activeChannel?.description}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="pl-7 pr-3 py-1.5 text-xs rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-36"
                />
              </div>
              <button className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <Users className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
            {filteredMessages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm mt-12">
                No messages yet. Start the conversation!
              </div>
            )}
            {filteredMessages.map((msg, i) => {
              const showAvatar = i === 0 || filteredMessages[i - 1].sender_name !== msg.sender_name;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${showAvatar ? 'mt-4' : 'mt-0.5'}`}
                >
                  {showAvatar ? (
                    <div className={`w-8 h-8 rounded-full ${getAvatarColor(msg.sender_name)} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                      {getInitials(msg.sender_name)}
                    </div>
                  ) : (
                    <div className="w-8 shrink-0" />
                  )}
                  <div className="min-w-0">
                    {showAvatar && (
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-foreground">{msg.sender_name}</span>
                        <span className="text-xs text-muted-foreground">{formatTime(msg.created_at)}</span>
                      </div>
                    )}
                    <p className="text-sm text-foreground/90 break-words">{msg.content}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2">
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Smile className="w-5 h-5" />
              </button>
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder={`Message #${activeChannel?.name || ''}...`}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground disabled:opacity-40 transition-opacity hover:opacity-90"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
