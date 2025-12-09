import React, { useState, useEffect, useRef } from 'react';
import rough from 'roughjs/bundled/rough.esm';
import { Play, Pause, SkipBack, SkipForward, Square, Volume2 } from 'lucide-react';

const WhiteboardPlayer = ({classData}) => {
  console.log("classData in WhiteboardPlayer:", classData);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const rcRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [timeline, setTimeline] = useState([]);
 const imageCache = useRef(new Map());

  // Preload images
  useEffect(() => {
    if (!classData || !classData.slides) return;

    classData.slides.forEach((slide) => {
      slide.elements.forEach((element) => {
        if (element.type === "image" && element.src) {
          if (!imageCache.current.has(element.src)) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = element.src;
            imageCache.current.set(element.src, img);
          }
        }
      });
    });
  }, [classData]);
  useEffect(() => {
    const elementTimeline = [];
    classData.slides.forEach((slide, slideIdx) => {
      slide.elements.forEach((element) => {
        elementTimeline.push({
          ...element,
          slideIndex: slideIdx,
          slideTitle: slide.title
        });
      });
    });
    
    // Sort by startTime
    elementTimeline.sort((a, b) => a.startTime - b.startTime);
    setTimeline(elementTimeline);

    // Calculate max time
    const maxTime = elementTimeline.reduce((max, el) => {
      if (el.type === "PENCIL" && el.points.length > 0) {
        const lastPoint = el.points[el.points.length - 1];
        return Math.max(max, lastPoint.t || el.startTime);
      }
      return Math.max(max, el.startTime);
    }, 0);
    setDuration(maxTime);

    // Initialize rough canvas once
    if (canvasRef.current && !rcRef.current) {
      rcRef.current = rough.canvas(canvasRef.current);
    }

    // Initial render
    setTimeout(() => render(0, elementTimeline), 0);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setAudioLoaded(true);
      const audioDuration = audio.duration * 1000;
      if (audioDuration > duration) {
        setDuration(audioDuration);
      }
    };

    const handleTimeUpdate = () => {
      if (!isPlaying) return;
      const audioTime = audio.currentTime * 1000;
      setCurrentTime(audioTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isPlaying, duration]);

  // Optimized pencil drawing - batch all points together
  const drawPencilElement = (ctx, element, currentTime) => {
    const visiblePoints = [];
    
    // Collect all visible points
    for (let i = 0; i < element.points.length; i++) {
      const point = element.points[i];
      const pointTime = point.t !== undefined ? point.t : element.startTime;
      
      if (pointTime <= currentTime) {
        visiblePoints.push(point);
      } else {
        // Add interpolated point if between frames
        if (i > 0) {
          const prevPoint = element.points[i - 1];
          const prevTime = prevPoint.t !== undefined ? prevPoint.t : element.startTime;
          const progress = (currentTime - prevTime) / (pointTime - prevTime);
          visiblePoints.push({
            x: prevPoint.x + (point.x - prevPoint.x) * progress,
            y: prevPoint.y + (point.y - prevPoint.y) * progress
          });
        }
        break;
      }
    }

    // Draw all visible points in single path
    if (visiblePoints.length > 1) {
      ctx.strokeStyle = element.color;
      ctx.lineWidth = element.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(visiblePoints[0].x, visiblePoints[0].y);
      
      for (let i = 1; i < visiblePoints.length; i++) {
        ctx.lineTo(visiblePoints[i].x, visiblePoints[i].y);
      }
      ctx.stroke();
    }
  };

  const drawShapeElement = (rc, ctx, element) => {
    if (element.type === "RECTANGLE") {
      const w = element.x2 - element.x1;
      const h = element.y2 - element.y1;
      rc.rectangle(element.x1, element.y1, w, h, {
        stroke: element.color,
        strokeWidth: 2,
        roughness: 1
      });
    } else if (element.type === "TRIANGLE") {
      const w = element.x2 - element.x1;
      const h = element.y2 - element.y1;
      rc.polygon([
        [element.x1 + w/2, element.y1],
        [element.x2, element.y2],
        [element.x1, element.y2]
      ], {
        stroke: element.color,
        strokeWidth: 2,
        roughness: 1
      });
    } else if (element.type === "image" && element.src) {
      const img = imageCache.current.get(element.src);
      if (img && img.complete && img.naturalHeight !== 0) {
        const w = element.x2 - element.x1;
        const h = element.y2 - element.y1;
        try {
          ctx.drawImage(img, element.x1, element.y1, w, h);
        } catch (err) {
          console.error('Error drawing image:', err);
        }
      }
    }
  };

  const render = (time, timelineToUse = timeline) => {
    const canvas = canvasRef.current;
    if (!canvas || timelineToUse.length === 0) return;

    const ctx = canvas.getContext('2d');
    const rc = rcRef.current || rough.canvas(canvas);
    if (!rcRef.current) rcRef.current = rc;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Find current slide based on which elements should be visible
    let activeSlideIndex = 0;

    for (const element of timelineToUse) {
      if (element.startTime <= time) {
        activeSlideIndex = element.slideIndex;
      } else {
        break;
      }
    }

    setCurrentSlideIndex(activeSlideIndex);

    // Draw only elements from current slide that have started
    for (const element of timelineToUse) {
      // Only draw elements from the active slide that have started
      if (element.slideIndex === activeSlideIndex && element.startTime <= time) {
        if (element.type === "PENCIL") {
          drawPencilElement(ctx, element, time);
        } else {
          drawShapeElement(rc, element);
        }
      }
    }
  };

  // Use requestAnimationFrame for smoother rendering
  useEffect(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      render(currentTime);
    });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentTime, timeline]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play();
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    render(0);
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime / 1000;
    }
  };

  const handlePrevSlide = () => {
    // Find first element of previous slide
    const prevSlideElements = timeline.filter(el => el.slideIndex < currentSlideIndex);
    if (prevSlideElements.length > 0) {
      const lastPrevSlideEl = prevSlideElements[prevSlideElements.length - 1];
      const targetSlideIndex = lastPrevSlideEl.slideIndex;
      const firstElementOfSlide = timeline.find(el => el.slideIndex === targetSlideIndex);
      
      if (firstElementOfSlide) {
        const slideTime = firstElementOfSlide.startTime;
        setCurrentTime(slideTime);
        if (audioRef.current) {
          audioRef.current.currentTime = slideTime / 1000;
        }
      }
    }
  };

  const handleNextSlide = () => {
    // Find first element of next slide
    const nextSlideEl = timeline.find(el => el.slideIndex > currentSlideIndex);
    if (nextSlideEl) {
      const slideTime = nextSlideEl.startTime;
      setCurrentTime(slideTime);
      if (audioRef.current) {
        audioRef.current.currentTime = slideTime / 1000;
      }
    }
  };

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentSlide = classData.slides[currentSlideIndex];
  const hasNextSlide = timeline.some(el => el.slideIndex > currentSlideIndex);
  const hasPrevSlide = currentSlideIndex > 0;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #f8fafc, #dbeafe, #e0e7ff)',
      padding: '24px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(8px)',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        padding: '32px',
        width: '100%',
        maxWidth: '1152px',
        border: '1px solid #f3f4f6'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '30px',
            fontWeight: 'bold',
            background: 'linear-gradient(to right, #2563eb, #4f46e5)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0
          }}>
            Whiteboard Replay
          </h2>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'linear-gradient(to right, #d1fae5, #ccfbf1)',
            borderRadius: '9999px',
            border: '1px solid #a7f3d0'
          }}>
            <Volume2 size={18} style={{ color: audioLoaded ? '#059669' : '#9ca3af' }} />
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: audioLoaded ? '#047857' : '#6b7280'
            }}>
              {audioLoaded ? 'Audio Ready' : 'Loading Audio...'}
            </span>
          </div>
        </div>
        
        {/* Slide Info */}
        <div style={{
          marginBottom: '24px',
          background: 'linear-gradient(to right, #eff6ff, #eef2ff)',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #dbeafe'
        }}>
          <p style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            margin: 0
          }}>
            Slide {currentSlideIndex + 1} of {classData.slides.length}: <span style={{ color: '#2563eb' }}>{currentSlide?.title}</span>
          </p>
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            marginTop: '6px',
            marginBottom: 0
          }}>
            Timeline: {timeline.length} elements sorted by time
          </p>
        </div>

        {/* Canvas */}
        <div style={{
          marginBottom: '24px',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          border: '2px solid #e5e7eb'
        }}>
          <canvas
            ref={canvasRef}
            width={1200}
            height={600}
            style={{
              width: '100%',
              maxWidth: '100%',
              height: 'auto',
              background: '#ffffff',
              display: 'block',
              objectFit: "contain"
            }}
          />
        </div>

        <audio ref={audioRef} src={classData.audioUrl} preload="auto" />

        {/* Progress Bar */}
        <div style={{ marginBottom: '24px' }}>
          <div 
            style={{
              width: '100%',
              background: '#e5e7eb',
              height: '12px',
              borderRadius: '9999px',
              cursor: 'pointer',
              overflow: 'hidden',
              boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
            }}
            onClick={handleSeek}
          >
            <div
              style={{
                background: 'linear-gradient(to right, #3b82f6, #6366f1)',
                height: '12px',
                borderRadius: '9999px',
                transition: 'all 0.2s',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                width: `${(currentTime / duration) * 100}%`
              }}
            />
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '8px'
          }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '500',
              color: '#4b5563',
              padding: '4px 8px',
              background: '#f3f4f6',
              borderRadius: '6px'
            }}>{formatTime(currentTime)}</span>
            
          </div>
        </div>

        {/* Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
          <button
            onClick={handlePrevSlide}
            disabled={!hasPrevSlide}
            style={{
              padding: '12px',
              borderRadius: '12px',
              background: 'linear-gradient(to bottom right, #f3f4f6, #e5e7eb)',
              border: 'none',
              cursor: hasPrevSlide ? 'pointer' : 'not-allowed',
              opacity: hasPrevSlide ? 1 : 0.4,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Previous Slide"
            onMouseEnter={(e) => {
              if (hasPrevSlide) {
                e.currentTarget.style.background = 'linear-gradient(to bottom right, #e5e7eb, #d1d5db)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to bottom right, #f3f4f6, #e5e7eb)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
            onMouseDown={(e) => {
              if (hasPrevSlide) e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <SkipBack size={22} style={{ color: '#374151' }} />
          </button>

          <button
            onClick={handlePlayPause}
            style={{
              padding: '16px',
              borderRadius: '9999px',
              background: 'linear-gradient(to bottom right, #3b82f6, #4f46e5)',
              border: 'none',
              cursor: 'pointer',
              color: '#ffffff',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={isPlaying ? "Pause" : "Play"}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to bottom right, #2563eb, #4338ca)';
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to bottom right, #3b82f6, #4f46e5)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {isPlaying ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: '2px' }} />}
          </button>

          <button
            onClick={handleStop}
            style={{
              padding: '12px',
              borderRadius: '12px',
              background: 'linear-gradient(to bottom right, #f3f4f6, #e5e7eb)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Stop"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to bottom right, #e5e7eb, #d1d5db)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to bottom right, #f3f4f6, #e5e7eb)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Square size={22} style={{ color: '#374151' }} />
          </button>

          <button
            onClick={handleNextSlide}
            disabled={!hasNextSlide}
            style={{
              padding: '12px',
              borderRadius: '12px',
              background: 'linear-gradient(to bottom right, #f3f4f6, #e5e7eb)',
              border: 'none',
              cursor: hasNextSlide ? 'pointer' : 'not-allowed',
              opacity: hasNextSlide ? 1 : 0.4,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Next Slide"
            onMouseEnter={(e) => {
              if (hasNextSlide) {
                e.currentTarget.style.background = 'linear-gradient(to bottom right, #e5e7eb, #d1d5db)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to bottom right, #f3f4f6, #e5e7eb)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
            onMouseDown={(e) => {
              if (hasNextSlide) e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <SkipForward size={22} style={{ color: '#374151' }} />
          </button>
        </div>
      </div>
    </div>
  );

};

export default WhiteboardPlayer;