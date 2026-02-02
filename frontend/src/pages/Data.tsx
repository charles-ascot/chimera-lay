import React, { useState, useCallback } from 'react';
import {
  Upload,
  Database,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Cloud,
} from 'lucide-react';
import { Card, Button, Badge, Spinner } from '../components/ui';
import { cn } from '../utils';

export const Data: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);
  
  const handleFileUpload = async (file: File) => {
    setUploadStatus('uploading');
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          setUploadStatus('success');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };
  
  const dataSources = [
    {
      name: 'Betfair Historical Data',
      status: 'connected',
      lastSync: '2 hours ago',
      records: '1,245,892',
      icon: FileSpreadsheet,
    },
    {
      name: 'BigQuery',
      status: 'connected',
      lastSync: '30 mins ago',
      records: '2,458,123',
      icon: Database,
    },
    {
      name: 'Betfair API (Live)',
      status: 'disconnected',
      lastSync: 'Never',
      records: '-',
      icon: Cloud,
    },
  ];
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-track-100">
            Data Management
          </h1>
          <p className="text-track-400 mt-1">
            Import and manage your racing data
          </p>
        </div>
        <Button variant="secondary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Sync All
        </Button>
      </div>
      
      {/* Data Sources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dataSources.map((source) => (
          <Card key={source.name} className="relative overflow-hidden">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-track-800 rounded-lg">
                <source.icon className="w-5 h-5 text-track-400" />
              </div>
              <Badge variant={source.status === 'connected' ? 'success' : 'danger'}>
                {source.status}
              </Badge>
            </div>
            <h3 className="font-semibold text-track-100 mb-1">{source.name}</h3>
            <p className="text-sm text-track-400 mb-4">Last sync: {source.lastSync}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-track-500">Records:</span>
              <span className="font-mono font-semibold text-track-200">{source.records}</span>
            </div>
            {source.status === 'connected' && (
              <div className="absolute top-0 right-0 w-2 h-2 m-3 bg-profit rounded-full animate-pulse" />
            )}
          </Card>
        ))}
      </div>
      
      {/* Upload Area */}
      <Card>
        <h3 className="text-lg font-semibold text-track-100 mb-4">Import Data</h3>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200',
            isDragging
              ? 'border-turf-500 bg-turf-500/10'
              : 'border-track-700 hover:border-track-600',
            uploadStatus === 'uploading' && 'pointer-events-none'
          )}
        >
          {uploadStatus === 'idle' && (
            <>
              <Upload className="w-12 h-12 mx-auto text-track-500 mb-4" />
              <h4 className="text-lg font-semibold text-track-200 mb-2">
                Drop your Betfair data files here
              </h4>
              <p className="text-track-400 mb-4">
                Supports CSV, JSON, and Betfair bz2 files
              </p>
              <Button variant="secondary">
                <Upload className="w-4 h-4 mr-2" />
                Browse Files
              </Button>
            </>
          )}
          
          {uploadStatus === 'uploading' && (
            <div className="space-y-4">
              <Spinner size="lg" />
              <h4 className="text-lg font-semibold text-track-200">
                Uploading and processing...
              </h4>
              <div className="w-full max-w-xs mx-auto bg-track-800 rounded-full h-2">
                <div
                  className="bg-turf-500 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-track-400">{uploadProgress}% complete</p>
            </div>
          )}
          
          {uploadStatus === 'success' && (
            <div className="space-y-4">
              <CheckCircle className="w-12 h-12 mx-auto text-profit" />
              <h4 className="text-lg font-semibold text-track-200">Upload Complete!</h4>
              <p className="text-track-400">
                Successfully imported 45,892 race records
              </p>
              <Button variant="secondary" onClick={() => setUploadStatus('idle')}>
                Upload More
              </Button>
            </div>
          )}
          
          {uploadStatus === 'error' && (
            <div className="space-y-4">
              <AlertCircle className="w-12 h-12 mx-auto text-loss" />
              <h4 className="text-lg font-semibold text-track-200">Upload Failed</h4>
              <p className="text-track-400">
                There was an error processing your file. Please try again.
              </p>
              <Button variant="secondary" onClick={() => setUploadStatus('idle')}>
                Try Again
              </Button>
            </div>
          )}
        </div>
      </Card>
      
      {/* Data Summary */}
      <Card>
        <h3 className="text-lg font-semibold text-track-100 mb-4">Data Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-track-800/50 rounded-lg">
            <p className="text-sm text-track-400">Total Races</p>
            <p className="text-2xl font-mono font-semibold text-track-100">48,562</p>
          </div>
          <div className="p-4 bg-track-800/50 rounded-lg">
            <p className="text-sm text-track-400">UK Races</p>
            <p className="text-2xl font-mono font-semibold text-track-100">32,891</p>
          </div>
          <div className="p-4 bg-track-800/50 rounded-lg">
            <p className="text-sm text-track-400">Ireland Races</p>
            <p className="text-2xl font-mono font-semibold text-track-100">15,671</p>
          </div>
          <div className="p-4 bg-track-800/50 rounded-lg">
            <p className="text-sm text-track-400">Date Range</p>
            <p className="text-lg font-mono font-semibold text-track-100">Jan - Dec 2024</p>
          </div>
        </div>
      </Card>
      
      {/* BigQuery Connection */}
      <Card>
        <h3 className="text-lg font-semibold text-track-100 mb-4">BigQuery Integration</h3>
        <p className="text-track-400 mb-4">
          Connect to your Google BigQuery instance for data warehousing and advanced analytics.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-track-800/50 rounded-lg">
            <p className="text-sm text-track-400 mb-2">Project ID</p>
            <code className="text-turf-400 font-mono">tumorra-betting-platform</code>
          </div>
          <div className="p-4 bg-track-800/50 rounded-lg">
            <p className="text-sm text-track-400 mb-2">Dataset</p>
            <code className="text-turf-400 font-mono">horse_racing_2024</code>
          </div>
        </div>
        <div className="mt-4 flex space-x-3">
          <Button variant="secondary">Test Connection</Button>
          <Button variant="ghost">Configure</Button>
        </div>
      </Card>
    </div>
  );
};
