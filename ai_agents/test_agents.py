"""
Test script to verify AI agents can start properly
"""

import subprocess
import sys
import time

def test_agent(agent_name, room, server):
    """Test if an agent can be imported and started"""
    print(f"\n{'='*60}")
    print(f"Testing {agent_name}...")
    print(f"{'='*60}")

    try:
        # Try to import and check basic functionality
        if agent_name == 'NeoCare':
            from neocare_agent import NeoCareAgent, AgentConfig
            config = AgentConfig(
                agent_name='NeoCare-AI',
                room_id=room,
                module='NeoCare-AI',
                server_url=server,
                check_interval=2,
                log_level='INFO'
            )
            agent = NeoCareAgent(config)
            print(f">> {agent_name} agent initialized successfully!")
            print(f"   Room: {room}")
            print(f"   Server: {server}")
            return True

        elif agent_name == 'GeriCare':
            from gericare_agent import GeriCareAgent, AgentConfig
            config = AgentConfig(
                agent_name='GeriCare-AI',
                room_id=room,
                module='GeriCare-AI',
                server_url=server,
                check_interval=1,
                log_level='INFO'
            )
            agent = GeriCareAgent(config)
            print(f">> {agent_name} agent initialized successfully!")
            print(f"   Room: {room}")
            print(f"   Server: {server}")
            return True

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("\n" + "="*60)
    print("  NexCare-5G AI Agents - Configuration Test")
    print("="*60)

    # Test NeoCare
    neocare_ok = test_agent('NeoCare', 'R2', 'http://localhost:3000')

    # Test GeriCare
    gericare_ok = test_agent('GeriCare', 'R5', 'http://localhost:3000')

    # Summary
    print(f"\n{'='*60}")
    print("  Test Summary")
    print(f"{'='*60}")
    print(f"  NeoCare Agent:  {'✓ PASS' if neocare_ok else '✗ FAIL'}")
    print(f"  GeriCare Agent: {'✓ PASS' if gericare_ok else '✗ FAIL'}")
    print(f"{'='*60}\n")

    if neocare_ok and gericare_ok:
        print("All agents configured correctly!")
        print("\nTo run agents:")
        print("  python neocare_agent.py --room R2 --server http://localhost:3000 --mock")
        print("  python gericare_agent.py --room R5 --server http://localhost:3000 --mock")
        sys.exit(0)
    else:
        print("Some agents failed to initialize.")
        sys.exit(1)
