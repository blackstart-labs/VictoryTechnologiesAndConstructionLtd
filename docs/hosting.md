# 🚀 VPS Deployment Guide (A-Z)

**Tech Stack:** Next.js, .NET Web API, PostgreSQL, Docker Compose, Nginx Proxy Manager (NPM), Let's Encrypt SSL.

---

## 📌 পার্ট ১: ডোমেইন ও DNS কনফিগারেশন

সার্ভারে কাজ শুরু করার আগে আপনার ডোমেইন প্যানেলে (যেমন: Cloudflare, Namecheap) গিয়ে DNS রেকর্ডগুলো সেট করুন:

| Type | Name/Host | Value/Target | Description |
| --- | --- | --- | --- |
| **A** | `@` | `YOUR_VPS_IP` | মেইন ডোমেইন (`vtclbd.com`) এর জন্য |
| **A** | `www` | `YOUR_VPS_IP` | www সংস্করণের জন্য |
| **A** | `api` | `YOUR_VPS_IP` | ব্যাকএন্ড API সাবডোমেইন (`api.vtclbd.com`) |
| **A** | `*` | `YOUR_VPS_IP` | (ঐচ্ছিক) ওয়াইল্ডকার্ড, যেকোনো সাবডোমেইনের জন্য |

---

## 📌 পার্ট ২: VPS সার্ভার প্রিপারেশন ও সিকিউরিটি

### ১. সিস্টেম আপডেট ও প্রয়োজনীয় টুলস ইনস্টলেশন

SSH দিয়ে আপনার Ubuntu VPS-এ লগইন করুন এবং রান করুন:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install docker.io docker-compose-v2 git ufw -y

```

### ২. লিনাক্স ফায়ারওয়াল (UFW) সিকিউরিটি সেটআপ

সার্ভারের সিকিউরিটির জন্য অপ্রয়োজনীয় সব পোর্ট ব্লক করে শুধু প্রয়োজনীয় পোর্টগুলো ওপেন করুন:

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 81/tcp    # NPM Dashboard
sudo ufw enable          # ফায়ারওয়াল চালু করুন (Y চাপুন)

```

### ৩. গ্লোবাল ডকার নেটওয়ার্ক তৈরি

Nginx Proxy এবং আপনার প্রজেক্টের মধ্যে পোর্টের ঝামেলা ছাড়া কানেক্ট করতে একটি এক্সটার্নাল নেটওয়ার্ক তৈরি করুন:

```bash
sudo docker network create web-network

```

---

## 📌 পার্ট ৩: Nginx Proxy Manager (NPM) সেটআপ

```bash
mkdir -p /var/www/npm && cd /var/www/npm
nano docker-compose.yml

```

**নিচের কোডটি পেস্ট করুন (`Ctrl+O`, `Enter`, `Ctrl+X` দিয়ে সেভ করুন):**

```yaml
version: '3.8'
services:
  app:
    image: 'jc21/nginx-proxy-manager:latest'
    container_name: nginx-proxy-manager
    restart: always
    ports:
      - '80:80'
      - '443:443'
      - '81:81'
    volumes:
      - ./data:/data
      - ./letsencrypt:/etc/letsencrypt
    networks:
      - web-network

networks:
  web-network:
    external: true

```

**রান করুন:**

```bash
sudo docker compose up -d

```

> **NPM ড্যাশবোর্ড লগইন:** ব্রাউজারে যান `http://YOUR_VPS_IP:81`
> * **Default Email:** `admin@example.com`
> * **Default Password:** `changeme`
> *(লগইন করেই নিজের ইমেইল ও পাসওয়ার্ড বদলে নিন)*
> 
> 

---

## 📌 পার্ট ৪: আপনার প্রজেক্ট ডিপ্লয়মেন্ট

### ১. কোড ক্লোন এবং এনভায়রনমেন্ট সেটআপ

```bash
cd /var/www
git clone <YOUR_GITHUB_REPOSITORY_URL> vtclbd-app
cd vtclbd-app
nano .env

```

`.env` ফাইলে প্রোডাকশন ভেরিয়েবলগুলো সেট করুন:

```env
DB_NAME=vtclbd_db
DB_USER=vtclbd_admin
DB_PASSWORD=SuperSecurePassword123!
JWT_KEY=YourSuperLongSecretKeyForJWTToken12345!
JWT_ISSUER=https://api.yourdomain.com
JWT_AUDIENCE=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

```

### ২. প্রোডাকশন রেডি `docker-compose.yml`

আপনার প্রজেক্টের মেইন ডকার কম্পোজ ফাইলটি এভাবে অপ্টিমাইজ করুন (NPM নেটওয়ার্ক ও লগ লিমিটসহ):

```yaml
version: '3.8'

x-logging: &default-logging
  logging:
    driver: "json-file"
    options:
      max-size: "10m"
      max-file: "3"

services:
  db:
    image: postgres:15-alpine
    container_name: vtclbd-db
    restart: always
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - web-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5
    <<: *default-logging

  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: vtclbd-backend
    restart: always
    environment:
      - ConnectionStrings__DefaultConnection=Host=db;Database=${DB_NAME};Username=${DB_USER};Password=${DB_PASSWORD}
      - Jwt__Key=${JWT_KEY}
      - Jwt__Issuer=${JWT_ISSUER}
      - Jwt__Audience=${JWT_AUDIENCE}
      - Jwt__DurationInMinutes=60
      - ASPNETCORE_ENVIRONMENT=Production
      - ASPNETCORE_URLS=http://+:5237
    depends_on:
      db:
        condition: service_healthy
    networks:
      - web-network
    <<: *default-logging

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
      args:
        - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
    container_name: vtclbd-frontend
    restart: always
    environment:
      - PORT=3000
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
    depends_on:
      - backend
    networks:
      - web-network
    <<: *default-logging

volumes:
  pgdata:

networks:
  web-network:
    external: true

```

**অ্যাপ্লিকেশনটি বিল্ড এবং রান করুন:**

```bash
sudo docker compose up -d --build

```

---

## 📌 পার্ট ৫: ড্যাশবোর্ড থেকে SSL ও ডোমেইন ম্যাপিং

এখন NPM ওয়েব প্যানেলে (`http://YOUR_VPS_IP:81`) গিয়ে ডোমেইনগুলো ম্যাপ করুন:

### ১. ফ্রন্টএন্ড ম্যাপ করা (`yourdomain.com`)

* **Hosts -> Proxy Hosts -> Add Proxy Host**
* **Domain Names:** `yourdomain.com` এবং `[www.yourdomain.com](https://www.yourdomain.com)`
* **Scheme:** `http`
* **Forward Hostname / IP:** `vtclbd-frontend` *(ডকার কন্টেইনারের নাম)*
* **Forward Port:** `3000`
* **Websockets Support:** Enabled
* **SSL Tab:** Request a new SSL Certificate -> Force SSL (Enabled) -> Agree to Terms -> Save.

### ২. ব্যাকএন্ড ম্যাপ করা (`api.yourdomain.com`)

* **Add Proxy Host**
* **Domain Names:** `api.yourdomain.com`
* **Scheme:** `http`
* **Forward Hostname / IP:** `vtclbd-backend`
* **Forward Port:** `5237`
* **SSL Tab:** Request a new SSL Certificate -> Force SSL (Enabled) -> Save.

---

## 📌 পার্ট ৬: ডেটাবেজ ম্যানেজমেন্ট ও অটোমেটিক ব্যাকআপ

### ১. ডেটাবেজে কুয়েরি চালানো (CLI)

সরাসরি VPS টার্মিনাল থেকে কুয়েরি করতে রান করুন:

```bash
sudo docker exec -it vtclbd-db psql -U vtclbd_admin -d vtclbd_db

```

### ২. অটোমেটিক ডেইলি ব্যাকআপ স্ক্রিপ্ট সেটআপ

```bash
mkdir -p /var/www/db-backups
nano /var/www/db-backups/backup.sh

```

**কোডটি পেস্ট করুন:**

```bash
#!/bin/bash
BACKUP_DIR="/var/www/db-backups"
FILENAME="$BACKUP_DIR/vtclbd_db_$(date +%Y%m%d_%H%M%S).sql"

# ব্যাকআপ জেনারেট করা
docker exec -t vtclbd-db pg_dump -U vtclbd_admin vtclbd_db > $FILENAME

# ৭ দিনের বেশি পুরোনো ব্যাকআপ ডিলিট করা
find $BACKUP_DIR -type f -name "*.sql" -mtime +7 -delete

```

পারমিশন দিন এবং ক্রন-জব (Cron Job) চালু করুন:

```bash
chmod +x /var/www/db-backups/backup.sh
sudo crontab -e

```

**একদম নিচে এই লাইনটি যোগ করুন (প্রতিদিন রাত ১২টায় অটো ব্যাকআপ হবে):**

```cron
0 0 * * * /var/www/db-backups/backup.sh

```

---

## 📌 পার্ট ৭: মেইনটেইন্যান্স ও কাজের কিছু কমান্ড

### ১. নতুন ফিচার পুশ করার পর ম্যানুয়াল আপডেট

গিটহাবে নতুন কোড দিলে সার্ভারে এসে জাস্ট এই ৩ লাইন রান করবেন (Zero Downtime-এ আপডেট হবে):

```bash
cd /var/www/vtclbd-app
git pull origin main
sudo docker compose up -d --build

```

### ২. ডকার মেমোরি এবং ক্যাশ ক্লিনআপ (মাসে ১ বার করবেন)

সার্ভারের ডিস্ক স্পেস খালি রাখতে ওল্ড ক্যাশ ফাইল ডিলিট করার কমান্ড:

```bash
sudo docker system prune -a --volumes -f

```

### ৩. লগ চেক করা

কোনো কারণে অ্যাপে এরর আসলে বা কন্টেইনার ক্র্যাশ করলে লগ দেখার কমান্ড:

```bash
sudo docker logs -f vtclbd-backend  # ব্যাকএন্ডের জন্য
sudo docker logs -f vtclbd-frontend # ফ্রন্টএন্ডের জন্য

```

---

এই গাইডটি অনুসরণ করলে আপনার একই সার্ভারে পরবর্তীতে ২য় বা ৩য় কোনো প্রজেক্ট যুক্ত করতে জাস্ট **পার্ট ৪** (আলাদা ফোল্ডারে ও ভিন্ন কন্টেইনার নামে) এবং **পার্ট ৫** ফলো করলেই হবে। অল দ্য বেস্ট!
