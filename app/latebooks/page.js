import Image from 'next/image'
import {getLateBookLoans } from '@/app/lib/action'

export default function Home() {
  
  const latebookloansResult = async () => {
    const result = await getLateBookLoans()
    console.log(result)
    
  }
  latebookloansResult()
  return (
    <>
    Get late Book List Result
    </>
  )
}
