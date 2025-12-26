import { useState, useEffect } from "react";

export const useTypewriter = (
  phrases: string[],
  typingSpeed = 100,
  erasingSpeed = 50,
  delayBetween = 2000,
) => {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    if (index >= phrases.length) {
      setIndex(0);
      return;
    }

    if (subIndex === phrases[index].length + 1 && !isDeleting) {
      const timeout = setTimeout(() => setIsDeleting(true), delayBetween);
      return () => clearTimeout(timeout);
    }

    if (subIndex === 0 && isDeleting) {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % phrases.length);
      return;
    }

    const timeout = setTimeout(
      () => {
        setSubIndex((prev) => prev + (isDeleting ? -1 : 1));
      },
      isDeleting ? erasingSpeed : typingSpeed,
    );

    return () => clearTimeout(timeout);
  }, [
    subIndex,
    index,
    isDeleting,
    phrases,
    typingSpeed,
    erasingSpeed,
    delayBetween,
  ]);

  useEffect(() => {
    setText(phrases[index].substring(0, subIndex));
  }, [subIndex, index, phrases]);

  return text;
};
