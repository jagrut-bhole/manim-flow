"use server";

import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ResultContent } from "@/components/ResultContent";

interface PageProps {
  params: Promise<{
    animationId: string;
  }>;
}

export default async function ResultPage({ params }: PageProps) {
  const { animationId } = await params;

  const animation = await prisma.animation.findUnique({
    where: {
      id: animationId,
    },
  });

  if (!animation) {
    notFound();
  }

  return <ResultContent animation={animation} />;
}
