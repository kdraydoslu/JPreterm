'use client'

import { useEffect, useState } from 'react'

export function BackgroundVideo() {
  const [videoError, setVideoError] = useState(false)

  useEffect(() => {
    console.log('BackgroundVideo component mounted')
  }, [])

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {!videoError ? (
        <>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: 0.25,
              filter: 'blur(1px) brightness(0.6)',
            }}
            onError={(e) => {
              console.error('Video failed to load:', e)
              setVideoError(true)
            }}
            onLoadedData={() => {
              console.log('Video loaded successfully')
            }}
          >
            <source src="/background.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(2,8,16,0.65)] via-[rgba(2,8,16,0.55)] to-[rgba(2,8,16,0.75)]" />
        </>
      ) : (
        <div className="absolute inset-0 bg-[#020810]" />
      )}
    </div>
  )
}
