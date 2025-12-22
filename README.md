# AWS Serverless Portfolio Infrastructure & AI Integration

This repository contains the backend architecture and integration logic for my professional portfolio. The project demonstrates a modern, scalable, and highly available **Serverless** approach built entirely on **Amazon Web Services (AWS)**.

## Architecture Overview

The infrastructure is designed with a "Cloud-Native" mindset, focusing on cost-optimization (Pay-as-you-go), security, and global performance.

## Tech Stack

* **Cloud Provider:** AWS (S3, CloudFront, Lambda, API Gateway, Route 53)
* **Runtime:** Node.js 22.x
* **AI Engine:** Google Gemini 2.5 Flash
* **Email Service:** Resend (SMTP/API)
* **Frontend:** React / Vite (Static Site Generation)

### Core Components:
* **Edge Delivery:** Static content is hosted in **Amazon S3** and distributed via **Amazon CloudFront** to ensure low latency and SSL/TLS encryption (HTTPS).
* **API Management:** **AWS API Gateway (HTTP API)** acts as the secure entry point for all backend services, featuring CORS protection and request throttling.
* **Serverless Compute:** * `sendEmailFunction`: A Node.js **Lambda** function that processes contact form submissions and integrates with the **Resend API** for reliable email delivery.
    * `geminiChatFunction`: A Node.js **Lambda** function that interfaces with **Google Gemini AI** to provide real-time architectural consultancy.
* **DNS & Domain Management:** **Amazon Route 53** manages the `nikolaydimitrov.dev` zone, handling record routing and email authentication (SPF/DKIM).

## Security Implementation

### 1. API Masking & Security
To maintain a professional interface and hide internal AWS identifiers, I implemented **CloudFront Proxying**. All API requests are routed through the main domain via `/api/*` behaviors.
* **CORS Policy:** Restricted to the authorized domain to prevent unauthorized cross-origin requests.
* **Secrets Management:** Sensitive API keys (Gemini & Resend) are injected via **Lambda Environment Variables**, ensuring no credentials are exposed in the client-side code.

### 2. Infrastructure Resilience
* **Throttling:** Configured Rate and Burst limits in **API Gateway** to protect against DoS attacks and manage service quotas.
* **Performance Optimization:** Adjusted Lambda timeouts (30s) and memory allocation to accommodate AI model latency.
* **Email Deliverability:** Configured **DKIM** and **SPF** records within Route 53 to ensure high sender reputation and prevent emails from landing in spam.

### 3. AI System Prompting
The AI Consultant is governed by a strict `System Instruction` set. It is programmed to act as a **Senior AWS DevOps Engineer**, providing concise, high-level technical solutions focusing on **ECS, Lambda, RDS, S3, and Terraform**.

## Future Roadmap
* **Infrastructure as Code (IaC):** Migrate manual console configurations to **Terraform** or **AWS CDK**.
* **Monitoring:** Implement **CloudWatch Alarms** for Lambda error tracking and API Gateway latency metrics.

---
**Developed by Nikolay Dimitrov** *Senior AWS DevOps Engineer Portfolio*