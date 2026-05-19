import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Header } from '../components/header'
import { uploadReel } from '../api/reels'
import api from '../api/axios'

interface ProductOption {
  id: number
  name: string
  price: number
  imageUrl: string
}

export default function UploadReelPage() {
  const navigate = useNavigate()
  const [video, setVideo] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [searchResults, setSearchResults] = useState<ProductOption[]>([])
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null)
  const [uploading, setUploading] = useState(false)
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file')
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video must be under 50MB')
      return
    }

    setVideo(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleProductSearch = (value: string) => {
    setProductSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    // Check if it's a product link
    const match = value.match(/\/product\/(\d+)/)
    if (match) {
      const id = match[1]
      setSearching(true)
      api.get(`/products/${id}`).then(res => {
        const item = res.data
        setSelectedProduct({
          id: item.id,
          name: item.name,
          price: item.price,
          imageUrl: item.imageURL || item.imageUrl || ''
        })
        setProductSearch('')
        setSearchResults([])
      }).catch(() => {
        toast.error('Could not find product from link')
      }).finally(() => {
        setSearching(false)
      })
      return
    }

    if (value.length < 2) {
      setSearchResults([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await api.get(`/products/search?q=${encodeURIComponent(value)}`)
        setSearchResults(res.data.slice(0, 5).map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          imageUrl: item.imageURL || item.imageUrl || ''
        })))
      } catch {
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 400)
  }

  const handleSubmit = async () => {
    if (!video || !selectedProduct) {
      toast.error('Please select a video and a product')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('video', video)
      formData.append('caption', caption)
      formData.append('productId', String(selectedProduct.id))

      await uploadReel(formData)
      toast.success('Reel uploaded!')
      navigate('/reels')
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900">Upload a Reel</h1>
        <p className="mt-1 text-sm text-gray-500">Promote a product with a short video</p>

        <div className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Video *</label>
            {preview ? (
              <div className="relative mt-2">
                <video src={preview} className="max-h-96 w-full rounded-lg bg-black" controls />
                <button
                  onClick={() => { setVideo(null); setPreview(null) }}
                  className="mt-2 text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="mt-2 flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-10 hover:border-indigo-500">
                <svg viewBox="0 0 24 24" className="h-10 w-10 text-gray-400 fill-current">
                  <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">Click to select a video</p>
                <p className="text-xs text-gray-400">MP4, MOV, WebM — max 50MB</p>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Caption</label>
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              maxLength={255}
              rows={3}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="Tell people about this product..."
            />
            <p className="mt-1 text-right text-xs text-gray-400">{caption.length}/255</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Link to Product *</label>
            {selectedProduct ? (
              <div className="mt-2 flex items-center gap-3 rounded-lg border border-gray-300 bg-white p-3">
                <img
                  src={selectedProduct.imageUrl || ''}
                  alt={selectedProduct.name}
                  className="h-12 w-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{selectedProduct.name}</p>
                  <p className="text-sm text-gray-500">${selectedProduct.price}</p>
                </div>
                <button
                  onClick={() => { setSelectedProduct(null); setProductSearch('') }}
                  className="text-sm text-red-600 hover:underline"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="relative mt-2">
                <input
                  type="text"
                  value={productSearch}
                  onChange={e => handleProductSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Search products..."
                />
                {searching && (
                  <p className="mt-1 text-xs text-gray-400">Searching...</p>
                )}
                {searchResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
                    {searchResults.map(p => (
                      <button
                        key={p.id}
                        onClick={() => { setSelectedProduct(p); setSearchResults([]); setProductSearch('') }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
                      >
                        <img
                          src={p.imageUrl || ''}
                          alt={p.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-500">${p.price}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={uploading || !video || !selectedProduct}
            className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload Reel'}
          </button>
        </div>
      </main>
    </div>
  )
}
