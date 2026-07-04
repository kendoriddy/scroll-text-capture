"use client";

import { useCallback, useEffect, useRef, useState } from "react";

async function attachStreamToVideo(
  video: HTMLVideoElement,
  stream: MediaStream,
): Promise<void> {
  if (video.srcObject !== stream) {
    video.srcObject = stream;
  }
  if (video.paused) {
    try {
      await video.play();
    } catch {
      // Autoplay may be blocked until user gesture; stream is still attached.
    }
  }
}

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

  const bindStreamToVideo = useCallback(async () => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (video && stream) {
      await attachStreamToVideo(video, stream);
    }
  }, []);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setCameraDenied(false);
    stopStream();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      streamRef.current = stream;
      setMode("camera");
      setImageUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        imageUrlRef.current = null;
        return null;
      });
      await bindStreamToVideo();
    } catch {
      setCameraDenied(true);
      setMode("image");
    } finally {
      setIsLoading(false);
    }
  }, [stopStream, bindStreamToVideo]);

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
        setMode("camera");
        await bindStreamToVideo();
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
  }, [stopStream, bindStreamToVideo]);

  useEffect(() => {
    if (!isLoading && mode === "camera") {
      void bindStreamToVideo();
    }
  }, [isLoading, mode, bindStreamToVideo]);

  const getSourceElement = useCallback(():
    | HTMLVideoElement
    | HTMLImageElement
    | null => {
    if (mode === "camera") return videoRef.current;
    return imageRef.current;
  }, [mode]);

  const ensureVideoReady =
    useCallback(async (): Promise<HTMLVideoElement | null> => {
      const video = videoRef.current;
      const stream = streamRef.current;
      if (!video || !stream || mode !== "camera") return null;

      await attachStreamToVideo(video, stream);

      if (video.readyState >= 2) return video;

      await new Promise<void>((resolve) => {
        if (video.readyState >= 2) {
          resolve();
          return;
        }
        const onReady = () => {
          video.removeEventListener("loadeddata", onReady);
          video.removeEventListener("canplay", onReady);
          resolve();
        };
        video.addEventListener("loadeddata", onReady);
        video.addEventListener("canplay", onReady);
        setTimeout(resolve, 3000);
      });

      return video.readyState >= 2 ? video : null;
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
    ensureVideoReady,
  };
}
