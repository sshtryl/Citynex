import { ProtectedRoute } from "@/components/protectedRoute"
import  LaporAIpage  from "@/components/Lapor-Content"

export default function Home() {
  return (
    <ProtectedRoute>
      <LaporAIpage />
    </ProtectedRoute>
  )
}