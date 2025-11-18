'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ExerciseVideo {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number;
  difficulty: string;
  muscle_groups: string[];
  video_type: string;
  instructor_name: string | null;
  views_count: number;
  likes_count: number;
  is_premium: boolean;
  tags: string[];
  user_has_liked?: boolean;
}

export function VideoLibrary() {
  const [videos, setVideos] = useState<ExerciseVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<ExerciseVideo | null>(null);
  const [filter, setFilter] = useState<'all' | 'tutorial' | 'workout' | 'motivation'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [watchStartTime, setWatchStartTime] = useState<Date | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadVideos();
  }, [filter, difficultyFilter]);

  useEffect(() => {
    if (selectedVideo && !watchStartTime) {
      setWatchStartTime(new Date());
      recordVideoView(selectedVideo.id);
    }

    return () => {
      if (watchStartTime && selectedVideo) {
        const watchDuration = Math.floor((new Date().getTime() - watchStartTime.getTime()) / 1000);
        updateVideoProgress(selectedVideo.id, watchDuration);
      }
    };
  }, [selectedVideo]);

  async function loadVideos() {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let query = supabase
        .from('exercise_videos')
        .select('*')
        .eq('is_premium', false)
        .order('views_count', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('video_type', filter);
      }

      if (difficultyFilter) {
        query = query.eq('difficulty', difficultyFilter);
      }

      const { data: videosData } = await query.limit(50);

      if (videosData && user) {
        // Check which videos user has liked
        const videoIds = videosData.map((v) => v.id);
        const { data: likesData } = await supabase
          .from('video_likes')
          .select('video_id')
          .eq('user_id', user.id)
          .in('video_id', videoIds);

        const likedIds = new Set(likesData?.map((l) => l.video_id) || []);

        setVideos(
          videosData.map((v) => ({
            ...v,
            user_has_liked: likedIds.has(v.id),
          }))
        );
      }
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function recordVideoView(videoId: string) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('video_views').insert({
        user_id: user.id,
        video_id: videoId,
        watch_duration_seconds: 0,
        last_position_seconds: 0,
      });
    } catch (error) {
      console.error('Error recording video view:', error);
    }
  }

  async function updateVideoProgress(videoId: string, watchDuration: number) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const video = videos.find((v) => v.id === videoId);
      const completed = video ? watchDuration >= video.duration_seconds * 0.9 : false;

      await supabase
        .from('video_views')
        .update({
          watch_duration_seconds: watchDuration,
          last_position_seconds: videoRef.current?.currentTime || 0,
          completed,
        })
        .eq('user_id', user.id)
        .eq('video_id', videoId);
    } catch (error) {
      console.error('Error updating video progress:', error);
    }
  }

  async function toggleLike(videoId: string) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const video = videos.find((v) => v.id === videoId);
      if (!video) return;

      if (video.user_has_liked) {
        await supabase
          .from('video_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('video_id', videoId);

        setVideos((prev) =>
          prev.map((v) =>
            v.id === videoId
              ? { ...v, likes_count: Math.max(0, v.likes_count - 1), user_has_liked: false }
              : v
          )
        );
      } else {
        await supabase.from('video_likes').insert({
          user_id: user.id,
          video_id: videoId,
        });

        setVideos((prev) =>
          prev.map((v) =>
            v.id === videoId ? { ...v, likes_count: v.likes_count + 1, user_has_liked: true } : v
          )
        );
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-500';
      case 'intermediate':
        return 'text-yellow-500';
      case 'advanced':
        return 'text-red-500';
      default:
        return 'text-white';
    }
  };

  const filteredVideos = videos.filter((video) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      video.title.toLowerCase().includes(query) ||
      video.description?.toLowerCase().includes(query) ||
      video.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  if (selectedVideo) {
    return (
      <div className="space-y-6">
        {/* Video Player */}
        <Card className="p-0 overflow-hidden">
          <div className="relative aspect-video bg-black">
            {/* Placeholder for actual video player */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="material-symbols-outlined text-6xl text-white/40 mb-4">
                  play_circle
                </span>
                <p className="text-white/60">Video Player</p>
                <p className="text-white/40 text-sm mt-2">{selectedVideo.video_url}</p>
              </div>
            </div>

            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center justify-between">
                <Button
                  onClick={() => setIsPlaying(!isPlaying)}
                  variant="ghost"
                  className="text-white"
                >
                  <span className="material-symbols-outlined">
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </Button>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleLike(selectedVideo.id)}
                    className={`transition-colors ${selectedVideo.user_has_liked ? 'text-red-500' : 'text-white/60 hover:text-red-500'}`}
                  >
                    <span className="material-symbols-outlined">
                      {selectedVideo.user_has_liked ? 'favorite' : 'favorite_border'}
                    </span>
                  </button>

                  <button className="text-white/60 hover:text-white transition-colors">
                    <span className="material-symbols-outlined">playlist_add</span>
                  </button>

                  <button className="text-white/60 hover:text-white transition-colors">
                    <span className="material-symbols-outlined">share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Video Info */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedVideo.title}</h2>
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <span>{selectedVideo.views_count.toLocaleString()} views</span>
                  <span>{selectedVideo.likes_count.toLocaleString()} likes</span>
                  <span className={getDifficultyColor(selectedVideo.difficulty)}>
                    {selectedVideo.difficulty.charAt(0).toUpperCase() +
                      selectedVideo.difficulty.slice(1)}
                  </span>
                </div>
              </div>

              <Button onClick={() => setSelectedVideo(null)} variant="outline">
                <span className="material-symbols-outlined mr-2">close</span>
                Back to Library
              </Button>
            </div>

            {selectedVideo.instructor_name && (
              <p className="text-white/80 mb-2">
                Instructor: <span className="font-semibold">{selectedVideo.instructor_name}</span>
              </p>
            )}

            {selectedVideo.description && (
              <p className="text-white/80 mb-4">{selectedVideo.description}</p>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedVideo.muscle_groups.map((group) => (
                <span
                  key={group}
                  className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
                >
                  {group}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedVideo.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </Card>

        {/* Related Videos */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Related Videos</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {videos
              .filter((v) => v.id !== selectedVideo.id)
              .slice(0, 4)
              .map((video) => (
                <div
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <div className="aspect-video bg-white/5 rounded-lg mb-2 relative">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-white/40">
                          play_circle
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-white text-xs">
                      {formatDuration(video.duration_seconds)}
                    </div>
                  </div>
                  <h4 className="text-white font-semibold text-sm line-clamp-2">{video.title}</h4>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40">
              search
            </span>
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Type Filters */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'tutorial', 'workout', 'motivation'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filter === type
                    ? 'bg-primary text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* Difficulty Filters */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setDifficultyFilter(null)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                !difficultyFilter
                  ? 'bg-primary text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              All Levels
            </button>
            {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setDifficultyFilter(level)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  difficultyFilter === level
                    ? 'bg-primary text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Video Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-0 overflow-hidden">
              <div className="animate-pulse">
                <div className="aspect-video bg-white/10"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-3 bg-white/10 rounded w-1/2"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <Card
              key={video.id}
              onClick={() => setSelectedVideo(video)}
              className="p-0 overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-white/5 relative">
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-white/40">
                      play_circle
                    </span>
                  </div>
                )}

                {/* Duration */}
                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-white text-sm">
                  {formatDuration(video.duration_seconds)}
                </div>

                {/* Difficulty Badge */}
                <div className="absolute top-2 left-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${getDifficultyColor(video.difficulty)} bg-black/60`}
                  >
                    {video.difficulty.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-white font-semibold mb-2 line-clamp-2">{video.title}</h3>

                {video.instructor_name && (
                  <p className="text-white/60 text-sm mb-2">{video.instructor_name}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-white/60">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    {video.views_count.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">favorite</span>
                    {video.likes_count}
                  </div>
                </div>

                {/* Muscle Groups */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {video.muscle_groups.slice(0, 3).map((group) => (
                    <span
                      key={group}
                      className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs"
                    >
                      {group}
                    </span>
                  ))}
                  {video.muscle_groups.length > 3 && (
                    <span className="px-2 py-0.5 bg-white/10 text-white/60 rounded text-xs">
                      +{video.muscle_groups.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {filteredVideos.length === 0 && !loading && (
        <Card className="p-12">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-white/20 mb-4">
              video_library
            </span>
            <h3 className="text-2xl font-bold text-white mb-2">No Videos Found</h3>
            <p className="text-white/60">Try adjusting your filters or search query</p>
          </div>
        </Card>
      )}
    </div>
  );
}
