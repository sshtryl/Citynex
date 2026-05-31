import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

export function usePasswordVisibility(initialState = false) {
  const [visible, setVisible] = useState(initialState)

  const toggle = () => setVisible(!visible)

  return {
    visible,
    toggle,
    type: visible ? "text" : "password",
    Icon: visible ? Eye : EyeOff,
  }
}