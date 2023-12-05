import Image from 'next/image'
import { getBookCopies } from '@/app/lib/action'

export default function Home() {
  
  const bookListResult = async () => {
    const result = await getBookCopies()
    console.log(result)
    
  }
  bookListResult()
  return (
    <>
    Book List Result
    </>
  )
}