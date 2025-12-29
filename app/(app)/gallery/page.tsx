"use client";

import { GalleryCard } from "@/components/GalleryCard";
import { examples } from "@/constants/video";
import Navbar from "@/components/Navbar";

export default function Gallerypage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar/>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Explore <span className="gradient-text">Community Examples</span>
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Discover beautiful components created by developers worldwide. Each
            example includes the prompt used to generate it.
          </p>
        </div>
      </section>

      {/* Gallery Grid */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {examples.map((example) => (
            <GalleryCard key={example.id} {...example} />
          ))}
        </div>
      </main>
    </div>
  );
}
