# Final Project

## Overview

This project uses:

- Bun (runtime and package manager)
- Docker and Docker Compose (database)
- Local `.env` configuration
- Database schema and seed scripts

This guide provides setup instructions for Windows, macOS, and Linux.

---

# Prerequisites

Install the following before starting:

- Git
- Docker and Docker Compose
- Bun (latest version)

---

# Installing Prerequisites

## Windows

### 1. Install Git
Download and install from:
https://git-scm.com/download/win

### 2. Install Docker Desktop
Download and install from:
https://www.docker.com/products/docker-desktop/

Ensure:
- WSL2 is enabled
- Docker Desktop is running

### 3. Install Bun
Open PowerShell and run:

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Restart your terminal after installation.

Verify installation:

```powershell
bun --version
```

---

## macOS

### 1. Install Git

Using Homebrew:

```bash
brew install git
```

Or download from:
https://git-scm.com/download/mac

### 2. Install Docker Desktop
Download from:
https://www.docker.com/products/docker-desktop/

Start Docker Desktop after installation.

### 3. Install Bun

```bash
curl -fsSL https://bun.sh/install | bash
```

Restart your terminal and verify:

```bash
bun --version
```

---

## Linux (Ubuntu/Debian)

### 1. Install Git

```bash
sudo apt update
sudo apt install git -y
```

### 2. Install Docker

```bash
sudo apt install docker.io docker-compose-plugin -y
sudo systemctl enable docker
sudo systemctl start docker
```

Optional: Run Docker without sudo:

```bash
sudo usermod -aG docker $USER
```

Log out and log back in after running the command above.

### 3. Install Bun

```bash
curl -fsSL https://bun.sh/install | bash
```

Verify installation:

```bash
bun --version
```

---

# Project Setup (All Operating Systems)

## 1. Clone the Repository

```bash
git clone https://github.com/cen-4010-fiu/final-project.git
cd final-project
```

---

## 2. Install Dependencies

```bash
bun install
```

---

## 3. Configure Environment Variables

Copy the example file:

### macOS / Linux

```bash
cp .env.example .env
```

### Windows (PowerShell)

```powershell
copy .env.example .env
```

Open `.env` and verify that the database connection values match the Docker container configuration.

---

## 4. Start the Database (Docker)

```bash
docker compose up -d
```

To confirm the container is running:

```bash
docker ps
```

---

## 5. Push Database Schema

```bash
bun run db:push
```

---

## 6. Seed the Database

```bash
bun run db:seed
```

---

## 7. Start the Development Server

```bash
bun run dev
```

The application should be available at:

```
http://localhost:3000
```

---

# Useful Commands

### Open Database Studio

```bash
bun run db:studio
```

### View Database Logs

```bash
docker logs -f swe-db-container
```

### Stop Containers

```bash
docker compose down
```

### Reset Database (Destructive)

```bash
docker compose down -v
docker compose up -d
bun run db:push
bun run db:seed
```

---

# Troubleshooting

### Docker Not Running
Ensure Docker Desktop (Windows/macOS) is open and running.

### Port Already in Use
If you encounter a port conflict (e.g., 5432), stop any other local database services using that Port
or change your port of choice.

### Database Connection Fails
- Verify `.env` configuration
- Confirm Docker container is running (`docker ps`)
- Restart Docker and try again

---

# Development Notes

- Always run `docker compose up -d` before executing database commands.
- Run `bun install` after pulling new changes.
- If dependencies fail, delete `node_modules` and run `bun install` again.

---

# Support

If you encounter issues:

1. Confirm Docker is running
2. Confirm Bun is installed
3. Confirm `.env` file exists
4. Restart your terminal
5. Restart Docker
