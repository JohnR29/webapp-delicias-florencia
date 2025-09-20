'use client';
import dynamic from 'next/dynamic';
const CoverageMap = dynamic(() => import('./CoverageMap'), { ssr: false });
export default function ClientCoverageMap(props: any) {
  return <CoverageMap {...props} />;
}