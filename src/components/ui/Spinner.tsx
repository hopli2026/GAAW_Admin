interface Props {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-7 h-7 border-2',
  lg: 'w-10 h-10 border-[3px]',
}

export default function Spinner({ size = 'md', className = '' }: Props) {
  return (
    <div
      className={`rounded-full border-gray-200 border-t-[#0D1B2A] animate-spin ${sizes[size]} ${className}`}
    />
  )
}

export function TableLoader({ cols }: { cols: number }) {
  return (
    <tr>
      <td colSpan={cols} className="py-16">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="md" />
          <p className="text-xs text-gray-400">Chargement...</p>
        </div>
      </td>
    </tr>
  )
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Spinner size="lg" />
      <p className="text-sm text-gray-400">Chargement...</p>
    </div>
  )
}
