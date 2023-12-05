import Image from 'next/image'
import { createView } from '@/app/lib/action'

export default function Home() {
  
  const q3 = async () => {
    const result = await createView()
    console.log(result)
    
  }
  q3()
  return (
    <>
    q3  update
    </>
  )
}