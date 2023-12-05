import Image from 'next/image'
import { addNewBook } from '@/app/lib/action'

export default function Home() {
  
  const bookresult = async () => {
    const result = await addNewBook()
    console.log(result)
    
  }
  bookresult()
  return (
    <>
    bye
    </>
  )
}