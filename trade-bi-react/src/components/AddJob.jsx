import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function AddJob() {
  const [formData, setFormData] = useState({
    job_type: '',
    customer: '',
    description: '',
    status: '',
    scheduled_date: '',
    completion_date: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
        .from('job')
        .insert([{
            job_tyoes_id: formData.job_type,
            customer_id: formData.customer,
            description: formData.description,
            status: formData.status,
            scheduled_date: formData.scheduled_date,
            completion_date: formData.completion_date
        }
    ])
    if(error){
        console.log(error);
    }
    /*
    const { data, error } = await supabase
      .from('your_table_name')
      .insert([
        {
          name: formData.name,
          email: formData.email,
          message: formData.message
        }
      ])
      .select()

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }*/

    setSuccess(true)
    //setFormData({ job_type: '', email: '', message: '' }) // reset form
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="job_type"
        value={formData.job_type}
        onChange={handleChange}
        placeholder="Job Type"
        
      />
      <input
        type="text"
        name="customer"
        value={formData.customer}
        onChange={handleChange}
        placeholder="Customer"
        
      />
      <textarea
        name="message"
        value={formData.description}
        onChange={handleChange}
        placeholder="Job Description"
        
      />
      <input
        name="status"
        value={formData.status}
        onChange={handleChange}
        placeholder='Job Status'
        
      />
      
      <input
        name="scheduled_date"
        value={formData.scheduled_date}
        onChange={handleChange}
        placeholder='Job Schedule Start Date'
      />
      <input
        name='completion_date'
        value={formData.completion_date}
        onChange={handleChange}
        placeholder='Job Completion Date'
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>Submitted successfully!</p>}
    </form>
  )
}
