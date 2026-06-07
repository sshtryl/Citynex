import { ProtectedRoute } from "@/components/protectedRoute"
import  LaporAIpage  from "@/components/lapor-content"

export default function Home() {
  return (
    <ProtectedRoute>
      <LaporAIpage />
    </ProtectedRoute>
  )
}