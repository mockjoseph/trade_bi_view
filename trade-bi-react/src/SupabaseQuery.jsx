import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export default function SupabaseQuery() {
  const [data, setData] = useState([])

  useEffect(() => {
    async function fetchData() {
      const { data: tableData, error } = await supabase
        .from('jobs')
        .select('*')
      
   
      if (error) console.error('Error fetching data:', error)
      else setData(tableData)
    }

    fetchData()
  }, [])

  return (
    <div>
      <h2>Supabase Data:</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}