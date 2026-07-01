import { createClient } from "@/lib/supabase/server"
import { requireProfile } from "@/lib/supabase/user"
import { notFound } from "next/navigation"
import Link from "next/link"
import { BatchForm } from "../batch-form"
import { ArrowLeft } from "lucide-react"

export default async function EditBatchPage(props: { params: Promise<{ id: string; batchId: string }> }) {
  const { profile } = await requireProfile()
  if (profile.role !== "admin") return <div>Not authorized</div>

  const { id: courseId, batchId } = await props.params
  const supabase = await createClient()

  const { data: course } = await supabase.from("courses").select("name").eq("id", courseId).single()
  if (!course) notFound()

  const { data: batch } = await supabase.from("batches").select("*").eq("id", batchId).single()
  if (!batch) notFound()

  const { data: instructors } = await supabase.from("profiles").select("id, full_name").eq("role", "instructor").order("full_name")

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/courses/${courseId}/batches/${batchId}`} className="inline-flex items-center gap-1.5 text-body-medium text-on-surface-variant hover:text-primary transition-colors mb-2">
          <ArrowLeft className="h-4 w-4" />
          Back to {batch.name}
        </Link>
        <h1 className="text-headline-large text-on-surface">Edit Batch</h1>
      </div>
      <div className="rounded-2xl bg-surface-container-lowest p-6 elevation-1">
        <BatchForm batch={batch} instructors={instructors ?? []} cancelHref={`/courses/${courseId}/batches/${batchId}`} />
      </div>
    </div>
  )
}
