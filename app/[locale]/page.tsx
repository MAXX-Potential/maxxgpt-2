"use client"

// import { ChatbotUISVG } from "@/components/icons/chatbotui-svg"
import { IconArrowRight } from "@tabler/icons-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import Head from "next/head"

export default function HomePage() {
  const { theme } = useTheme()
  // return (
  //   <div className="flex h-screen w-screen flex-col items-center justify-center">
  //     {/* <div>
  //       <ChatbotUISVG theme={theme === "dark" ? "dark" : "light"} scale={0.3} />
  //     </div> */}
  //     {/* <div className="mt-2 text-4xl font-bold">MAXX GPT</div> */}
  //     <div className="mt-2 text-4xl font-bold">GPT</div>
  //     <Link
  //       className="mt-4 flex w-[200px] items-center justify-center rounded-md bg-blue-500 p-2 font-semibold"
  //       href="/chat"
  //     >
  //       Start Chatting
  //       <IconArrowRight className="ml-1" size={20} />
  //     </Link>
  //   </div>
  // )
  return (
    <Head><link rel="icon" href="/favicon.png" /></Head>
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <div className="mb-5"> 
      <img src="/LIGHT_BRAND_LOGO.png" alt="MAXX Potential Logo" style={{ height: '200px', width: 'auto' }} />  
      {/* {theme === "dark" ? 
          <img src="/DARK_BRAND_LOGO.png" alt="MAXX Potential Logo" style={{ height: '200px', width: 'auto' }} /> : 
          <img src="/LIGHT_BRAND_LOGO.png" alt="MAXX Potential Logo" style={{ height: '200px', width: 'auto' }} />  
           
        } */}
      </div>

      <div className="text-4xl font-bold">GPT</div>

      <Link
        className="mt-4 flex w-[200px] items-center justify-center rounded-md bg-blue-500 p-2 font-semibold"
        href="/chat"
      >
        Start Chatting
        <IconArrowRight className="ml-1" size={20} />
      </Link>
    </div>
  )
}
