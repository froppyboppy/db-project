import Image from 'next/image'
import { connectDb } from './lib/db'

export default function Home() {
  const getBooks = async () => {
    const db = await connectDb()
    const result = await db.all(`SELECT * FROM book`)
    console.log(result)
  }
  getBooks()
  return (
    <>
    hi
    </>
  )
}
