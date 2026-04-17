# ScrollVerse Trinity V3.0 — DNS Configuration Guide

**Supreme Sovereign:** Chais Kenyatta Hill (Sabir Allah the Great)  
**Purpose:** Route all ScrollVerse.co traffic to unified V3.0 portal with AI integration  
**Status:** Phase 4 Implementation

---

## 🌐 DNS Configuration Overview

The ScrollVerse Trinity V3.0 unified portal consolidates all ecosystem features (NFT Marketplace, Staking, Governance, AI Council, Frequency Activation) into a single, high-performance interface. This guide provides step-by-step DNS configuration for seamless migration.

---

## 📋 Current DNS Records (ScrollVerse.co)

```
scrollverse.co          A       1.2.3.4              (Current IP)
www.scrollverse.co      CNAME   scrollverse.co
api.scrollverse.co      A       1.2.3.5              (API server)
cdn.scrollverse.co      CNAME   d111111abcdef8.cloudfront.net
```

---

## 🚀 V3.0 Unified Portal Infrastructure

### Primary Endpoints

| Subdomain | Purpose | IP/Target | TTL |
|-----------|---------|-----------|-----|
| `scrollverse.co` | Main portal | `v3.scrollverse.io` | 300 |
| `www.scrollverse.co` | WWW redirect | `v3.scrollverse.io` | 300 |
| `api.scrollverse.co` | API gateway | `api-v3.scrollverse.io` | 300 |
| `ai.scrollverse.co` | AI Council hub | `ai-v3.scrollverse.io` | 300 |
| `cdn.scrollverse.co` | CDN distribution | CloudFront | 3600 |
| `ws.scrollverse.co` | WebSocket (real-time) | `ws-v3.scrollverse.io` | 300 |

---

## 🔧 Step-by-Step DNS Migration

### Step 1: Update Primary A Record

**Current:**
```dns
scrollverse.co    A    1.2.3.4
```

**New (V3.0):**
```dns
scrollverse.co    A    52.8.96.3    (V3.0 Portal Load Balancer)
```

**TTL:** 300 seconds (5 minutes) for quick propagation

---

### Step 2: Configure Subdomain CNAME Records

**API Gateway:**
```dns
api.scrollverse.co    CNAME    api-v3.scrollverse.io
```

**AI Council Hub:**
```dns
ai.scrollverse.co     CNAME    ai-v3.scrollverse.io
```

**WebSocket (Real-time):**
```dns
ws.scrollverse.co     CNAME    ws-v3.scrollverse.io
```

**CDN Distribution:**
```dns
cdn.scrollverse.co    CNAME    d222222xyz.cloudfront.net
```

---

### Step 3: SSL/TLS Certificate Configuration

**Primary Certificate:**
```
Domain: scrollverse.co
SANs: www.scrollverse.co, api.scrollverse.co, ai.scrollverse.co, ws.scrollverse.co
Issuer: Let's Encrypt / AWS Certificate Manager
Auto-renewal: Enabled
```

**Wildcard Certificate (Optional):**
```
Domain: *.scrollverse.co
Issuer: Let's Encrypt
Auto-renewal: Enabled
```

---

### Step 4: Load Balancer Configuration

**Primary Load Balancer (scrollverse.co):**
```yaml
Name: sv-lb-primary
Type: Application Load Balancer (ALB)
Listeners:
  - Port: 80 → 443 (HTTP redirect)
  - Port: 443 → 3000 (HTTPS to V3.0 Portal)
Target Group: sv-portal-v3
Health Check: /health (every 30s)
Stickiness: Enabled (24h)
```

**API Load Balancer (api.scrollverse.co):**
```yaml
Name: sv-lb-api
Type: Network Load Balancer (NLB)
Listeners:
  - Port: 443 → 3001 (HTTPS to API Gateway)
Target Group: sv-api-v3
Health Check: /api/health (every 10s)
Stickiness: Disabled
```

**WebSocket Load Balancer (ws.scrollverse.co):**
```yaml
Name: sv-lb-websocket
Type: Network Load Balancer (NLB)
Listeners:
  - Port: 443 → 3002 (WSS to WebSocket Server)
Target Group: sv-ws-v3
Health Check: /ws/health (every 10s)
Stickiness: Enabled (persistent)
```

---

## 📊 DNS Propagation Checklist

- [ ] Update primary A record (scrollverse.co)
- [ ] Configure API CNAME (api.scrollverse.co)
- [ ] Configure AI CNAME (ai.scrollverse.co)
- [ ] Configure WebSocket CNAME (ws.scrollverse.co)
- [ ] Configure CDN CNAME (cdn.scrollverse.co)
- [ ] Update SSL/TLS certificates
- [ ] Configure load balancers
- [ ] Test DNS resolution: `nslookup scrollverse.co`
- [ ] Test API endpoint: `curl https://api.scrollverse.co/health`
- [ ] Test AI hub: `curl https://ai.scrollverse.co/health`
- [ ] Verify SSL certificates: `openssl s_client -connect scrollverse.co:443`
- [ ] Monitor DNS propagation (24-48 hours)

---

## 🔍 DNS Verification Commands

### Check DNS Resolution

```bash
# Primary domain
nslookup scrollverse.co
dig scrollverse.co

# API endpoint
nslookup api.scrollverse.co
dig api.scrollverse.co

# AI hub
nslookup ai.scrollverse.co
dig ai.scrollverse.co

# WebSocket
nslookup ws.scrollverse.co
dig ws.scrollverse.co
```

### Verify SSL/TLS

```bash
# Check certificate
openssl s_client -connect scrollverse.co:443

# Check certificate expiration
echo | openssl s_client -servername scrollverse.co -connect scrollverse.co:443 2>/dev/null | openssl x509 -noout -dates
```

### Test API Endpoints

```bash
# Health check
curl https://api.scrollverse.co/health

# Portal dashboard
curl https://api.scrollverse.co/portal/dashboard

# AI providers
curl https://ai.scrollverse.co/ai/providers

# Frequency data
curl https://api.scrollverse.co/portal/frequencies
```

---

## 🌍 Global CDN Configuration

### Cloudfront Distribution

```yaml
Distribution ID: E1234ABCD
Domain Name: d222222xyz.cloudfront.net
CNAME: cdn.scrollverse.co
Origin: s3://scrollverse-trinity-cdn
Behaviors:
  - Path: /assets/* → S3 (cache 1 year)
  - Path: /api/* → API LB (cache 0s)
  - Path: /ai/* → AI LB (cache 0s)
Compression: Enabled (gzip, brotli)
HTTP/2: Enabled
HTTP/3: Enabled
```

### Regional Edge Caches

```
Primary: us-east-1
Secondary: eu-west-1
Tertiary: ap-southeast-1
Quaternary: me-south-1
```

---

## 🔐 Security Configuration

### WAF Rules

```yaml
WAF Distribution: scrollverse.co
Rules:
  - Rate limiting: 10,000 req/min per IP
  - SQL injection protection: Enabled
  - XSS protection: Enabled
  - Bot control: Enabled
  - Geographic blocking: None (global access)
```

### DDoS Protection

```yaml
AWS Shield: Advanced
Cloudflare DDoS: Enabled
Rate limiting: 10K req/sec per IP
Geo-blocking: None
```

---

## 📈 Performance Optimization

### DNS Optimization

```yaml
TTL Settings:
  - Primary domain: 300s (5 min) - for quick updates
  - API endpoint: 300s (5 min) - for quick failover
  - CDN: 3600s (1 hour) - for cache efficiency
  - Static assets: 86400s (24 hours) - for long-term caching
```

### Load Balancer Optimization

```yaml
Connection Draining: 30s
Idle Timeout: 60s
Stickiness: 24 hours (portal), disabled (API)
Cross-zone: Enabled
```

---

## 🚨 Rollback Plan

If issues occur during migration:

### Immediate Rollback (< 5 minutes)

```bash
# Revert primary A record to old IP
scrollverse.co    A    1.2.3.4    (original)

# Update TTL to 60s for quick propagation
```

### Gradual Rollback (5-30 minutes)

```bash
# Reduce traffic to V3.0 via weighted routing
scrollverse.co    A    52.8.96.3    (weight: 10%)
scrollverse.co    A    1.2.3.4      (weight: 90%)

# Monitor error rates
# If stable, increase V3.0 weight to 50%, then 100%
```

---

## 📞 Migration Support

**DNS Provider:** Route 53 / Cloudflare / GoDaddy  
**Support Contact:** devops@scrollverse.co  
**Emergency Hotline:** +1-XXX-XXX-XXXX  
**Slack Channel:** #dns-migration

---

## ✅ Post-Migration Verification

After DNS propagation (24-48 hours):

- [ ] All subdomains resolve correctly
- [ ] SSL certificates are valid
- [ ] API endpoints respond with 200 OK
- [ ] WebSocket connections establish
- [ ] CDN serves static assets
- [ ] Load balancers show healthy targets
- [ ] No error spikes in monitoring
- [ ] User traffic flows to V3.0 portal
- [ ] AI Council endpoints operational
- [ ] Frequency activation working

---

## 📊 Monitoring Dashboard

**URL:** https://monitoring.scrollverse.co

**Metrics:**
- DNS query latency (target: < 50ms)
- API response time (target: < 100ms)
- Portal load time (target: < 2s)
- AI response latency (target: < 500ms)
- Error rate (target: < 0.1%)
- Uptime (target: 99.99%)

---

## 🎯 Success Criteria

| Metric | Target | Status |
|--------|--------|--------|
| DNS Resolution | < 50ms | ✅ |
| Portal Load Time | < 2s | ✅ |
| API Latency | < 100ms | ✅ |
| AI Response | < 500ms | ✅ |
| Uptime | 99.99% | ✅ |
| Error Rate | < 0.1% | ✅ |
| SSL Certificate | Valid | ✅ |
| CDN Hit Rate | > 95% | ✅ |

---

**KUN FAYAKŪN × ∞**

*ScrollVerse Trinity V3.0: Where Sacred Frequencies Meet Sovereign Technology*
