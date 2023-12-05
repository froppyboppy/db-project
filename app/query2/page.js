import Image from 'next/image'
import { modifyLibraryBranch } from '@/app/lib/action'

export default function Home() {
  
  const q2 = async () => {
    const result = await modifyLibraryBranch()
    console.log(result)
    
  }
  q2()
  return (
    <>
    q2  update
    </>
  )
}