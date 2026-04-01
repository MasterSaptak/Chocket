'use client';

import { useEffect, useState } from 'react';

type SmartImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> & {
  src?: string | null;
  alt: string;
  fallbackSrc?: string;
  fill?: boolean;
};

export function SmartImage({
  src,
  alt,
  fallbackSrc = 'https://picsum.photos/seed/placeholder/600/600',
  fill = false,
  className = '',
  ...props
}: SmartImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
      className={`${fill ? 'absolute inset-0 h-full w-full' : ''} ${className}`.trim()}
    />
  );
}
