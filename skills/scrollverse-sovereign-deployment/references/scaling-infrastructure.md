# Scaling Infrastructure Reference — 50M+ Users

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Kubernetes HPA Configuration](#kubernetes-hpa-configuration)
3. [Redis Cluster Setup](#redis-cluster-setup)
4. [MySQL Replication](#mysql-replication)
5. [Cloudflare CDN Integration](#cloudflare-cdn-integration)
6. [Prometheus + Grafana Monitoring](#prometheus--grafana-monitoring)
7. [Capacity Planning](#capacity-planning)

---

## Architecture Overview

```
Internet → Cloudflare CDN (300+ nodes)
         → Nginx Load Balancer (2 replicas)
         → API Pods (HPA: 10 → 1000 pods)
         → Redis Cluster (6 nodes, 3 masters)
         → MySQL Primary + 2 Replicas
         → Prometheus + Grafana (monitoring)
         → Sentry (error tracking)
```

**Viral coefficient:** 1.18 — each user brings 1.18 new users on average.
**Zakat rate:** 7.77% of every payment auto-distributed.

---

## Kubernetes HPA Configuration

```yaml
# Horizontal Pod Autoscaler — scales API pods based on CPU + memory
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  minReplicas: 10
  maxReplicas: 1000
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

**Scale-up:** Triggers when CPU > 70% or Memory > 80% for 60 seconds.
**Scale-down:** Stabilizes for 300 seconds before reducing replicas (prevents thrashing).

---

## Redis Cluster Setup

6-node cluster: 3 masters + 3 replicas. Each master owns 1/3 of the keyspace.

```yaml
# Use for session storage, rate limiting, webhook idempotency keys
REDIS_HOST=redis-cluster
REDIS_PORT=6379
REDIS_PASSWORD=<generated>
```

**Key patterns used:**
- `session:{userId}` — TTL 7 days
- `webhook:processed:{eventId}` — TTL 24 hours (idempotency)
- `ratelimit:{ip}:{endpoint}` — TTL 60 seconds
- `metrics:revenue:{date}` — TTL 90 days

---

## MySQL Replication

1 Primary (writes) + 2 Replicas (reads). Application routes automatically:
- All `INSERT/UPDATE/DELETE` → `DB_HOST` (primary)
- All `SELECT` → `DB_HOST_REPLICA` (replica, round-robin)

**Connection pool:** min 10, max 100 connections per pod.

---

## Cloudflare CDN Integration

1. Add domain to Cloudflare → set nameservers
2. Enable **Argo Smart Routing** for lowest latency
3. Set **Cache Rules:** Cache static assets (JS/CSS/images) for 30 days
4. Enable **DDoS Protection** (automatic, free tier)
5. Set **SSL/TLS** to Full (Strict)
6. Add **Page Rule:** `api.scrollverse.app/*` → Cache Level: Bypass

---

## Prometheus + Grafana Monitoring

**Key metrics tracked:**

| Metric | Alert Threshold |
|---|---|
| `http_request_duration_seconds` p99 | > 500ms |
| `stripe_payment_success_total` rate | < 95% |
| `api_pod_cpu_utilization` | > 85% |
| `mysql_connections_active` | > 90% of max |
| `redis_memory_used_bytes` | > 80% of limit |
| `webhook_processing_errors_total` | > 0 in 5 min window |

Access Grafana at: `http://localhost:3001` (admin/scrollverse_grafana)

---

## Capacity Planning

| Users | API Pods | Redis Nodes | MySQL | Monthly Cost (est.) |
|---|---|---|---|---|
| 100K | 10 | 6 | 1+2 | ~$500 |
| 1M | 50 | 6 | 1+2 | ~$2,500 |
| 10M | 200 | 12 | 1+4 | ~$12,000 |
| 50M | 1000 | 24 | 1+6 | ~$55,000 |

At $9.99/month per user: **50M users = $499.5M/month revenue.**
Infrastructure cost at 50M users: ~$55K/month = **0.011% of revenue.**
