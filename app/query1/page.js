import Image from 'next/image'
import { modifyBookLoan } from '@/app/lib/action'

export default function Home() {
  
  const q1 = async () => {
    const result = await modifyBookLoan()
    console.log(result)
    
  }
  q1()
  return (
    <>
    q1  update
    </>
  )
}