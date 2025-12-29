interface Example {
  id: number;
  title: string;
  prompt: string;
  author: string;
  videoSrc: string;
  isNew?: boolean;
}

const sampleVideo =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

export const examples: Example[] = [
  {
    id: 1,
    title: "Anime js scrollbar",
    prompt:
      "Create an animated scrollbar with anime.js that shows progress with smooth easing and custom styling",
    author: "Sarah Chen",
    videoSrc: sampleVideo,
    isNew: true,
  },
  {
    id: 2,
    title: "Anime js scrollbar",
    prompt:
      "Create an animated scrollbar with anime.js that shows progress with smooth easing and custom styling",
    author: "Sarah Chen",
    videoSrc: sampleVideo,
    isNew: true,
  },
  {
    id: 3,
    title: "Anime js scrollbar",
    prompt:
      "Create an animated scrollbar with anime.js that shows progress with smooth easing and custom styling",
    author: "Sarah Chen",
    videoSrc: sampleVideo,
    isNew: true,
  },
  {
    id: 4,
    title: "Anime js scrollbar",
    prompt:
      "Create an animated scrollbar with anime.js that shows progress with smooth easing and custom styling",
    author: "Sarah Chen",
    videoSrc: sampleVideo,
    isNew: true,
  },
  {
    id: 5,
    title: "Anime js scrollbar",
    prompt:
      "Create an animated scrollbar with anime.js that shows progress with smooth easing and custom styling",
    author: "Sarah Chen",
    videoSrc: sampleVideo,
    isNew: true,
  },
  {
    id: 6,
    title: "Anime js scrollbar",
    prompt:
      "Create an animated scrollbar with anime.js that shows progress with smooth easing and custom styling",
    author: "Sarah Chen",
    videoSrc: sampleVideo,
    isNew: false,
  },
];
