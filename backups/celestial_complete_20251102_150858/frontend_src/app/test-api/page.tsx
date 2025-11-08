/**
 * API Test Page
 * 
 * Simple page to test API connectivity and display raw responses.
 */

'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout';

export default function TestAPIPage() {
  const [healthStatus, setHealthStatus] = useState<Record<string, unknown> | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testAPI = async () => {
      setLoading(true);
      try {
        // Test direct fetch to health endpoint
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        console.log('Testing API at:', apiUrl);
        
        const response = await fetch(`${apiUrl}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Health data:', data);
        setHealthStatus(data);
        setHealthError(null);
      } catch (error: unknown) {
        console.error('API Error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        setHealthError(errorMessage);
        setHealthStatus(null);
      } finally {
        setLoading(false);
      }
    };

    testAPI();
  }, []);

  return (
    <MainLayout title="API Test" subtitle="Testing Backend Connectivity">
      <div className="p-6">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-lg font-semibold mb-4">Backend API Health Check</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-zinc-400">API URL:</p>
              <p className="text-sm font-mono text-zinc-50">
                {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
              </p>
            </div>

            <div>
              <p className="text-sm text-zinc-400">Status:</p>
              {loading && (
                <p className="text-sm text-yellow-500">Testing connection...</p>
              )}
              {!loading && healthStatus && (
                <p className="text-sm text-green-500">✓ Connected successfully</p>
              )}
              {!loading && healthError && (
                <p className="text-sm text-red-500">✗ Connection failed</p>
              )}
            </div>

            {healthError && (
              <div className="rounded border border-red-800 bg-red-950/30 p-4">
                <p className="text-sm font-semibold text-red-400">Error:</p>
                <p className="text-sm text-red-300 mt-1">{healthError}</p>
              </div>
            )}

            {healthStatus && (
              <div className="rounded border border-green-800 bg-green-950/30 p-4">
                <p className="text-sm font-semibold text-green-400 mb-2">Response:</p>
                <pre className="text-xs text-zinc-300 overflow-auto">
                  {JSON.stringify(healthStatus, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-800">
            <p className="text-xs text-zinc-500">
              This page tests direct connectivity to the backend API. 
              Check the browser console for detailed logs.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
