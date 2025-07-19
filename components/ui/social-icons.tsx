import React from 'react'
import Image from 'next/image'

interface SocialIconProps {
  className?: string
}

export function WhatsAppIcon({ className }: SocialIconProps) {
  return (
    <Image
      src="/icons/whatsapp.png"
      alt="WhatsApp"
      width={60}
      height={60}
      style={{ width: '60px', height: '60px' }}
    />
  )
}

export function TelegramIcon({ className }: SocialIconProps) {
  return (
    <Image
      src="/icons/telegram.png"
      alt="Telegram"
      width={60}
      height={60}
      style={{ width: '60px', height: '60px', marginLeft: '-5px' }}
    />
  )
}

export function InstagramIcon({ className }: SocialIconProps) {
  return (
    <Image
      src="/icons/instagram.png"
      alt="Instagram"
      width={55}
      height={55}
      style={{ width: '55px', height: '55px', marginLeft: '-5px', marginRight:'10px' }}
    />
  )
}

export function FacebookIcon({ className }: SocialIconProps) {
  return (
    <Image
      src="/icons/facebook.png"
      alt="Facebook"
      width={40}
      height={40}
      style={{ width: '40px', height: '40px' }}
    />
  )
} 