"use client";

import { useEffect, useRef, useState } from "react";
import {
  RiPlayFill,
  RiPauseFill,
  RiVolumeUpFill,
  RiVolumeMuteFill,
  RiFullscreenFill,
  RiFullscreenExitFill,
  RiShieldUserLine,
  RiLoader4Line,
} from "react-icons/ri";

interface VideoPlayerProps {
  videoUrl?: string | null;
  title?: string;
}

export function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [srcUrl, setSrcUrl] = useState<string>("");
  const [domainAllowed, setDomainAllowed] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Restrict Domains
  useEffect(() => {
    if (typeof window !== "undefined") {
      const allowedDomains = ["localhost", "127.0.0.1", "itsniloy.eu.org", "victorydesign", "vtclbd"];
      const hostname = window.location.hostname;
      const isAllowed = allowedDomains.some((domain) => hostname.includes(domain));
      setDomainAllowed(isAllowed);
    }
  }, []);

  // 2. Hide Direct URL using Blob URL loading
  useEffect(() => {
    if (!videoUrl || !domainAllowed) return;

    setIsLoading(true);
    let active = true;
    let objectUrl = "";

    // Attempt to fetch as blob to hide actual URL from inspect element
    fetch(videoUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Fetch failed");
        return res.blob();
      })
      .then((blob) => {
        if (active) {
          objectUrl = URL.createObjectURL(blob);
          setSrcUrl(objectUrl);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        // Fallback to direct URL if CORS or fetch fails, protected by overlay/controls
        if (active) {
          console.warn("CORS/Fetch blocked Blob URL creation. Falling back to secure direct streaming.");
          setSrcUrl(videoUrl);
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [videoUrl, domainAllowed]);

  // Controls visibility timer
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const time = parseFloat(e.target.value);
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const vol = parseFloat(e.target.value);
      videoRef.current.volume = vol;
      setVolume(vol);
      setIsMuted(vol === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable full-screen:", err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if focus is in video container or general body (not input/textarea)
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }
      
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "KeyM") {
        e.preventDefault();
        toggleMute();
      } else if (e.code === "KeyF") {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, isMuted]);

  if (!domainAllowed) {
    return (
      <div className="aspect-video w-full rounded-2xl bg-zinc-950 border border-red-500/30 flex flex-col items-center justify-center p-6 text-center text-red-400">
        <RiShieldUserLine className="text-4xl mb-3 animate-pulse" />
        <h4 className="font-bold text-base">Security Domain Restriction</h4>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm">
          Playback is restricted on this domain. Streaming is only authorized through official VTCLBD learning applications.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl group select-none"
    >
      {/* 3. Transparent Security Overlay & Double click to Fullscreen */}
      <div
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        onContextMenu={(e) => e.preventDefault()}
        className="absolute inset-0 z-10 cursor-pointer"
      />

      {/* Cloudinary Stream / HTML5 Secure Tag */}
      {srcUrl && (
        <video
          ref={videoRef}
          src={srcUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onWaiting={() => setIsLoading(true)}
          onPlaying={() => setIsLoading(false)}
          onContextMenu={(e) => e.preventDefault()}
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
          className="w-full h-full object-contain pointer-events-none"
        />
      )}

      {/* 4. Loader Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
          <RiLoader4Line className="text-4xl text-cyan-400 animate-spin" />
        </div>
      )}

      {/* 5. Custom Premium Controls Overlay */}
      <div
        className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4 flex flex-col gap-3 z-20 transition-all duration-300 ${
          showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
        }`}
      >
        {/* Progress Bar */}
        <div className="flex items-center gap-3 w-full">
          <span className="text-[10px] text-zinc-400 font-medium select-none">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1.5 rounded-full bg-zinc-700 appearance-none cursor-pointer accent-cyan-400 hover:h-2 transition-all"
            style={{
              background: `linear-gradient(to right, #22d3ee 0%, #22d3ee ${(currentTime / (duration || 1)) * 100}%, #3f3f46 ${(currentTime / (duration || 1)) * 100}%, #3f3f46 100%)`
            }}
          />
          <span className="text-[10px] text-zinc-400 font-medium select-none">
            {formatTime(duration)}
          </span>
        </div>

        {/* Buttons & Watermark */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-cyan-400 transition-colors p-1"
            >
              {isPlaying ? <RiPauseFill className="text-xl" /> : <RiPlayFill className="text-xl" />}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={toggleMute}
                className="text-white hover:text-cyan-400 transition-colors p-1"
              >
                {isMuted ? <RiVolumeMuteFill className="text-lg" /> : <RiVolumeUpFill className="text-lg" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 group-hover/volume:w-16 h-1 rounded-full bg-zinc-700 appearance-none cursor-pointer accent-cyan-400 transition-all duration-300"
              />
            </div>

            {/* Video Title */}
            {title && (
              <span className="hidden sm:inline text-xs font-semibold text-zinc-300 truncate max-w-xs">
                {title}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Watermark Logo */}
            <span className="text-[10px] tracking-widest text-zinc-500 font-bold select-none hover:text-cyan-400 transition-colors">
              VTCLBD SECURE STREAM
            </span>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-cyan-400 transition-colors p-1"
            >
              {isFullscreen ? <RiFullscreenExitFill className="text-lg" /> : <RiFullscreenFill className="text-lg" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
