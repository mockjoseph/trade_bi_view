import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { HARDCODED_ORG_ID } from '../constants';

export default function AddJob() {
  const [formData, setFormData] = useState({
    job_type_id: '',
    customer_id: '',
    description: '',
    scheduled_date: '',
    completion_date: ''
  })
  const [jobTypes, setJobTypes] = useState([])
  const [customers, setCustomers] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchOptions = async () => {
      const [jobTypeRes, customerRes] = await Promise.all([
        supabase.rpc('form_job_type'),
        supabase.rpc('form_job_customer')
      ])

      if (jobTypeRes.error) {
        console.log(jobTypeRes.error)
        setError(jobTypeRes.error)
      } else {
        setJobTypes(jobTypeRes.data)
      }

      if (customerRes.error) {
        console.log(customerRes.error)
        setError(customerRes.error)
      } else {
        setCustomers(customerRes.data)
      }

      setLoadingOptions(false)
    }

    fetchOptions()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.rpc('insert_job', {
        p_type: formData.job_type_id,
        p_customer_id: formData.customer_id,
        p_description: formData.description || null,
        p_scheduled_date: formData.scheduled_date || null,
        p_completion_date: formData.completion_date || null,
        p_organization: HARDCODED_ORG_ID
    })

    if (error) {
        setError(error);
        console.log(error);
        setLoading(false);
        return;
    }

    console.log("Inserted job", data);
    setSuccess(true)
    setLoading(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto bg-slate-800/60 border border-slate-700 rounded-xl shadow-lg p-6 space-y-4"
    >
      <h2 className="text-lg font-semibold text-slate-100">Add Job</h2>

      <div className="space-y-1">
        <label htmlFor="job_type_id" className="block text-sm font-medium text-slate-300">
          Job Type
        </label>
        <select
          id="job_type_id"
          name="job_type_id"
          value={formData.job_type_id}
          onChange={handleChange}
          disabled={loadingOptions}
          className="w-full rounded-md bg-slate-900 border border-slate-600 text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
        >
          <option value="" disabled>
            {loadingOptions ? 'Loading...' : 'Select a job type'}
          </option>
          {jobTypes.map((jt) => (
            <option key={jt.id} value={jt.id}>
              {jt.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="customer_id" className="block text-sm font-medium text-slate-300">
          Customer
        </label>
        <select
          id="customer_id"
          name="customer_id"
          value={formData.customer_id}
          onChange={handleChange}
          disabled={loadingOptions}
          className="w-full rounded-md bg-slate-900 border border-slate-600 text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
        >
          <option value="" disabled>
            {loadingOptions ? 'Loading...' : 'Select a customer'}
          </option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.first_name} {c.last_name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className="block text-sm font-medium text-slate-300">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Job description"
          rows={4}
          className="w-full rounded-md bg-slate-900 border border-slate-600 text-slate-100 placeholder-slate-500 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="scheduled_date" className="block text-sm font-medium text-slate-300">
            Scheduled Date
          </label>
          <input
            type="date"
            id="scheduled_date"
            name="scheduled_date"
            value={formData.scheduled_date}
            onChange={handleChange}
            className="w-full rounded-md bg-slate-900 border border-slate-600 text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [color-scheme:dark]"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="completion_date" className="block text-sm font-medium text-slate-300">
            Completion Date
          </label>
          <input
            type="date"
            id="completion_date"
            name="completion_date"
            value={formData.completion_date}
            onChange={handleChange}
            min={formData.scheduled_date || undefined}
            className="w-full rounded-md bg-slate-900 border border-slate-600 text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [color-scheme:dark]"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-2 transition-colors"
      >
        {loading ? 'Submitting...' : 'Submit'}
      </button>

      {error && (
        <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md px-3 py-2">
          {error.message || 'Something went wrong submitting this job.'}
        </p>
      )}
      {success && (
        <p className="text-sm text-emerald-400 bg-emerald-950/40 border border-emerald-900 rounded-md px-3 py-2">
          Submitted successfully!
        </p>
      )}
    </form>
  )
}