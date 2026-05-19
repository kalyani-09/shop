import { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Header } from '../components/header'
import ReelPlayer from '../components/ReelPlayer'
import { getReels, toggleLike, deleteReel } from '../api/reels'
import type { ReelResponse } from '../api/reels'
import { useAuth } from '../context/AuthContext'

export default function ReelsPage() {
  const [reels, setReels] = useState<ReelResponse[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [likingId, setLikingId] = useState<number | null>(null)
  const { isAuthenticated, user } = useAuth()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const fetchReels = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const res = await getReels(page, 5)
      const data = res.data
      if (data.length < 5) setHasMore(false)
      setReels(prev => {
        const unique = data.filter(d => !prev.find(p => p.id === d.id))
        return [...prev, ...unique]
      })
      setPage(p => p + 1)
    } catch (err) {
      console.error('Failed to fetch reels:', err)
    } finally {
      setLoading(false)
    }
  }, [page, loading, hasMore])

  useEffect(() => {
    fetchReels()
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'))
            setActiveIndex(index)
            if (index >= reels.length - 2) {
              fetchReels()
            }
          }
        })
      },
      { 
        threshold: 0.6,
        root: container
      }
    )

    const items = container.querySelectorAll('[data-index]')
    items.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [reels, fetchReels])

  const handleUpdate = useCallback((index: number, updated: ReelResponse) => {
    setReels(prev => {
      const next = [...prev]
      next[index] = updated
      return next
    })
  }, [])

  const handleLike = async (reel: ReelResponse, index: number) => {
    if (!isAuthenticated || likingId === reel.id) return
    setLikingId(reel.id)
    try {
      const res = await toggleLike(reel.id)
      handleUpdate(index, { ...reel, likeCount: res.data.likeCount, likedByMe: res.data.liked })
    } catch (err) {
      console.error('Like failed:', err)
    } finally {
      setLikingId(null)
    }
  }

  const handleDelete = async (reel: ReelResponse) => {
    if (deletingId === reel.id) return
    if (!window.confirm('Delete this reel? This cannot be undone.')) return
    setDeletingId(reel.id)
    try {
      await deleteReel(reel.id)
      setReels(prev => prev.filter(r => r.id !== reel.id))
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Failed to delete reel. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const isOwner = (reel: ReelResponse) =>
    !!user && (reel.userId === user.name || reel.userId === user.email)

  return (
    <div className="h-screen w-full bg-white text-slate-900 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="z-[60] bg-white border-b border-gray-100">
        <Header variant="light" />
      </div>

      {/* Main Reels Feed */}
      <div 
        ref={containerRef} 
        className="flex-1 snap-y snap-mandatory overflow-y-scroll scrollbar-hide bg-slate-50/50"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {reels.map((reel, i) => (
          <div 
            key={reel.id} 
            data-index={i} 
            className="h-full w-full snap-start relative flex items-center justify-center py-4 sm:py-8"
          >
            {/* Left Side Icons/Info (Page Left) */}
            <div className="absolute left-4 sm:left-8 md:left-12 bottom-24 z-20  pointer-events-none hidden lg:block">
              <div className="flex flex-col gap-4 pointer-events-auto   backdrop-blur-xl p-6 rounded-[10px] ">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-[2px]">
                    <div className="h-full w-full rounded-full bg-white p-[2px]">
                      <div className="h-full w-full rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                        <i className="fa-solid fa-user text-black"></i>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 text-base">@{reel.userId}</span>
                    <span className="text-slate-500 text-xs">Original Audio</span>
                  </div>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                  {reel.caption}
                </p>

                {reel.product && (
                  <Link
                    to={`/product/${reel.product.id}`}
                    className="mt-2 flex items-center gap-3 rounded-2xl bg-indigo-600 p-2 pr-4 text-white shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-95 group"
                  >
                    <div className="h-10 w-10 rounded-xl overflow-hidden bg-white/20">
                      <img
                        src={
                          (() => {
                            const url = reel.product.imageUrl || reel.product.imageURL;
                            if (!url) return 'https://via.placeholder.com/100?text=No+Image';
                            if (url.startsWith('http')) return url;
                            return `http://localhost:8080${url.startsWith('/') ? '' : '/'}${url}`;
                          })()
                        }
                        alt={reel.product.name}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=Error';
                        }}
                      />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-bold text-xs truncate">{reel.product.name}</span>
                      <span className="font-medium text-[10px] text-white/80">${reel.product.price}</span>
                    </div>
                    <i className="fa-solid fa-cart-shopping text-xs"></i>
                  </Link>
                )}
              </div>
            </div>

            {/* Reel Container */}
            <div className="h-full max-h-[800px] w-full max-w-[450px] relative shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[32px] overflow-hidden border border-gray-100 bg-black">
              <ReelPlayer
                reel={reel}
                isVisible={i === activeIndex}
              />
              
              {/* Overlay for mobile (when page sides are hidden) */}
              <div className="lg:hidden absolute inset-x-0 bottom-0 p-6 pb-12 flex flex-col gap-3 pointer-events-none bg-gradient-to-t from-black/60 to-transparent">
                 <div className="flex items-center gap-3 pointer-events-auto">
                    <span className="font-semibold text-white text-sm">@{reel.userId}</span>
                 </div>
                 <p className="text-white text-xs line-clamp-2">{reel.caption}</p>
                 {reel.product && (
                   <Link to={`/product/${reel.product.id}`} className="pointer-events-auto bg-white/20 backdrop-blur-md rounded-lg p-2 text-white text-[10px] w-fit">
                     View Product
                   </Link>
                 )}
              </div>
            </div>

            {/* Right Side Icons (Page Right) */}
            <div className="absolute right-8 bottom-24 z-20 flex flex-col items-center gap-6">
              <div className="flex flex-col items-center gap-1 group">
                <button
                  onClick={() => handleLike(reel, i)}
                  disabled={likingId === reel.id || !isAuthenticated}
                  className={`flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all active:scale-90 ${
                    reel.likedByMe 
                      ? 'bg-red-50 text-red-500 shadow-red-100' 
                      : 'bg-white text-black hover:text-black/70 hover:shadow-slate-100'
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className={`h-7 w-7 ${reel.likedByMe ? 'fill-current' : 'fill-none stroke-current stroke-[2px]'}`}
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
                <span className="text-xs font-bold text-black">{reel.likeCount}</span>
              </div>

              <div className="flex flex-col items-center gap-1 group">
                <button className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-xl hover:text-black/70 transition-all">
                  <i className="fa-solid fa-comment text-xl"></i>
                </button>
                <span className="text-xs font-bold text-black">0</span>
              </div>

              <div className="flex flex-col items-center gap-1 group">
                <button className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-xl hover:text-black/70 transition-all">
                  <i className="fa-solid fa-share text-xl"></i>
                </button>
                <span className="text-xs font-bold text-black">Share</span>
              </div>

              <button className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-xl hover:text-black/70 transition-all">
                <i className="fa-solid fa-ellipsis text-xl"></i>
              </button>

              {/* Delete button — visible only to the reel owner */}
              {isOwner(reel) && (
                <div className="flex flex-col items-center gap-1 group">
                  <button
                    onClick={() => handleDelete(reel)}
                    disabled={deletingId === reel.id}
                    title="Delete reel"
                    className={`flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all active:scale-90 ${
                      deletingId === reel.id
                        ? 'bg-red-50 text-red-300 cursor-not-allowed'
                        : 'bg-white text-red-500 hover:bg-red-50 hover:shadow-red-100'
                    }`}
                  >
                    {deletingId === reel.id ? (
                      <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                      </svg>
                    )}
                  </button>
                  <span className="text-xs font-bold text-red-500">Delete</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex h-full w-full snap-start items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500" />
              <p className="text-slate-400 text-sm animate-pulse">Finding more reels...</p>
            </div>
          </div>
        )}

        {!hasMore && reels.length > 0 && (
          <div className="flex h-full w-full snap-start flex-col items-center justify-center text-center p-6 bg-white">
            <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-6">
              <i className="fa-solid fa-check text-indigo-600 text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold mb-2 text-slate-900">You're all caught up!</h3>
            <p className="text-slate-500 max-w-xs text-lg">You've seen all the latest reels from the community.</p>
          </div>
        )}

        {reels.length === 0 && !loading && (
          <div className="flex h-full w-full items-center justify-center">
             <div className="text-center">
               <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <i className="fa-solid fa-video-slash text-slate-400"></i>
               </div>
               <p className="text-slate-500 font-medium text-lg">No reels found yet.</p>
               <Link to="/reels/upload" className="text-indigo-600 text-sm font-semibold hover:underline mt-2 inline-block">
                 Start the trend →
               </Link>
             </div>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <Link
        to="/reels/upload"
        className="fixed bottom-8 right-8 z-50 group"
      >
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-2xl transition-all duration-300 group-hover:scale-110 group-active:scale-95">
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          </div>
        </div>
      </Link>
    </div>
  )
}
