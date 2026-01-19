'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { ResizableNav } from '@/components/layout/ResizableNav';
import { motion } from 'framer-motion';
import { Users, UserPlus, Mail, Check, X, Trash2, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Friend {
  id: string;
  friendshipId: string;
  userId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  isInitiator: boolean;
}

export default function FriendsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingFriend, setAddingFriend] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadFriends();
    }
  }, [user]);

  const loadFriends = async () => {
    try {
      const response = await fetch('/api/friends/list');
      const data = await response.json();

      if (response.ok) {
        setFriends(data.friends || []);
        setPendingRequests(data.pendingRequests || []);
        setReceivedRequests(data.receivedRequests || []);
      } else {
        setError(data.error || 'Fehler bim Ladä');
      }
    } catch (err) {
      setError('Fehler bim Ladä vo dä Fründe');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setAddingFriend(true);

    try {
      const response = await fetch('/api/friends/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Fründschaftsaafrag gschickt!');
        setEmail('');
        loadFriends();
      } else {
        setError(data.error || 'Fehler bim Hinzuefüegä');
      }
    } catch (err) {
      setError('Fehler bim Hinzuefüegä vom Fründ');
    } finally {
      setAddingFriend(false);
    }
  };

  const handleAccept = async (friendshipId: string) => {
    try {
      const response = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId }),
      });

      if (response.ok) {
        setSuccess('Fründschaftsaafrag akzeptiert!');
        loadFriends();
      } else {
        const data = await response.json();
        setError(data.error || 'Fehler bim Akzeptiere');
      }
    } catch (err) {
      setError('Fehler bim Akzeptiere');
    }
  };

  const handleReject = async (friendshipId: string) => {
    try {
      const response = await fetch('/api/friends/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId }),
      });

      if (response.ok) {
        setSuccess('Fründschaftsaafrag abglehnt');
        loadFriends();
      } else {
        const data = await response.json();
        setError(data.error || 'Fehler bim Ablehne');
      }
    } catch (err) {
      setError('Fehler bim Ablehne');
    }
  };

  const handleRemove = async (friendshipId: string) => {
    if (!confirm('Möchtisch dä Fründ würklich löschä?')) {
      return;
    }

    try {
      const response = await fetch('/api/friends/remove', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId }),
      });

      if (response.ok) {
        setSuccess('Fründ glöscht');
        loadFriends();
      } else {
        const data = await response.json();
        setError(data.error || 'Fehler bim Löschä');
      }
    } catch (err) {
      setError('Fehler bim Löschä vom Fründ');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ResizableNav />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Fründe & Familie</h1>
          </div>
          <p className="text-muted-foreground">
            Verwalte dini Fründe und teile Rezept mit ihnä
          </p>
        </motion.div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
            {success}
          </div>
        )}

        {/* Add Friend Form */}
        <Card className="p-6 mb-8 bg-card/50 backdrop-blur-sm border-border">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Fründ hinzuefüegä
          </h2>
          <form onSubmit={handleAddFriend} className="flex gap-3">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="fründ@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50"
              />
            </div>
            <Button type="submit" disabled={addingFriend} className="gap-2">
              {addingFriend ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              Aafrag schickä
            </Button>
          </form>
        </Card>

        {/* Received Requests */}
        {receivedRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              Fründschaftsaafräge ({receivedRequests.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {receivedRequests.map((request) => (
                <Card key={request.id} className="p-4 bg-card/50 backdrop-blur-sm border-border">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                          {request.displayName[0].toUpperCase()}
                        </div>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{request.displayName}</p>
                        <p className="text-sm text-muted-foreground">{request.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAccept(request.friendshipId)}
                      size="sm"
                      className="flex-1 gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Akzeptierä
                    </Button>
                    <Button
                      onClick={() => handleReject(request.friendshipId)}
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-2"
                    >
                      <X className="w-4 h-4" />
                      Ablehne
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-semibold mb-4">Pendent Aafräge ({pendingRequests.length})</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="p-4 bg-card/50 backdrop-blur-sm border-border opacity-60">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="w-12 h-12">
                      <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground font-semibold">
                        {request.displayName[0].toUpperCase()}
                      </div>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{request.displayName}</p>
                      <p className="text-sm text-muted-foreground">{request.email}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Wartet uf Antwort
                  </Badge>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Friends List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-semibold mb-4">
            Mini Fründe ({friends.length})
          </h2>
          {friends.length === 0 ? (
            <Card className="p-12 text-center bg-card/50 backdrop-blur-sm border-border">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground mb-2">
                Du hesch no kei Fründe hinzugfüegt
              </p>
              <p className="text-sm text-muted-foreground">
                Füeg Fründe über ihrä E-Mail hinzue zum Rezept z'teilä
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {friends.map((friend) => (
                <Card key={friend.id} className="p-4 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                          {friend.displayName[0].toUpperCase()}
                        </div>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{friend.displayName}</p>
                        <p className="text-sm text-muted-foreground">{friend.email}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleRemove(friend.friendshipId)}
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
