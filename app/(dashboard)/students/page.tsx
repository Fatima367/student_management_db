import { createClient } from "@/lib/supabase/server"
import { requireProfile } from "@/lib/supabase/user"
import Link from "next/link"
import { StudentFilters } from "./student-filters"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Plus, Search } from "lucide-react"

const ITEMS_PER_PAGE = 10

export default async function StudentsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { profile } = await requireProfile()
  const searchParams = await props.searchParams

  const page = Number(searchParams.page) || 1
  const search = (searchParams.search as string) || ""
  const statusFilter = (searchParams.status as string) || ""

  const supabase = await createClient()

  let query = supabase
    .from("students")
    .select("id, full_name, status, contact_email, contact_phone, enrollment_date", { count: "exact" })

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,contact_email.ilike.%${search}%,contact_phone.ilike.%${search}%`)
  }
  if (statusFilter) {
    query = query.eq("status", statusFilter)
  }

  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  const { data: students, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to)

  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-large text-on-surface">Students</h1>
          <p className="mt-1 text-body-large text-on-surface-variant">Manage student records</p>
        </div>
        {(profile.role === "admin" || profile.role === "instructor") && (
          <Link
            href="/students/new"
            className="md3-button bg-primary text-primary-foreground h-10 px-4 text-label-large hover:shadow-2 inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Student
          </Link>
        )}
      </div>

      {/* Filters */}
      <StudentFilters search={search} status={statusFilter} />

      {/* Table */}
      <Card variant="outlined" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-body-medium">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-high">
                <th className="px-4 py-3.5 text-left text-label-medium text-on-surface-variant font-medium uppercase tracking-wider">Name</th>
                <th className="px-4 py-3.5 text-left text-label-medium text-on-surface-variant font-medium uppercase tracking-wider">Status</th>
                <th className="px-4 py-3.5 text-left text-label-medium text-on-surface-variant font-medium uppercase tracking-wider hidden sm:table-cell">Email</th>
                <th className="px-4 py-3.5 text-left text-label-medium text-on-surface-variant font-medium uppercase tracking-wider hidden md:table-cell">Phone</th>
                <th className="px-4 py-3.5 text-left text-label-medium text-on-surface-variant font-medium uppercase tracking-wider hidden lg:table-cell">Enrolled</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {students?.map((s) => (
                <tr key={s.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-4 py-3.5">
                    <Link href={`/students/${s.id}`} className="font-medium text-on-surface hover:text-primary transition-colors">
                      {s.full_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge
                      variant={
                        s.status === "active" ? "success" :
                        s.status === "graduated" ? "filled" : "neutral"
                      }
                    >
                      {s.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-on-surface-variant hidden sm:table-cell">{s.contact_email || "—"}</td>
                  <td className="px-4 py-3.5 text-on-surface-variant hidden md:table-cell">{s.contact_phone || "—"}</td>
                  <td className="px-4 py-3.5 text-on-surface-variant hidden lg:table-cell">{s.enrollment_date}</td>
                  <td className="px-4 py-3.5 text-right">
                    <Link
                      href={`/students/${s.id}`}
                      className="text-label-large text-primary hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {(!students || students.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center">
                        <Search className="h-6 w-6 text-on-surface-variant" />
                      </div>
                      <div>
                        <p className="text-title-medium text-on-surface">
                          {search || statusFilter ? "No students match your filters" : "No students yet"}
                        </p>
                        <p className="text-body-medium text-on-surface-variant mt-1">
                          {search || statusFilter ? "Try adjusting your search criteria." : "Add your first student to get started."}
                        </p>
                      </div>
                      {!search && !statusFilter && (
                        <Link
                          href="/students/new"
                          className="md3-button bg-primary text-primary-foreground h-10 px-4 text-label-large mt-2"
                        >
                          Add Student
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/students?page=${p}${search ? `&search=${search}` : ""}${statusFilter ? `&status=${statusFilter}` : ""}`}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-label-large transition-all duration-200 ${
                p === page
                  ? "bg-primary text-primary-foreground elevation-1"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
