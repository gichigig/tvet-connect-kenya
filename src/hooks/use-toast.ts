import * as React from "react"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

const useToast = () => {
  const toast = React.useCallback((props: ToastProps) => {
    console.log('Toast:', props)
  }, [])

  return { toast }
}

export { useToast }