import React, { useState, useEffect } from 'react';
import { Mic } from 'lucide-react';
import { cn } from '../../lib/utils';

const AIVoiceInput = ({
  onStart,
  onStop,
  visualizerBars = 48,
  demoMode = false,
  demoInterval = 3000,
  className,
  isListening,
  onToggle,
  disabled = false
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [time, setTime] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isDemo, setIsDemo] = useState(demoMode);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Sync with external listening state
  useEffect(() => {
    setSubmitted(isListening);
  }, [isListening]);

  useEffect(() => {
    let intervalId;

    if (submitted) {
      onStart?.();
      intervalId = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
    } else {
      onStop?.(time);
      setTime(0);
    }

    return () => clearInterval(intervalId);
  }, [submitted, time, onStart, onStop]);

  useEffect(() => {
    if (!isDemo) return;

    let timeoutId;
    const runAnimation = () => {
      setSubmitted(true);
      timeoutId = setTimeout(() => {
        setSubmitted(false);
        timeoutId = setTimeout(runAnimation, 1000);
      }, demoInterval);
    };

    const initialTimeout = setTimeout(runAnimation, 100);
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(initialTimeout);
    };
  }, [isDemo, demoInterval]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClick = () => {
    if (disabled) return;
    
    if (isDemo) {
      setIsDemo(false);
      setSubmitted(false);
    } else {
      onToggle?.();
    }
  };

  return (
    <div className={cn("w-full py-2", className)}>
      <div className="relative max-w-xl w-full mx-auto flex items-center flex-col gap-2">
        <button
          className={cn(
            "group w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200",
            submitted
              ? "bg-destructive text-destructive-foreground shadow-md"
              : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          type="button"
          onClick={handleClick}
          disabled={disabled}
          aria-label={submitted ? "Stop recording" : "Start voice input"}
          title={submitted ? "Stop recording" : "Start voice input"}
        >
          {submitted ? (
            <div
              className="w-5 h-5 rounded-sm animate-spin bg-current"
              style={{ animationDuration: "3s" }}
            />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>

        <span
          className={cn(
            "font-mono text-xs transition-opacity duration-300 font-light",
            submitted
              ? "text-foreground"
              : "text-muted-foreground"
          )}
        >
          {formatTime(time)}
        </span>

        <div className="h-4 w-48 flex items-center justify-center gap-0.5">
          {[...Array(visualizerBars)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-0.5 rounded-full transition-all duration-300",
                submitted
                  ? "bg-foreground/50 animate-pulse"
                  : "bg-muted-foreground/30 h-1"
              )}
              style={
                submitted && isClient
                  ? {
                      height: `${20 + Math.random() * 80}%`,
                      animationDelay: `${i * 0.05}s`,
                    }
                  : undefined
              }
            />
          ))}
        </div>

        <p className="h-4 text-xs text-muted-foreground font-light">
          {submitted ? "Listening..." : "Click to speak"}
        </p>
      </div>
    </div>
  );
};

export default AIVoiceInput; 