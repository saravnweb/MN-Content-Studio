'use client'

import React from 'react'
import { useEffect } from 'react'

export function AxeCore() {
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      const runAxe = async () => {
        try {
          // @ts-ignore
          const axeModule = (await import('@axe-core/react'))
          const axe = axeModule.default || (typeof axeModule === 'function' ? axeModule : null)
          
          const ReactDOM = (await import('react-dom'))
          
          if (axe) {
            console.log('♿ Axe-core/react: initialized accessibility auditing')
            // Delay a bit to ensure the page is stable
            setTimeout(() => {
              axe(React, ReactDOM, 1000)
            }, 1000)
          }
        } catch (err) {
          console.warn('♿ Axe-core/react: failed to load', err)
        }
      }
      runAxe()
    }
  }, [])

  return null
}
