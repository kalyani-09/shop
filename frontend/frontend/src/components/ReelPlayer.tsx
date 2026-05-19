import { useRef, useEffect, useState } from 'react'
import type { ReelResponse } from '../api/reels'

interface Props {
  reel: ReelResponse
  isVisible: boolean
}

export default function ReelPlayer({ reel, isVisible }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (isVisible) {
      video.play().catch(() => {})
    } else {
      video.pause()
      video.currentTime = 0
    }
  }, [isVisible])


  return (
    <div className="relative h-full w-full bg-black flex items-center justify-center overflow-hidden">
      {/* Video Layer */}
      <video
        ref={videoRef}
        src={`http://localhost:8080${reel.videoUrl}`}
        className="h-full w-full object-cover sm:object-contain cursor-pointer"
        loop
        muted={muted}
        playsInline
        onClick={() => setMuted(v => !v)}
      />

      {/* Mute Indicator */}

      {/* Mute Indicator */}
      <div className="absolute top-2 right-6 flex items-center gap-2">
        {muted && (
           <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white/60 uppercase tracking-widest font-bold border border-white/5 animate-pulse">
             Muted
           </div>
        )}
        <button
          onClick={() => setMuted(v => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-all border border-white/10"
        >
          {muted ? (
            <i className="fa-solid fa-volume-xmark text-sm"></i>
          ) : (
            <i className="fa-solid fa-volume-high text-sm"></i>
          )}
        </button>
      </div>
    </div>
  )
}
