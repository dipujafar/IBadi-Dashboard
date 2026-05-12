"use client"
import React from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet";
import { FaBars } from 'react-icons/fa6'
import { navLinks } from '@/utils/navLinks'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import logo from '@/assets/logo.png'

export default function () {
    const [open, setOpen] = React.useState(false);
    const pathName = usePathname();

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger>  <FaBars size={24} color="#3A3C3B" /></SheetTrigger>
            <SheetContent className='h-screen overflow-y-auto'>
                <SheetHeader className='mt-5'>
                   <Image  src={logo} alt="logo" width={1200} height={1200} className=' max-w-[300px] w-auto h-auto mx-auto'/>
                </SheetHeader>
                <ul className='mt-5 space-y-5'>
                    {navLinks.map((link) => (
                        <Link href={`/${link.key}`} key={link.key} onClick={() => setOpen(false)} className={cn('flex gap-x-3 bg-gray-100 px-2 py-1 rounded-sm', pathName === `/${link.key}` && 'bg-main-color text-white')}>
                            <span> {link.icon}</span>
                            <h4 className='truncate'> {link.label}</h4>
                        </Link>
                    ))}
                </ul>

            </SheetContent>
        </Sheet>

    )
}
