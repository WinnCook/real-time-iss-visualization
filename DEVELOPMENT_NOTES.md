# Development Notes - Real-Time Geometric Visualization

## ⚠️ CRITICAL: Python Process Management

### Warning: Be EXTREMELY Careful When Killing Python Processes

**Date Added:** 2025-01-13
**Priority:** CRITICAL

### The Problem:
When working on multiple Python projects simultaneously, **killing Python processes without checking can destroy important background tasks** in other projects.

### What Happened:
- While testing the ISS visualization project (running HTTP server on port 3000)
- Another Python scheduler was running in a different project (market data backfill)
- Accidentally killed the scheduler process while managing test servers
- **Lost intraday snapshot data forever** - can't backfill historical intraday data

### Why It Matters:
- Some processes collect time-sensitive data that **cannot be recovered**
- Intraday market data is only available during trading hours
- Once lost, historical intraday snapshots are gone permanently
- Data collection gaps break analysis pipelines

### How To Prevent This:

#### 1. **ALWAYS Check Before Killing**
```bash
# List all Python processes with details
ps aux | grep python
netstat -ano | findstr :PORT_NUMBER  # Windows

# Verify what script is running before killing
tasklist /FI "PID eq <process_id>" /V  # Windows
ps -p <pid> -o command  # Unix/Mac
```

#### 2. **Use Separate Virtual Environments**
```bash
# Each project should have its own venv
project1/
  .venv/          ← Isolated Python environment

project2/
  .venv/          ← Different isolated environment

# This makes it easier to identify which process belongs where
```

#### 3. **Name Your Processes Clearly**
```python
# Bad: python server.py
# Good: python iss_http_server.py

# Or use process titles
import setproctitle
setproctitle.setproctitle('ISS-HTTP-Server-Port-3000')
```

#### 4. **Document Running Services**
Keep a `RUNNING_SERVICES.md` in workspace root:
```markdown
# Active Background Services

## Market Data Collector
- Script: `market-intelligence-system/scheduler.py`
- Port: N/A (background task)
- Purpose: Collects hourly intraday snapshots
- ⚠️ CRITICAL: Do not kill - data cannot be recovered

## ISS Visualization Server
- Script: `python -m http.server 3000`
- Port: 3000
- Purpose: Development testing
- Safe to kill/restart
```

#### 5. **Use Process Managers**
For critical services, use process managers that survive terminal closures:
```bash
# supervisord, systemd, pm2, etc.
# These prevent accidental kills and auto-restart
```

### Current Project Impact:
- ✅ ISS Visualization: HTTP server can be killed/restarted safely (port 3000)
- ✅ Prompt Manager: API server can be killed/restarted safely (port 8000)
- ⚠️ Check for other projects before killing any Python process

### Checklist Before Killing a Process:
- [ ] What script is this process running?
- [ ] Which project does it belong to?
- [ ] Is it collecting time-sensitive data?
- [ ] Will killing it lose irreplaceable data?
- [ ] Is there documentation about this service?

---

## Project-Specific Notes

### HTTP Servers (Safe to Kill/Restart)
```bash
# ISS Visualization
python -m http.server 3000  # Safe - just serves static files
# Location: real-time-geometric-visualization/

# Prompt Manager
# Port 8000 - Safe to restart
```

### Development Workflow
1. Start servers on unique ports (3000, 8000, 8001, etc.)
2. Document which ports belong to which projects
3. Use separate terminal windows/tabs for each server
4. Label terminal tabs clearly

---

**Remember:** When in doubt, DON'T kill it - investigate first! 🛑
