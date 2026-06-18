import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import MainMetricCard from './MainMetricCard'
import { HARDCODED_ORG_ID } from '../constants';

async function fetchRevenue(){
    const { data, error } = await supabase
        .rpc('get_total_revenue', {
            org_id: HARDCODED_ORG_ID
        });

    if(error){
        console.log(error);
        throw error;
    }
    if(!data){
        console.log('Data is null', data)
    }
    
    return data ?? 0;
}

async function fetchTotalJobs(){
    const { data, error } = await supabase
        .rpc('get_total_jobs', {
            org_id: HARDCODED_ORG_ID
        });
    
    if(error){
        console.log(error);
        throw error;
    }
    return data;
}

async function fetchOutstandingPayments(){
    const { data, error } = await supabase.rpc('get_outstanding_payments', {org_id: HARDCODED_ORG_ID})
    

    if(error){
        console.log(error);
        throw error;
    }
    console.log(data);
    return data?.[0] ?? { invoice_count: 0, total_revenue: 0 };
}
{/* 
async function fetchTotalJobs() {
    const { count, error } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error(error);
        throw error;
    }

    return count ?? 0;
}

async function fetchRecentJobData() {
    const { data, error } = await supabase
        .from('jobs')
        .select('*');

    if (error) {
        console.error(error);
        throw error;
    }

    return data ?? [];
}

async function fetchOutstandingPayments() {
    const { count, error } = await supabase
        .from('financials')
        .select('*, jobs!inner(*)', { count: 'exact', head: true })
        .eq('billing_status', 'invoiced');

    if (error) {
        console.error(error);
        throw error;
    }

    return count ?? 0;
}
*/}

export default function Metrics() {
    const { data: revenue = 0, isLoading: revenueLoading, isError: revenueError } = useQuery({
        queryKey: ['revenue'],
        queryFn: fetchRevenue,
    });

    
    const { data: totalJobs = 0, isLoading: jobsLoading, isError: jobsError } = useQuery({
        queryKey: ['totalJobs'],
        queryFn: fetchTotalJobs,
    });

    {/* 
    const { data: recentJobs = [], isLoading: recentJobsLoading, isError: recentJobsError } = useQuery({
        queryKey: ['recentJobs'],
        queryFn: fetchRecentJobData,
    });
        */}
    const { 
        data: outstandingPayments = { invoice_count: 0, total_revenue: 0 }, 
        isLoading: paymentsLoading, 
        isError: paymentsError 
    } = useQuery({
        queryKey: ['outstandingPayments'],
        queryFn: fetchOutstandingPayments,
    });
        
    return (
        <>
            <MainMetricCard
                label={"REVENUE"}
                value={revenueLoading ? "..." : revenueError ? "Error" : `$${revenue}`}
                sub={"N/A"}
                trend={"up"}
                accentClass={"border-emerald-500"}
            />
            <MainMetricCard
                label={"JOBS COMPLETED"}
                value={jobsLoading ? "..." : jobsError ? "Error": totalJobs}
                sub={"N/A"}
                trend={"up"}
                accentClass={"border-emerald-500"}
            />
            
            <MainMetricCard
                label={"OUTSTANDING"}
                value={paymentsLoading ? "..." : paymentsError ? "Error" : `$${outstandingPayments.total_revenue}`}
                sub={`${outstandingPayments.invoice_count} unpaid invoices`}
                accentClass={outstandingPayments.total_invoices == 0 ? "border-emerald-500" : "border-red-400"}
            />
            
        </>
    )
}