/**
 * Real-Time Dashboard Component
 * Shows live AI reports and sensor data from edge nodes
 */

'use client';

import { useRealtimeReports, useRealtimeEdgeNodes } from '@/hooks/useRealtimeReports';
import { Activity, Wifi, WifiOff, Radio, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RealTimeStatusProps {
  roomId?: string;
  className?: string;
}

export function RealTimeStatus({ roomId, className = '' }: RealTimeStatusProps) {
  const { latestReport, reports, isConnected, error } = useRealtimeReports({ roomId, enabled: true });
  const { edgeNodes, isConnected: edgeNodesConnected } = useRealtimeEdgeNodes();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center gap-3 p-4 rounded-xl border bg-white">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <span className="text-sm font-semibold text-emerald-600">Real-Time Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-red-500" />
              <span className="text-sm font-semibold text-red-600">Real-Time Disconnected</span>
            </>
          )}
        </div>
        
        {error && (
          <div className="ml-auto flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </div>

      {/* Latest Report */}
      {latestReport && (
        <div className="p-4 rounded-xl border bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Radio className="h-4 w-4 text-blue-600 animate-pulse" />
                <span className="text-sm font-bold text-blue-900">Live Update</span>
              </div>
              <p className="text-xs text-blue-600">
                Just now from {latestReport.edge_node_id || latestReport.module}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              latestReport.alert_level === 'critical' ? 'bg-red-100 text-red-700' :
              latestReport.alert_level === 'warning' ? 'bg-amber-100 text-amber-700' :
              'bg-emerald-100 text-emerald-700'
            }`}>
              {latestReport.alert_level.toUpperCase()}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <span className="text-sm font-bold text-gray-900">{latestReport.status}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Confidence:</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                    style={{ width: `${latestReport.confidence * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {(latestReport.confidence * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Room:</span>
              <span className="text-sm font-bold text-gray-900">{latestReport.room_id}</span>
            </div>
            
            {/* Sensor Data from Metadata */}
            {latestReport.metadata && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-xs font-semibold text-blue-900 mb-2">Sensor Data:</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(latestReport.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-semibold text-gray-900">
                        {typeof value === 'number' ? value.toFixed(1) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Report History */}
      {reports.length > 0 && (
        <div className="p-4 rounded-xl border bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900">Recent Updates</h3>
            <span className="text-xs text-gray-500">{reports.length} reports</span>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {reports.slice(0, 10).map((report, idx) => (
              <div 
                key={`${report.id}-${idx}`}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3 text-gray-400" />
                  <span className="text-xs font-medium text-gray-700">{report.status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                  </span>
                  {report.alert_level !== 'normal' && (
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      report.alert_level === 'critical' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {report.alert_level}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edge Nodes Status */}
      {edgeNodesConnected && edgeNodes.size > 0 && (
        <div className="p-4 rounded-xl border bg-white">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Edge Nodes</h3>
          <div className="space-y-2">
            {Array.from(edgeNodes.values()).map((node) => (
              <div key={node.node_id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2">
                  {node.online ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-xs font-medium text-gray-700">{node.node_id}</span>
                </div>
                <span className={`text-xs font-semibold ${node.online ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {node.online ? 'Online' : 'Offline'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data State */}
      {!latestReport && reports.length === 0 && isConnected && (
        <div className="p-8 text-center text-gray-500">
          <Wifi className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-medium">Waiting for edge node data...</p>
          <p className="text-xs mt-1">Real-time connection active</p>
        </div>
      )}
    </div>
  );
}
