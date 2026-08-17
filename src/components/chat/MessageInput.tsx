import { useState } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

export function MessageInput({ onSend, disabled }: { onSend: (v: string) => void; disabled: boolean }) {
  const [value, setValue] = useState('')

  function handleSubmit() {
    onSend(value)
    setValue('')
  }

  return (
    <div className="flex gap-2 p-4 border-t">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder="Type a message..."
        disabled={disabled}
      />
      <Button onClick={handleSubmit} disabled={disabled}>Send</Button>
    </div>
  )
}