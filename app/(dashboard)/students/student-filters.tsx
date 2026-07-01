"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "@/hooks/use-debounced-callback"
import { Search } from "lucide-react"

export function StudentFilters({
  search,
  status,
}: {
  search: string
  status: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const onSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set("search", value)
    else params.delete("search")
    params.set("page", "1")
    router.push(`/students?${params.toString()}`)
  }, 300)

  const onStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set("status", value)
    else params.delete("status")
    params.set("page", "1")
    router.push(`/students?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
        <input
          defaultValue={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search by name, email, or phone..."
          className="w-full rounded-lg border border-outline bg-transparent pl-10 pr-4 py-2.5 text-body-medium text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary focus:border-2 transition-colors"
        />
      </div>
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="rounded-lg border border-outline bg-transparent px-4 py-2.5 text-body-medium text-on-surface outline-none focus:border-primary focus:border-2 transition-colors appearance-none cursor-pointer min-w-[140px]"
      >
        <option value="">All statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="graduated">Graduated</option>
      </select>
    </div>
  )
}
