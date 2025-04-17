import React, { ReactNode } from 'react'
import { Mona_Sans } from 'next/font/google'

const RootLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div >
            {children}
        </div>
    )
}


export default RootLayout