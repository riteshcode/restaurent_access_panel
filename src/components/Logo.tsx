// src/components/Logo.tsx
import { ChefHat } from 'lucide-react'

export function Logo({
  size = 32,
  textSize = 22,
  iconColor = '#a6e800',
  accentColor = '#c8f55a',
  textColor = '#e8e6df',
  gap = 2,
}: {
  size?: number
  textSize?: number
  iconColor?: string
  accentColor?: string
  textColor?: string
  gap?: number
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap }}>
      <span style={{
        fontFamily: '"DM Serif Display", Georgia, serif',
        fontSize: textSize,
        fontWeight: 400,
        color: textColor,
      }}>
        <span style={{ color: accentColor, fontStyle: 'italic' }}>Rasoi</span>
      </span>

      <ChefHat size={size} color={iconColor} strokeWidth={2} style={{ flexShrink: 0 }} />

      <span style={{
        fontFamily: '"DM Serif Display", Georgia, serif',
        fontSize: textSize,
        fontWeight: 400,
        color: textColor,
      }}>
        Menu
      </span>
    </div>
  )
}