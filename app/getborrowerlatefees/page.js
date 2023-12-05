import Image from 'next/image'
import { listBorrowerLateFees } from '@/app/lib/action'

export default function Home() {
  
  const latefeesresult = async () => {
    const result = await listBorrowerLateFees()
    console.log(result)
    
  }
  latefeesresult()
  return (
    <>
    Get borrower Late fees result
    </>
  )
}