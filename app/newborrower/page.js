import Image from 'next/image'
import { addNewMember } from '@/app/lib/action'

export default function Home() {
  
  const memberresult = async () => {
    const result = await addNewMember()
    console.log(result)
    
  }
  memberresult()
  return (
    <>
    bye bitch
    </>
  )
}