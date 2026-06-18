// ExampleDashboardStat.jsx
//
// Minimal example showing how to call an RPC function from React,
// passing in the hardcoded org id for now.

import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { HARDCODED_ORG_ID } from '../constants'

export default function ExampleDashboardStat() {
  const [totalRevenue, setTotalRevenue] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchRevenue() {
      const { data, error } = await supabase.rpc('get_total_revenue', {
        org_id: HARDCODED_ORG_ID
      })

      if (error) {
        console.log(error) // log the full error object, same as before
        setError(error.message)
        return
      }

      setTotalRevenue(data)
    }

    fetchRevenue()
  }, [])

  if (error) return <p>Error loading revenue: {error}</p>
  if (totalRevenue === null) return <p>Loading...</p>

  return <p>Total revenue: ${totalRevenue}</p>
}
