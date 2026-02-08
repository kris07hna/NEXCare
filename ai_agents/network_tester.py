"""
Network Connectivity Tester for NEXCARE-5G
Tests connectivity between AI agents and servers
"""

import socket
import requests
import time
from datetime import datetime
import platform
import subprocess

class NetworkTester:
    """Network connectivity testing utility"""
    
    def __init__(self, server_ip='10.107.51.130'):
        self.server_ip = server_ip
        self.results = []
    
    def ping_host(self, host, timeout=2):
        """Ping a host to test basic connectivity"""
        param = '-n' if platform.system().lower() == 'windows' else '-c'
        command = ['ping', param, '1', '-w' if platform.system().lower() == 'windows' else '-W', str(timeout*1000) if platform.system().lower() == 'windows' else str(timeout), host]
        
        try:
            output = subprocess.check_output(command, stderr=subprocess.STDOUT, universal_newlines=True)
            return True, output
        except subprocess.CalledProcessError as e:
            return False, str(e.output)
    
    def test_port(self, host, port, timeout=5):
        """Test if a specific port is open"""
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        
        try:
            result = sock.connect_ex((host, port))
            sock.close()
            return result == 0
        except socket.error:
            return False
    
    def test_http_endpoint(self, url, timeout=5):
        """Test HTTP endpoint"""
        try:
            start = time.time()
            response = requests.get(url, timeout=timeout)
            latency = (time.time() - start) * 1000
            
            return {
                'success': True,
                'status_code': response.status_code,
                'latency_ms': round(latency, 2),
                'content_length': len(response.content)
            }
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_local_ip(self):
        """Get local IP address"""
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            local_ip = s.getsockname()[0]
            s.close()
            return local_ip
        except:
            return "Unable to determine"
    
    def run_full_test(self):
        """Run comprehensive network test"""
        print("\n" + "="*70)
        print("  NEXCARE-5G NETWORK CONNECTIVITY TEST")
        print("="*70)
        print(f"\nTest Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Target Server: {self.server_ip}")
        print(f"Local IP: {self.get_local_ip()}")
        print("\n" + "-"*70)
        
        tests = [
            {
                'name': 'Basic Connectivity (Ping)',
                'test': lambda: self.ping_host(self.server_ip)
            },
            {
                'name': 'Next.js Frontend (Port 3000)',
                'test': lambda: (self.test_port(self.server_ip, 3000), None)
            },
            {
                'name': 'Flask Backend (Port 5000)',
                'test': lambda: (self.test_port(self.server_ip, 5000), None)
            },
            {
                'name': 'WebRTC Signaling (Port 8080)',
                'test': lambda: (self.test_port(self.server_ip, 8080), None)
            },
            {
                'name': 'Next.js HTTP Endpoint',
                'test': lambda: (self.test_http_endpoint(f'http://{self.server_ip}:3000')['success'], 
                                self.test_http_endpoint(f'http://{self.server_ip}:3000'))
            },
            {
                'name': 'Backend API Endpoint',
                'test': lambda: (self.test_http_endpoint(f'http://{self.server_ip}:5000/sensor_data')['success'],
                                self.test_http_endpoint(f'http://{self.server_ip}:5000/sensor_data'))
            }
        ]
        
        results = []
        for test_item in tests:
            print(f"\n🔍 Testing: {test_item['name']}")
            try:
                success, details = test_item['test']()
                
                if success:
                    print(f"   ✅ PASS")
                    if isinstance(details, dict) and 'latency_ms' in details:
                        print(f"      Latency: {details['latency_ms']} ms")
                        print(f"      Status Code: {details['status_code']}")
                else:
                    print(f"   ❌ FAIL")
                    if details and isinstance(details, dict):
                        print(f"      Error: {details.get('error', 'Unknown error')}")
                
                results.append({
                    'test': test_item['name'],
                    'success': success,
                    'details': details
                })
                
            except Exception as e:
                print(f"   ❌ ERROR: {str(e)}")
                results.append({
                    'test': test_item['name'],
                    'success': False,
                    'error': str(e)
                })
        
        print("\n" + "="*70)
        print("  TEST SUMMARY")
        print("="*70)
        
        passed = sum(1 for r in results if r['success'])
        total = len(results)
        
        print(f"\nTests Passed: {passed}/{total}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print("\n✅ All tests PASSED - Network connectivity is EXCELLENT!")
        elif passed >= total * 0.7:
            print("\n⚠️  Some tests failed - Network connectivity has ISSUES")
        else:
            print("\n❌ Most tests failed - Network connectivity is POOR")
        
        print("\n" + "="*70)
        
        # Recommendations
        if not all(r['success'] for r in results):
            print("\n💡 RECOMMENDATIONS:")
            print("   1. Verify server is running (both Next.js and Flask)")
            print("   2. Check firewall rules on server and laptop")
            print("   3. Ensure devices are on the same network")
            print("   4. Verify server IP address is correct")
            print("   5. Check router settings (no AP isolation)")
            print("   6. Try restarting server and network devices")
            print()
        
        return results

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='NEXCARE-5G Network Tester')
    parser.add_argument('--server', default='10.107.51.130', help='Server IP address to test')
    parser.add_argument('--continuous', action='store_true', help='Run continuously')
    parser.add_argument('--interval', type=int, default=60, help='Interval for continuous testing (seconds)')
    
    args = parser.parse_args()
    
    tester = NetworkTester(server_ip=args.server)
    
    if args.continuous:
        print(f"\n🔄 Running continuous network tests every {args.interval} seconds")
        print("Press Ctrl+C to stop\n")
        
        try:
            while True:
                tester.run_full_test()
                time.sleep(args.interval)
        except KeyboardInterrupt:
            print("\n\nNetwork testing stopped by user.")
    else:
        tester.run_full_test()
