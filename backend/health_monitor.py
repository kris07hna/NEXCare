"""
System Health Monitor for NEXCARE-5G
Monitors server health, connections, and performance
"""

import psutil
import requests
import time
import logging
from datetime import datetime
from pathlib import Path
import json

# Setup logging
log_dir = Path(__file__).parent / 'logs'
log_dir.mkdir(exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_dir / 'health_monitor.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class HealthMonitor:
    """System health monitoring class"""
    
    def __init__(self, server_url='http://localhost:5000'):
        self.server_url = server_url
        self.start_time = datetime.now()
        
    def get_system_stats(self):
        """Get system resource statistics"""
        return {
            'cpu_percent': psutil.cpu_percent(interval=1),
            'memory_percent': psutil.virtual_memory().percent,
            'memory_available_gb': psutil.virtual_memory().available / (1024**3),
            'disk_percent': psutil.disk_usage('/').percent,
            'disk_free_gb': psutil.disk_usage('/').free / (1024**3),
            'network_sent_mb': psutil.net_io_counters().bytes_sent / (1024**2),
            'network_recv_mb': psutil.net_io_counters().bytes_recv / (1024**2),
        }
    
    def check_backend_api(self):
        """Check if backend API is responding"""
        try:
            response = requests.get(f'{self.server_url}/sensor_data', timeout=5)
            return {
                'status': 'online',
                'status_code': response.status_code,
                'response_time_ms': response.elapsed.total_seconds() * 1000
            }
        except requests.exceptions.RequestException as e:
            return {
                'status': 'offline',
                'error': str(e)
            }
    
    def check_processes(self):
        """Check for running Python processes"""
        python_processes = []
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
            try:
                if 'python' in proc.info['name'].lower():
                    python_processes.append({
                        'pid': proc.info['pid'],
                        'name': proc.info['name'],
                        'cpu': proc.info['cpu_percent'],
                        'memory': proc.info['memory_percent']
                    })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
        return python_processes
    
    def get_uptime(self):
        """Get system uptime"""
        uptime_seconds = (datetime.now() - self.start_time).total_seconds()
        hours = int(uptime_seconds // 3600)
        minutes = int((uptime_seconds % 3600) // 60)
        return f"{hours}h {minutes}m"
    
    def generate_report(self):
        """Generate comprehensive health report"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'uptime': self.get_uptime(),
            'system': self.get_system_stats(),
            'backend_api': self.check_backend_api(),
            'processes': self.check_processes()
        }
        return report
    
    def print_report(self, report):
        """Print formatted health report"""
        print("\n" + "="*60)
        print(f"  NEXCARE-5G HEALTH REPORT - {report['timestamp']}")
        print("="*60)
        
        print(f"\n⏱️  Uptime: {report['uptime']}")
        
        print("\n📊 System Resources:")
        sys = report['system']
        print(f"  CPU Usage:    {sys['cpu_percent']}%")
        print(f"  Memory Usage: {sys['memory_percent']}% ({sys['memory_available_gb']:.2f} GB free)")
        print(f"  Disk Usage:   {sys['disk_percent']}% ({sys['disk_free_gb']:.2f} GB free)")
        print(f"  Network Sent: {sys['network_sent_mb']:.2f} MB")
        print(f"  Network Recv: {sys['network_recv_mb']:.2f} MB")
        
        print("\n🌐 Backend API Status:")
        api = report['backend_api']
        if api['status'] == 'online':
            print(f"  Status: ✅ ONLINE")
            print(f"  Response Code: {api['status_code']}")
            print(f"  Response Time: {api['response_time_ms']:.2f} ms")
        else:
            print(f"  Status: ❌ OFFLINE")
            print(f"  Error: {api.get('error', 'Unknown')}")
        
        print("\n🐍 Python Processes:")
        if report['processes']:
            for proc in report['processes']:
                print(f"  PID {proc['pid']}: {proc['name']} (CPU: {proc['cpu']}%, MEM: {proc['memory']:.1f}%)")
        else:
            print("  No Python processes found")
        
        print("\n" + "="*60 + "\n")
    
    def monitor_continuous(self, interval=30):
        """Continuously monitor and log health status"""
        logger.info("Health monitoring started")
        
        try:
            while True:
                report = self.generate_report()
                self.print_report(report)
                
                # Log critical issues
                if report['system']['cpu_percent'] > 90:
                    logger.warning(f"High CPU usage: {report['system']['cpu_percent']}%")
                
                if report['system']['memory_percent'] > 90:
                    logger.warning(f"High memory usage: {report['system']['memory_percent']}%")
                
                if report['backend_api']['status'] == 'offline':
                    logger.error("Backend API is offline!")
                
                time.sleep(interval)
                
        except KeyboardInterrupt:
            logger.info("Health monitoring stopped by user")

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='NEXCARE-5G Health Monitor')
    parser.add_argument('--server', default='http://localhost:5000', help='Backend server URL')
    parser.add_argument('--interval', type=int, default=30, help='Monitoring interval in seconds')
    parser.add_argument('--once', action='store_true', help='Run once and exit')
    
    args = parser.parse_args()
    
    monitor = HealthMonitor(server_url=args.server)
    
    if args.once:
        report = monitor.generate_report()
        monitor.print_report(report)
        
        # Save to file
        with open('health_report.json', 'w') as f:
            json.dump(report, f, indent=2)
        print("Report saved to health_report.json")
    else:
        monitor.monitor_continuous(interval=args.interval)
