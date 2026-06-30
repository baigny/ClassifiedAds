import { useNavigate } from 'react-router-dom'
import { useState, useRef } from 'react'
import { listingsApi } from '../../api/listings'
import { uploadListingImages } from '../../api/storage'
import { getAllCategories } from '../../lib/categories'
import { ErrorMessage } from '../../components/ui/ErrorMessage'

// For demo: first seeded seller profile ID
const DEMO_USER_ID = 'a1b2c3d4-0001-0000-0000-000000000001'

export default function NewListingPage() {
  const navigate     = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const categories   = getAllCategories()

  const [title,     setTitle]     = useState('')
  const [body,      setBody]      = useState('')
  const [category,  setCategory]  = useState('')
  const [price,     setPrice]     = useState('')
  const [condition, setCondition] = useState('')
  const [files,     setFiles]     = useState<File[]>([])
  const [previews,  setPreviews]  = useState<string[]>([])
  const [uploadErr, setUploadErr] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [isError,   setIsError]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !body || !category || !price || !condition) return
    setIsPending(true)
    setIsError(false)
    setUploadErr(null)
    try {
      let images: string[] = []
      if (files.length > 0) {
        images = await uploadListingImages(files)
      }
      const data = await listingsApi.create({
        title,
        body,
        category,
        price:     parseInt(price, 10),
        condition: condition as any,
        images,
        user_id:   DEMO_USER_ID,
      })
      // Fire-and-forget: try to enrich the listing with Google Places data.
      // Runs in the background — never blocks navigation or shows errors to the user.
      void fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enrich-listing`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ listingId: data.id }),
      }).catch(() => undefined)
      navigate(`/listings/${data.id}`)
    } catch (err: any) {
      const msg: string = err?.message ?? ''
      if (msg.toLowerCase().includes('storage') || msg.toLowerCase().includes('upload')) {
        setUploadErr('Image upload failed. Please try again.')
      } else {
        setIsError(true)
      }
    } finally {
      setIsPending(false)
    }
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []).slice(0, 6)
    setFiles(selected)
    setPreviews(selected.map(f => URL.createObjectURL(f)))
  }

  function removeImage(i: number) {
    setFiles(files.filter((_, idx) => idx !== i))
    setPreviews(previews.filter((_, idx) => idx !== i))
  }

  return (
    <div className="page-enter max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl font-bold mb-2">Post a New Ad</h1>
      <p className="text-muted text-sm mb-8">Fill in the details below to list your item for sale.</p>

      <form onSubmit={handleSubmit} className="space-y-5 bg-surface border border-border rounded-md p-6">
        <Field label="Title" htmlFor="title">
          <input
            id="title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. iPhone 14 Pro, barely used"
            required
            className="input-field"
          />
        </Field>

        <Field label="Category" htmlFor="category">
          <select
            id="category"
            value={category}
            onChange={e => setCategory(e.target.value)}
            required
            className="input-field"
          >
            <option value="">Select a category…</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (₹)" htmlFor="price">
            <input
              id="price"
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="e.g. 5000"
              min={0}
              required
              className="input-field"
            />
          </Field>

          <Field label="Condition" htmlFor="condition">
            <select
              id="condition"
              value={condition}
              onChange={e => setCondition(e.target.value)}
              required
              className="input-field"
            >
              <option value="">Select…</option>
              {['New', 'Like New', 'Good', 'Fair', 'For Parts'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Description" htmlFor="body">
          <textarea
            id="body"
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Describe your item — condition, features, reason for selling…"
            rows={5}
            required
            className="input-field resize-none"
          />
        </Field>

        {/* Image upload */}
        <Field label="Photos (up to 6)" htmlFor="images">
          <div
            className="border-2 border-dashed border-border rounded-md p-4 text-center cursor-pointer hover:border-primary/50 transition"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              id="images"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFiles}
            />
            {previews.length === 0 ? (
              <p className="text-sm text-muted">Click to add photos (JPG, PNG, WEBP)</p>
            ) : (
              <div className="flex flex-wrap gap-2 justify-center">
                {previews.map((src, i) => (
                  <div key={i} className="relative">
                    <img src={src} alt={`preview ${i + 1}`} className="w-20 h-20 object-cover rounded-md border border-border" />
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); removeImage(i) }}
                      aria-label="Remove image"
                      className="absolute -top-1.5 -right-1.5 bg-background border border-border rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-surface-elevated"
                    >✕</button>
                  </div>
                ))}
                {previews.length < 6 && (
                  <div className="w-20 h-20 rounded-md border-2 border-dashed border-border flex items-center justify-center text-muted text-xl">+</div>
                )}
              </div>
            )}
          </div>
        </Field>

        {uploadErr && <ErrorMessage message={uploadErr} />}
        {isError && !uploadErr && <ErrorMessage message="Failed to post listing. Please try again." />}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 bg-primary text-primary-fg font-semibold rounded-md hover:opacity-90 transition disabled:opacity-50"
          >
            {isPending ? 'Posting…' : 'Post Listing'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/listings')}
            className="px-6 py-2.5 border border-border rounded-md text-sm font-medium hover:bg-surface-elevated transition"
          >
            Cancel
          </button>
        </div>
      </form>

      <style>{`
        .input-field {
          width: 100%;
          padding: 9px 12px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          background: var(--color-background);
          color: var(--color-foreground);
          font-size: 14px;
          font-family: var(--font-body);
          transition: border-color 0.15s;
        }
        .input-field:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(200,75,47,0.15);
        }
        select.input-field { cursor: pointer; }
      `}</style>
    </div>
  )
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">{label}</label>
      {children}
    </div>
  )
}
