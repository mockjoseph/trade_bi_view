import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import MainMetricCard from './MainMetricCard'
import { HARDCODED_ORG_ID } from '../constants';
import { use } from 'react';

async function fetchRevenue(){
    const { data, error } = await supabase
        .rpc('get_total_revenue', {
            org_id: HARDCODED_ORG_ID
        });

    if(error){
        console.log(error);
        throw error;
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

async function fetchThisMonthsMetrics(){
    const { data, error } = await supabase.rpc('get_this_month_metrics', {org_id: HARDCODED_ORG_ID})

    if(error){
        console.log(error);
        throw error;
    }

    return data?.[0] ?? {job_count: 0, total_revenue: 0, total_labor_cost: 0, total_material_cost: 0};
}

async function fetchLastMonthMetrics(){
    const {data, error} = await supabase.rpc('get_last_month_metrics', {org_id : HARDCODED_ORG_ID})

    if(error){
        console.log(error)
        throw error
    }
    console.log("last months metric data", data);
    return data?.[0] ?? {job_count: 0, total_revenue: 0, total_labor_cost: 0, total_material_cost: 0};
}

function computeChange(thisMonth, lastMonth){
    if(!thisMonth){
        return 0;
    }
    // Takes in metrics for this month and last month and returns growth or decay
    thisMonth = Number(thisMonth) || 0;
    lastMonth = Number(lastMonth) || 0;
    return ((thisMonth - lastMonth) / thisMonth) * 100;
}

function getMargin(revenue, laborCost, materialCost){
    if(!revenue){
        return 0;
    }
    revenue = Number(revenue) || 0;
    laborCost = Number(laborCost) || 0;
    materialCost = Number(materialCost) || 0;
    return ((revenue - laborCost - materialCost) / revenue) * 100
}

export default function Metrics() {

    const { data: thisMonthMetrics = {job_count: 0, total_revenue: 0, total_labor_cost: 0, total_material_cost: 0},
            isLoading: thisMonthMetricsLoading,
            isError: thisMonthMetricsError
        } = useQuery({
            queryKey: ['thisMonthMetrics'],
            queryFn: fetchThisMonthsMetrics,
        });
    
    const { data: totalJobs = 0, isLoading: jobsLoading, isError: jobsError } = useQuery({
        queryKey: ['totalJobs'],
        queryFn: fetchTotalJobs,
    });

    const { data: lastMonthMetrics = {job_count: 0, total_revenue: 0, total_labor_cost: 0, total_material_cost: 0},
            isLoading: lastMonthMetricsLoading,
            isError: lastMonthMetricsError
        } = useQuery({
            queryKey: ['lastMonthMetrics'],
            queryFn: fetchLastMonthMetrics,
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
    
    let revenueChange = 0;
    let jobCountChange = 0;
    let lastMonthMargin = 0;
    let thisMonthMargin = 0;
    let marginChange = 0;
    if(lastMonthMetrics && thisMonthMetrics){
        console.log("This month metric data:", thisMonthMetrics);
        console.log("Last month metric data:", lastMonthMetrics);
        console.log("last month revenue", lastMonthMetrics.total_revenue);
        console.log("this months revenue", thisMonthMetrics.total_revenue);
        
        revenueChange = computeChange(thisMonthMetrics.total_revenue, lastMonthMetrics.total_revenue);
        jobCountChange = computeChange(thisMonthMetrics.job_count, lastMonthMetrics.job_count);
        thisMonthMargin = getMargin(thisMonthMetrics.total_revenue, thisMonthMetrics.total_labor_cost, thisMonthMetrics.total_material_cost);
        lastMonthMargin = getMargin(lastMonthMetrics.total_revenue, lastMonthMetrics.total_labor_cost, lastMonthMetrics.total_material_cost);
        console.log("Last month margin:", lastMonthMargin);
        console.log("This month margin:", thisMonthMargin);
        marginChange = computeChange(thisMonthMargin, lastMonthMargin);

    }

    return (
        <>

            <MainMetricCard
                label={"REVENUE"}
                value={thisMonthMetricsLoading ? "..." : thisMonthMetricsError ? "Error" : `$${thisMonthMetrics.total_revenue}`}
                sub={`${Math.abs(revenueChange).toFixed(1)}% ${revenueChange > 0 ? "Increase" : "Decrease"}`}
                trend={revenueChange > 0 ? "up" : "down"}
                accentClass={revenueChange > 0 ? "border-emerald-500" : "border-red-400"}
            />

            <MainMetricCard
                label={"JOBS COMPLETED"}
                value={jobsLoading ? "..." : jobsError ? "Error": totalJobs}
                sub={`${Math.abs(jobCountChange).toFixed(1)}% ${jobCountChange > 0 ? "Increase" : "Decrease"}`}
                trend={jobCountChange > 0 ? "up" : "down"}
                accentClass={jobCountChange > 0 ? "border-emerald-500" : "border-red-400"}
            />
            

            <MainMetricCard
                label={"AVG JOB MARGIN"}
                value={thisMonthMetricsLoading || lastMonthMetricsLoading ? "..." : thisMonthMetricsError || lastMonthMetricsError ? "Error": `${thisMonthMargin.toFixed(1)}%`}
                sub={`${Math.abs(marginChange).toFixed(1)}% ${marginChange > 0 ? `↑ vs. last month` : `↓ ${marginChange}% vs. last month`}`}
                trend={marginChange > 0 ? "up" : "down"}
                accentClass={marginChange > 0 ? "border-emerald-500" : "border-red-400"}
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