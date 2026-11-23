"use client"

import Link from "next/link"
import { FC } from "react"
// import { ChatbotUISVG } from "../icons/chatbotui-svg"

interface BrandProps {
  theme?: "dark" | "light"
}

export const Brand: FC<BrandProps> = ({ theme = "dark" }) => {
  return (
    <Link
      className="flex cursor-pointer flex-col items-center hover:opacity-50"
      href="https://maxxpotential.com"
      target="_blank"
      rel="noopener noreferrer"
    >
      {/* <div className="mb-2">
        // <ChatbotUISVG theme={theme === "dark" ? "dark" : "light"} scale={0.3} />
      </div> */}
      <div className="mb-2"> 
      {theme === "dark" ? 
          <img src="/LIGHT_BRAND_LOGO.png" alt="MAXX Potential Logo" style={{ height: '200px', width: 'auto' }} /> :
          <img src="/DARK_BRAND_LOGO.png" alt="MAXX Potential Logo" style={{ height: '200px', width: 'auto' }} />
        }
      </div>

      <div className="text-4xl font-bold tracking-wide">GPT</div>
    </Link>
  )
}
