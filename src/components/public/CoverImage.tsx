"use client";

import Image from "next/image";
import { useState } from "react";
import { isOptimizableImage } from "@/lib/utils";

interface CoverImageProps {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  fallback: React.ReactNode;
  // Se dibuja encima de la imagen solo si cargó (degradado, título...)
  children?: React.ReactNode;
}

// Imagen que ocupa su contenedor; si el archivo no carga muestra el respaldo
// en vez de una imagen rota (US-65).
export default function CoverImage({ src, alt, sizes, className, fallback, children }: CoverImageProps) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{fallback}</>;
  return (
    <>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        unoptimized={!isOptimizableImage(src)}
        onError={() => setFailed(true)}
        className={className}
      />
      {children}
    </>
  );
}
