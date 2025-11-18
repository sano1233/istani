'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Client {
  id: string;
  relationship_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  status: string;
  start_date: string;
  client_goals: any;
  current_program: string | null;
  completion_percentage: number;
  last_check_in: string | null;
  unread_messages: number;
}

interface TrainerStats {
  total_clients: number;
  active_clients: number;
  pending_requests: number;
  programs_created: number;
  average_rating: number;
  total_reviews: number;
  unread_messages: number;
}

interface CheckIn {
  id: string;
  client_name: string;
  check_in_date: string;
  weight_kg: number;
  body_fat_percentage: number;
  energy_level: number;
  motivation_level: number;
  client_notes: string;
  needs_response: boolean;
}

export function CoachingDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'programs' | 'check-ins'>(
    'overview'
  );
  const [stats, setStats] = useState<TrainerStats | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Load trainer stats
      await loadTrainerStats(user.id);

      // Load clients
      await loadClients(user.id);

      // Load recent check-ins
      await loadRecentCheckIns(user.id);

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setLoading(false);
    }
  }

  async function loadTrainerStats(trainerId: string) {
    try {
      // Get client counts
      const { data: relationships } = await supabase
        .from('client_trainer_relationships')
        .select('status')
        .eq('trainer_id', trainerId);

      const total_clients = relationships?.length || 0;
      const active_clients = relationships?.filter((r) => r.status === 'active').length || 0;
      const pending_requests = relationships?.filter((r) => r.status === 'pending').length || 0;

      // Get programs count
      const { count: programs_created } = await supabase
        .from('training_programs')
        .select('*', { count: 'exact', head: true })
        .eq('trainer_id', trainerId);

      // Get trainer rating
      const { data: profile } = await supabase
        .from('trainer_profiles')
        .select('rating_avg, rating_count')
        .eq('user_id', trainerId)
        .single();

      // Get unread messages
      const { count: unread_messages } = await supabase
        .from('trainer_messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', trainerId)
        .eq('is_read', false);

      setStats({
        total_clients,
        active_clients,
        pending_requests,
        programs_created: programs_created || 0,
        average_rating: profile?.rating_avg || 0,
        total_reviews: profile?.rating_count || 0,
        unread_messages: unread_messages || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  async function loadClients(trainerId: string) {
    try {
      const { data } = await supabase
        .from('client_trainer_relationships')
        .select(
          `
          *,
          client:client_id (
            id,
            email,
            profiles (full_name, avatar_url)
          )
        `
        )
        .eq('trainer_id', trainerId)
        .order('created_at', { ascending: false });

      if (data) {
        // Get additional data for each client
        const clientsWithDetails = await Promise.all(
          data.map(async (rel: any) => {
            // Get current program
            const { data: assignment } = await supabase
              .from('client_program_assignments')
              .select(
                `
                completion_percentage,
                program:program_id (name)
              `
              )
              .eq('client_id', rel.client_id)
              .eq('status', 'active')
              .single();

            // Get last check-in
            const { data: lastCheckIn } = await supabase
              .from('client_check_ins')
              .select('check_in_date')
              .eq('client_id', rel.client_id)
              .order('check_in_date', { ascending: false })
              .limit(1)
              .single();

            // Get unread messages from this client
            const { count: unreadMessages } = await supabase
              .from('trainer_messages')
              .select('*', { count: 'exact', head: true })
              .eq('sender_id', rel.client_id)
              .eq('recipient_id', trainerId)
              .eq('is_read', false);

            return {
              id: rel.client_id,
              relationship_id: rel.id,
              full_name: rel.client?.profiles?.full_name || 'Unknown',
              email: rel.client?.email || '',
              avatar_url: rel.client?.profiles?.avatar_url || null,
              status: rel.status,
              start_date: rel.start_date,
              client_goals: rel.client_goals,
              current_program: assignment?.program?.name || null,
              completion_percentage: assignment?.completion_percentage || 0,
              last_check_in: lastCheckIn?.check_in_date || null,
              unread_messages: unreadMessages || 0,
            };
          })
        );

        setClients(clientsWithDetails);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  }

  async function loadRecentCheckIns(trainerId: string) {
    try {
      const { data } = await supabase
        .from('client_check_ins')
        .select(
          `
          *,
          client:client_id (
            profiles (full_name)
          )
        `
        )
        .eq('trainer_id', trainerId)
        .is('trainer_feedback', null)
        .order('check_in_date', { ascending: false })
        .limit(10);

      if (data) {
        setCheckIns(
          data.map((ci: any) => ({
            id: ci.id,
            client_name: ci.client?.profiles?.full_name || 'Unknown',
            check_in_date: ci.check_in_date,
            weight_kg: ci.weight_kg,
            body_fat_percentage: ci.body_fat_percentage,
            energy_level: ci.energy_level,
            motivation_level: ci.motivation_level,
            client_notes: ci.client_notes,
            needs_response: !ci.trainer_feedback,
          }))
        );
      }
    } catch (error) {
      console.error('Error loading check-ins:', error);
    }
  }

  async function respondToCheckIn(checkInId: string, feedback: string) {
    try {
      const { error } = await supabase
        .from('client_check_ins')
        .update({
          trainer_feedback: feedback,
          updated_at: new Date().toISOString(),
        })
        .eq('id', checkInId);

      if (!error) {
        // Reload check-ins
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await loadRecentCheckIns(user.id);
        }
      }
    } catch (error) {
      console.error('Error responding to check-in:', error);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'paused':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'completed':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      default:
        return 'bg-white/10 text-white/60 border-white/30';
    }
  };

  const getMotivationColor = (level: number) => {
    if (level >= 8) return 'text-green-400';
    if (level >= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="h-20 bg-white/10 rounded"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Coaching Dashboard</h1>
          <p className="text-white/60">Manage your clients and training programs</p>
        </div>
        <Button>
          <span className="material-symbols-outlined mr-2">person_add</span>
          Add Client
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {['overview', 'clients', 'programs', 'check-ins'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 font-semibold capitalize transition-colors ${
              activeTab === tab
                ? 'text-primary border-b-2 border-primary'
                : 'text-white/60 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="material-symbols-outlined text-primary text-3xl">group</span>
                <span className="text-3xl font-bold text-white">{stats.active_clients}</span>
              </div>
              <p className="text-white/60 text-sm">Active Clients</p>
              <p className="text-white/40 text-xs mt-1">{stats.total_clients} total</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="material-symbols-outlined text-yellow-500 text-3xl">
                  pending
                </span>
                <span className="text-3xl font-bold text-white">{stats.pending_requests}</span>
              </div>
              <p className="text-white/60 text-sm">Pending Requests</p>
              <p className="text-white/40 text-xs mt-1">Awaiting response</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="material-symbols-outlined text-green-500 text-3xl">
                  assignment
                </span>
                <span className="text-3xl font-bold text-white">{stats.programs_created}</span>
              </div>
              <p className="text-white/60 text-sm">Programs Created</p>
              <p className="text-white/40 text-xs mt-1">Training templates</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="material-symbols-outlined text-purple-500 text-3xl">star</span>
                <span className="text-3xl font-bold text-white">
                  {stats.average_rating.toFixed(1)}
                </span>
              </div>
              <p className="text-white/60 text-sm">Average Rating</p>
              <p className="text-white/40 text-xs mt-1">{stats.total_reviews} reviews</p>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Check-Ins Needing Response */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Recent Check-Ins
                {checkIns.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-yellow-400">
                    ({checkIns.length} need response)
                  </span>
                )}
              </h3>

              {checkIns.length === 0 ? (
                <p className="text-white/40 text-center py-8">No check-ins needing response</p>
              ) : (
                <div className="space-y-3">
                  {checkIns.slice(0, 5).map((checkIn) => (
                    <div
                      key={checkIn.id}
                      className="p-4 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-white font-semibold">{checkIn.client_name}</p>
                          <p className="text-white/60 text-sm">
                            {new Date(checkIn.check_in_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <div className="text-right">
                            <p className="text-white font-semibold">{checkIn.weight_kg} kg</p>
                            <p className="text-white/60 text-xs">Weight</p>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-semibold ${getMotivationColor(checkIn.motivation_level)}`}
                            >
                              {checkIn.motivation_level}/10
                            </p>
                            <p className="text-white/60 text-xs">Motivation</p>
                          </div>
                        </div>
                      </div>

                      {checkIn.client_notes && (
                        <p className="text-white/80 text-sm mb-3 italic">
                          &quot;{checkIn.client_notes}&quot;
                        </p>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const feedback = prompt('Enter your feedback for this check-in:');
                          if (feedback) {
                            respondToCheckIn(checkIn.id, feedback);
                          }
                        }}
                      >
                        Respond
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Clients Overview */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Active Clients Overview</h3>

              {clients.filter((c) => c.status === 'active').length === 0 ? (
                <p className="text-white/40 text-center py-8">No active clients yet</p>
              ) : (
                <div className="space-y-3">
                  {clients
                    .filter((c) => c.status === 'active')
                    .slice(0, 5)
                    .map((client) => (
                      <div
                        key={client.id}
                        className="p-4 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => setSelectedClient(client)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                              <span className="material-symbols-outlined text-primary">
                                person
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-semibold">{client.full_name}</p>
                              <p className="text-white/60 text-sm">
                                {client.current_program || 'No active program'}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-white font-semibold">
                              {client.completion_percentage.toFixed(0)}%
                            </p>
                            <p className="text-white/60 text-xs">Complete</p>
                          </div>
                        </div>

                        {client.unread_messages > 0 && (
                          <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-primary/20 rounded text-primary text-xs">
                            <span className="material-symbols-outlined text-sm">mail</span>
                            {client.unread_messages} unread message
                            {client.unread_messages > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Clients Tab */}
      {activeTab === 'clients' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <Card key={client.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-2xl">
                      person
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">{client.full_name}</p>
                    <p className="text-white/60 text-sm">{client.email}</p>
                  </div>
                </div>

                <span
                  className={`px-2 py-1 rounded text-xs border ${getStatusColor(client.status)}`}
                >
                  {client.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Started:</span>
                  <span className="text-white">
                    {new Date(client.start_date).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Current Program:</span>
                  <span className="text-white">
                    {client.current_program || 'None'}
                  </span>
                </div>

                {client.current_program && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-white/60">Progress:</span>
                      <span className="text-white">{client.completion_percentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${client.completion_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Last Check-in:</span>
                  <span className="text-white">
                    {client.last_check_in
                      ? new Date(client.last_check_in).toLocaleDateString()
                      : 'Never'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <span className="material-symbols-outlined mr-2">visibility</span>
                  View
                </Button>
                <Button size="sm" variant="outline">
                  <span className="material-symbols-outlined">message</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Programs Tab */}
      {activeTab === 'programs' && (
        <Card className="p-12">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-white/20 mb-4">
              fitness_center
            </span>
            <h3 className="text-2xl font-bold text-white mb-2">Training Programs</h3>
            <p className="text-white/60 mb-6">
              Create and manage training programs for your clients
            </p>
            <Button>
              <span className="material-symbols-outlined mr-2">add</span>
              Create Program
            </Button>
          </div>
        </Card>
      )}

      {/* Check-ins Tab */}
      {activeTab === 'check-ins' && (
        <div className="space-y-4">
          {checkIns.map((checkIn) => (
            <Card key={checkIn.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{checkIn.client_name}</h3>
                  <p className="text-white/60">
                    {new Date(checkIn.check_in_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {checkIn.needs_response && (
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded text-sm">
                    Needs Response
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <div>
                  <p className="text-white/60 text-sm mb-1">Weight</p>
                  <p className="text-white text-xl font-bold">{checkIn.weight_kg} kg</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Body Fat</p>
                  <p className="text-white text-xl font-bold">{checkIn.body_fat_percentage}%</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Energy</p>
                  <p className={`text-xl font-bold ${getMotivationColor(checkIn.energy_level)}`}>
                    {checkIn.energy_level}/10
                  </p>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Motivation</p>
                  <p
                    className={`text-xl font-bold ${getMotivationColor(checkIn.motivation_level)}`}
                  >
                    {checkIn.motivation_level}/10
                  </p>
                </div>
              </div>

              {checkIn.client_notes && (
                <div className="p-4 bg-white/5 rounded-lg mb-4">
                  <p className="text-white/60 text-sm mb-1">Client Notes:</p>
                  <p className="text-white italic">&quot;{checkIn.client_notes}&quot;</p>
                </div>
              )}

              {checkIn.needs_response && (
                <Button
                  onClick={() => {
                    const feedback = prompt('Enter your feedback for this check-in:');
                    if (feedback) {
                      respondToCheckIn(checkIn.id, feedback);
                    }
                  }}
                >
                  <span className="material-symbols-outlined mr-2">reply</span>
                  Respond to Check-in
                </Button>
              )}
            </Card>
          ))}

          {checkIns.length === 0 && (
            <Card className="p-12">
              <div className="text-center">
                <span className="material-symbols-outlined text-6xl text-white/20 mb-4">
                  assessment
                </span>
                <p className="text-white/60">No check-ins needing response</p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
