# Infrastructure Automation & CI/CD

This project is fully automated using **Infrastructure as Code (IaC)** and **CI/CD pipelines**, ensuring repeatable, secure, and production-ready deployments with **zero manual AWS console operations**.

![Terraform](https://img.shields.io/badge/terraform-%235835CC.svg?style=for-the-badge&logo=terraform&logoColor=white) ![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white) ![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white)

---

## Infrastructure as Code (Terraform)

All AWS resources are provisioned and managed using **Terraform**, following best practices for modularity, security, and cost efficiency.



### Terraform manages:
* ** Route 53:** Hosted zone and DNS records.
* ** Amazon S3:** Bucket configured for static website hosting.
* ** Amazon CloudFront:** Content delivery distribution with mandatory HTTPS.
* ** AWS API Gateway:** HTTP API acting as the entry point.
* ** AWS Lambda:** Serverless functions (Node.js) for backend logic.
* ** IAM & Security:** Roles with least-privilege permissions and environment variables for secure secret injection.
* ** Protection:** Throttling, timeouts, and API protection settings.

### State Management:
* **Remote Storage:** Terraform state is stored securely in **Amazon S3**.

> **Result:** This approach guarantees fully reproducible environments, safe infrastructure changes, and a clear audit trail of all modifications.

---

## 🔄 Continuous Integration & Deployment (GitHub Actions)

The project uses **GitHub Actions** to implement an automated CI/CD pipeline triggered on every push to the `develop` branch.


### The pipeline performs the following steps:

1.  ** Frontend Build**
    * Installs dependencies and builds the React/Vite application.
    * Generates the optimized `/dist` static output.

2.  ** Infrastructure Deployment**
    * Initializes Terraform, creates plans, and applies changes automatically.
    * Ensures infrastructure and application stay perfectly in sync.

3.  ** Static Site Deployment**
    * Uploads the `/dist` folder to Amazon S3.
    * Triggers **CloudFront cache invalidation** to deliver updates globally instantly.

4.  ** Serverless Backend Deployment**
    * Deploys updated Lambda functions and applies API Gateway configuration changes.

### 🔐 Authentication & Security:
* **Secure Access:** AWS access is handled via **GitHub Secrets** and IAM roles.
* **No Hardcoding:** Zero AWS credentials are hardcoded in the repository, maintaining high security standards.

---