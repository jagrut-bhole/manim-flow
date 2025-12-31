"use client";

import { GalleryCard } from "@/components/GalleryCard";
import Navbar from "@/components/Navbar";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

interface GalleryItem {
  id: number;
  title: string;
  prompt: string;
  author: string;
  videoSrc: string;
  isNew?: boolean;
  code?: string;
  thumbnailUrl?: string;
}

export default function Gallerypage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        const result = await axios.get("/api/gallery");

        if (result.data.success) {
          const mappedItems: GalleryItem[] = result.data.data.map(
            (item: any, index: number) => ({
              id: index + 1,
              title: item.title || item.prompt.slice(0, 50) + "...",
              prompt: item.prompt,
              author: item.user?.name || "Anonymous",
              videoSrc: item.videoUrl || "",
              code: item.code || "",
              thumbnailUrl: item.thumbnailUrl,
              isNew: false,
            }),
          );
          setGalleryItems(mappedItems);
        }
      } catch (error) {
        console.log("Error fetching gallery data:", error);
        toast.error("Failed to fetch gallery data.");
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryData();
  }, []);

  return (
    <div className="min-h-screen bg-[#030303] overflow-hidden">
      <Navbar />
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20">
        <div className="container mx-auto px-4 py-5 text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
            Explore Community Example
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Discover beautiful components created by developers worldwide. Each
            example includes the prompt used to generate it.
          </p>
        </div>
      </section>

      {/* Gallery Grid */}
      <main className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <TextShimmer className="text-xl font-medium" duration={1.5}>
              Loading gallery....
            </TextShimmer>
          </div>
        ) : galleryItems.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-lg text-muted-foreground">
              Currently there are no examples to show on gallery.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {galleryItems.map((example) => (
              <GalleryCard key={example.id} {...example} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
