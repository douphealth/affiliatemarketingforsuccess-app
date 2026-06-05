import React, { useEffect, useState } from 'react';
import type { ActivityLog } from '../types';
import { Clock } from 'lucide-react';
import { apiClient } from '../apiClient';

export const ActivityHistory: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const json = await apiClient.getLogs();
      setLogs(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div>
      <div className="section-header">
        <div>
          <h1>Activity History Log</h1>
          <p className="page-subtitle">Chronological audits of diagnostics, draft synchronization, and optimization approvals</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <div className="spinner"><svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="none" strokeWidth="4"></circle></svg></div>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          {logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <Clock size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <h3>No activity history recorded yet.</h3>
            </div>
          ) : (
            <div className="table-wrapper" style={{ margin: 0, border: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Activity Detail Message</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ width: '220px', fontFamily: 'monospace', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td style={{ width: '180px' }}>
                        <span className="badge badge-neutral" style={{ textTransform: 'none', background: 'rgba(168, 85, 247, 0.05)', color: 'var(--accent-purple)' }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {log.message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
