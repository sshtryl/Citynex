"use client";
import { useParams } from 'next/navigation';
import { ReportDetail } from '@/components/reportDetail';

export default function LaporanDetailPage() {
    const params = useParams();
    const id = params.id as string;

    return <ReportDetail reportId={id} />;
}