
import { bookCheckout } from '@/app/lib/action'
import AddBookForm from './form'

export default async function Home() {
  
  const bookCheckoutr = async () => {
    const result = await bookCheckout()
    console.log(result)
    return result
  }
  let rows = await bookCheckoutr()
  return (
    <>
    bye2
    {rows.map((row) => {
      return (<>
      <div>bookId: {row['bookID']}</div>
      <div>branchId: {row['branchId']}</div>
      <div>copies: {row['noOfCopies']}</div>
      </>)
    })}
    </>
  )
}

/**
 * 'use client'
import Image from 'next/image'

import { useState } from 'react'

export default function Home() {
    //User checks out a book, add it to Book_Loan, the number of copies needs to be updated via trigger in
    //the Book_Copies table. Show the output of the updated Book_Copies. [10 points]
    //book id, library branch id, card no, date out, due date
  const [bookId, setBookId] = useState(2)
  const [branchId, setBranchId] = useState(1)
  const [cardNo, setCardNo] = useState(123456)
  const [dateOut, setDateOut] = useState('2021-10-10')
  const [dueDate, setDueDate] = useState('2021-10-17')

    
  const bookCheckoutResult = async () => {
    const result = await bookCheckout(bookId, branchId, cardNo, dateOut, dueDate)
    //const result = await bookCheckout(69420, 1, cardNo, dateOut, dueDate)
    console.log(result)
    
  }
  bookCheckoutResult()
  return (
    <>
    kys
    </>
  )
}
 */