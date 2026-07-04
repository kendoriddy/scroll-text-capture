"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const imageUrlRef = useRef<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [cameraDenied, setCameraDenied] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<"camera" | "image">("camera");

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setCameraDenied(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
      }
      setMode("camera");
      setImageUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        imageUrlRef.current = null;
        return null;
      });
    } catch {
      setCameraDenied(true);
      setMode("image");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setImageFile = useCallback(
    (file: File) => {
      stopStream();
      const url = URL.createObjectURL(file);
      imageUrlRef.current = url;
      setImageUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      setMode("image");
      setIsLoading(false);
    },
    [stopStream],
  );

  useEffect(() => {
    let cancelled = false;

    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
        }
        setMode("camera");
      } catch {
        if (!cancelled) {
          setCameraDenied(true);
          setMode("image");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    initCamera();

    return () => {
      cancelled = true;
      stopStream();
      if (imageUrlRef.current) {
        URL.revokeObjectURL(imageUrlRef.current);
        imageUrlRef.current = null;
      }
    };
  }, [stopStream]);

  const getSourceElement = useCallback(():
    | HTMLVideoElement
    | HTMLImageElement
    | null => {
    if (mode === "camera") return videoRef.current;
    return imageRef.current;
  }, [mode]);

  return {
    videoRef,
    imageRef,
    isLoading,
    cameraDenied,
    imageUrl,
    mode,
    startCamera,
    setImageFile,
    getSourceElement,
  };
}
