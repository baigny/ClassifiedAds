interface ErrorMessageProps {
  message?: string
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 p-4 bg-danger/10 border border-danger/20 rounded-md text-sm text-danger mb-4"
    >
      <span aria-hidden="true" className="text-lg shrink-0">⚠️</span>
      <div>
        <p className="font-semibold">Something went wrong</p>
        {message && <p className="mt-0.5 text-danger/80">{message}</p>}
      </div>
    </div>
  )
}
