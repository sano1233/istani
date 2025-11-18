'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProgressPhoto {
  id: string;
  measurement_date: string;
  weight_kg: number | null;
  body_fat_percentage: number | null;
  photos: {
    front?: string;
    side?: string;
    back?: string;
  };
}

export function PhotoComparison() {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [selectedBefore, setSelectedBefore] = useState<ProgressPhoto | null>(null);
  const [selectedAfter, setSelectedAfter] = useState<ProgressPhoto | null>(null);
  const [comparisonMode, setComparisonMode] = useState<'front' | 'side' | 'back'>('front');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadProgressPhotos();
  }, []);

  async function loadProgressPhotos() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', user.id)
        .not('photos', 'is', null)
        .order('measurement_date', { ascending: true });

      if (data) {
        setPhotos(data);

        // Auto-select first and last photos if available
        if (data.length >= 2) {
          setSelectedBefore(data[0]);
          setSelectedAfter(data[data.length - 1]);
        }
      }
    } catch (error) {
      console.error('Error loading progress photos:', error);
    } finally {
      setLoading(false);
    }
  }

  const calculateStats = () => {
    if (!selectedBefore || !selectedAfter) return null;

    const weightChange = selectedAfter.weight_kg && selectedBefore.weight_kg
      ? selectedAfter.weight_kg - selectedBefore.weight_kg
      : null;

    const bodyFatChange = selectedAfter.body_fat_percentage && selectedBefore.body_fat_percentage
      ? selectedAfter.body_fat_percentage - selectedBefore.body_fat_percentage
      : null;

    const daysBetween = Math.floor(
      (new Date(selectedAfter.measurement_date).getTime() -
        new Date(selectedBefore.measurement_date).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    return {
      weightChange,
      bodyFatChange,
      daysBetween,
      weeksBetween: Math.floor(daysBetween / 7),
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded w-1/3"></div>
          <div className="aspect-square bg-white/10 rounded"></div>
        </div>
      </Card>
    );
  }

  if (photos.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-white/20 mb-4">
            photo_camera
          </span>
          <h3 className="text-2xl font-bold text-white mb-2">No Progress Photos</h3>
          <p className="text-white/60 mb-6">
            Upload photos with your body measurements to track visual progress over time.
          </p>
          <Button>Upload First Photo</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Photo Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Before Photo Selection */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">Before Photo</h3>
          <div className="space-y-3">
            {photos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => setSelectedBefore(photo)}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  selectedBefore?.id === photo.id
                    ? 'bg-primary/20 border-2 border-primary'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">
                      {new Date(photo.measurement_date).toLocaleDateString()}
                    </p>
                    {photo.weight_kg && (
                      <p className="text-white/60 text-sm">{photo.weight_kg} kg</p>
                    )}
                  </div>
                  {selectedBefore?.id === photo.id && (
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* After Photo Selection */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">After Photo</h3>
          <div className="space-y-3">
            {photos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => setSelectedAfter(photo)}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  selectedAfter?.id === photo.id
                    ? 'bg-primary/20 border-2 border-primary'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">
                      {new Date(photo.measurement_date).toLocaleDateString()}
                    </p>
                    {photo.weight_kg && (
                      <p className="text-white/60 text-sm">{photo.weight_kg} kg</p>
                    )}
                  </div>
                  {selectedAfter?.id === photo.id && (
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-white">
              {stats.weightChange !== null ? (
                <>
                  {stats.weightChange > 0 && '+'}
                  {stats.weightChange.toFixed(1)} kg
                </>
              ) : (
                'N/A'
              )}
            </p>
            <p className="text-white/60 text-sm">Weight Change</p>
          </Card>

          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-white">
              {stats.bodyFatChange !== null ? (
                <>
                  {stats.bodyFatChange > 0 && '+'}
                  {stats.bodyFatChange.toFixed(1)}%
                </>
              ) : (
                'N/A'
              )}
            </p>
            <p className="text-white/60 text-sm">Body Fat Change</p>
          </Card>

          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-white">{stats.weeksBetween}</p>
            <p className="text-white/60 text-sm">Weeks Between</p>
          </Card>
        </div>
      )}

      {/* View Mode Toggle */}
      <div className="flex gap-2 justify-center">
        {(['front', 'side', 'back'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setComparisonMode(mode)}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              comparisonMode === mode
                ? 'bg-primary text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      {/* Comparison Viewer */}
      {selectedBefore && selectedAfter && (
        <Card className="p-6">
          <h3 className="text-2xl font-bold text-white mb-4">Side-by-Side Comparison</h3>

          <div className="grid grid-cols-2 gap-6">
            {/* Before */}
            <div>
              <p className="text-white/60 text-sm mb-2">
                Before - {new Date(selectedBefore.measurement_date).toLocaleDateString()}
              </p>
              {selectedBefore.photos?.[comparisonMode] ? (
                <img
                  src={selectedBefore.photos[comparisonMode]}
                  alt="Before"
                  className="w-full aspect-[3/4] object-cover rounded-lg"
                />
              ) : (
                <div className="w-full aspect-[3/4] bg-white/5 rounded-lg flex items-center justify-center">
                  <p className="text-white/40">No {comparisonMode} photo</p>
                </div>
              )}
            </div>

            {/* After */}
            <div>
              <p className="text-white/60 text-sm mb-2">
                After - {new Date(selectedAfter.measurement_date).toLocaleDateString()}
              </p>
              {selectedAfter.photos?.[comparisonMode] ? (
                <img
                  src={selectedAfter.photos[comparisonMode]}
                  alt="After"
                  className="w-full aspect-[3/4] object-cover rounded-lg"
                />
              ) : (
                <div className="w-full aspect-[3/4] bg-white/5 rounded-lg flex items-center justify-center">
                  <p className="text-white/40">No {comparisonMode} photo</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Slider Comparison */}
      {selectedBefore &&
        selectedAfter &&
        selectedBefore.photos?.[comparisonMode] &&
        selectedAfter.photos?.[comparisonMode] && (
          <Card className="p-6">
            <h3 className="text-2xl font-bold text-white mb-4">Slider Comparison</h3>

            <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-black">
              {/* After Image (background) */}
              <img
                src={selectedAfter.photos[comparisonMode]!}
                alt="After"
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Before Image (foreground with clip) */}
              <img
                src={selectedBefore.photos[comparisonMode]!}
                alt="Before"
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
                }}
              />

              {/* Slider Line */}
              <div
                className="absolute inset-y-0 w-1 bg-white shadow-lg"
                style={{ left: `${sliderPosition}%` }}
              >
                {/* Slider Handle */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center cursor-ew-resize">
                  <span className="material-symbols-outlined text-black">drag_indicator</span>
                </div>
              </div>

              {/* Labels */}
              <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded-lg">
                <p className="text-white text-sm font-semibold">Before</p>
              </div>
              <div className="absolute top-4 right-4 bg-black/60 px-3 py-1 rounded-lg">
                <p className="text-white text-sm font-semibold">After</p>
              </div>

              {/* Interactive Overlay */}
              <div
                className="absolute inset-0 cursor-ew-resize"
                onMouseMove={(e) => {
                  if (e.buttons === 1) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percentage = (x / rect.width) * 100;
                    setSliderPosition(Math.max(0, Math.min(100, percentage)));
                  }
                }}
                onTouchMove={(e) => {
                  const touch = e.touches[0];
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = touch.clientX - rect.left;
                  const percentage = (x / rect.width) * 100;
                  setSliderPosition(Math.max(0, Math.min(100, percentage)));
                }}
              ></div>
            </div>

            {/* Slider Control */}
            <div className="mt-4">
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </Card>
        )}
    </div>
  );
}
