'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

interface ProgressPhoto {
  id: string;
  photo_url: string;
  photo_type: string;
  weight_kg: number;
  body_fat_percentage: number;
  taken_at: string;
  notes: string;
}

interface ProgressPhotosProps {
  photos: ProgressPhoto[];
  userId: string;
}

export function ProgressPhotos({ photos, userId }: ProgressPhotosProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Progress Photos</CardTitle>
          <Button size="sm" className="gap-2">
            <span className="material-symbols-outlined text-sm">add_a_photo</span>
            Add Photo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-white/40">
            <span className="material-symbols-outlined text-6xl mb-4 opacity-40">photo_camera</span>
            <p className="text-lg mb-2">No progress photos yet</p>
            <p className="text-sm mb-4">Document your journey with progress photos</p>
            <Button size="sm">Upload First Photo</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-[3/4] rounded-lg overflow-hidden bg-white/5 border border-white/10 hover:border-primary/30 transition-colors cursor-pointer group"
                onClick={() => setSelectedPhoto(photo)}
              >
                <Image
                  src={photo.photo_url}
                  alt={`Progress photo from ${new Date(photo.taken_at).toLocaleDateString()}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-sm font-semibold text-white">
                      {new Date(photo.taken_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    {photo.weight_kg && (
                      <p className="text-xs text-white/80">
                        {photo.weight_kg}kg
                        {photo.body_fat_percentage && ` • ${photo.body_fat_percentage}%`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Photo Modal */}
        {selectedPhoto && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <div
              className="relative max-w-4xl w-full max-h-[90vh] bg-background-dark rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              >
                <span className="material-symbols-outlined text-white">close</span>
              </button>

              <div className="grid md:grid-cols-2 gap-6 p-6">
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                  <Image
                    src={selectedPhoto.photo_url}
                    alt="Progress photo"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-col justify-center">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {new Date(selectedPhoto.taken_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </h3>

                  <div className="space-y-4">
                    {selectedPhoto.weight_kg && (
                      <div>
                        <p className="text-sm text-white/60 mb-1">Weight</p>
                        <p className="text-xl font-semibold text-white">
                          {selectedPhoto.weight_kg} kg
                        </p>
                      </div>
                    )}

                    {selectedPhoto.body_fat_percentage && (
                      <div>
                        <p className="text-sm text-white/60 mb-1">Body Fat</p>
                        <p className="text-xl font-semibold text-white">
                          {selectedPhoto.body_fat_percentage}%
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm text-white/60 mb-1">Photo Type</p>
                      <p className="text-xl font-semibold text-white capitalize">
                        {selectedPhoto.photo_type}
                      </p>
                    </div>

                    {selectedPhoto.notes && (
                      <div>
                        <p className="text-sm text-white/60 mb-1">Notes</p>
                        <p className="text-white">{selectedPhoto.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
