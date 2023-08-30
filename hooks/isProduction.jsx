import React from 'react'

const isProduction = () => {
  return (
    process.env.NEXT_PUBLIC_IS_PRODUCTION === 'false'
  )
}

export default isProduction