"use server";

import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ShareContent } from "@/components/ShareContent";

interface PageProps {
  params: Promise<{
    animationId: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { animationId } = await params;

  const animation = await prisma.animation.findUnique({
    where: {
      id: animationId,
      status: "COMPLETED",
      videoUrl: {
        not: null,
      },
    },
    select: {
      prompt: true,
      thumbnailUrl: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!animation) {
    return {
      title: "Animation Not Found",
    };
  }

  const title = `${animation.prompt.substring(0, 30)}${animation.prompt.length > 30 ? "..." : ""} | Manim Flow`;
  const description = `Check out this animation created with ManimFlow by ${animation.user.name || "a user"}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: animation.thumbnailUrl
        ? [
            {
              url: animation.thumbnailUrl,
              width: 1200,
              height: 630,
              alt: animation.prompt,
            },
          ]
        : [],
      type: "video.other",
    },
    twitter: {
      card: "player",
      title,
      description,
      images: animation.thumbnailUrl ? [animation.thumbnailUrl] : [],
    },
  };
}

export default async function SharePage({ params }: PageProps) {
  const { animationId } = await params;

  const animation = await prisma.animation.findUnique({
    where: {
      id: animationId,
      status: "COMPLETED",
      videoUrl: {
        not: null,
      },
    },
    include: {
      user: {
        select: {
          name: true,
          id: true,
        },
      },
    },
  });

  if (!animation || !animation.videoUrl) {
    notFound();
  }

  return <ShareContent animation={animation} />;
}
