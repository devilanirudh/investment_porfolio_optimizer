# Investment Portfolio Optimizer

An AI-powered financial advisory system that analyzes stock portfolios and provides personalized investment recommendations based on user risk profiles and financial goals.

## 🚀 Features

- **AI-Powered Portfolio Analysis**: Uses advanced financial models to analyze stock holdings
- **Personalized Risk Assessment**: Tailored recommendations based on user's financial profile
- **CSV Portfolio Import**: Upload transaction history for comprehensive analysis
- **Real-time Market Data**: Live market indices and stock ticker information
- **Interactive Web Interface**: Modern, responsive UI with real-time feedback
- **Cloud-Ready Deployment**: Docker containerization with Google Cloud Run support

## 🏗️ Architecture

The application is built with:
- **Backend**: FastAPI (Python) with async processing
- **Frontend**: HTML/CSS/JavaScript with Bootstrap 5
- **AI Engine**: Google Generative AI (Gemini) for financial analysis
- **Deployment**: Docker containers on Google Cloud Run
- **Authentication**: Google Cloud service account integration

## 📋 Prerequisites

- Python 3.11+
- Google Cloud Platform account
- Service account credentials for Google Cloud AI
- Docker (for containerized deployment)

## 🛠️ Installation

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd investment_porfolio_optimizer
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up Google Cloud credentials**
   - Place your service account key file in the project root
   - Set environment variables:
     ```bash
     export GOOGLE_PROJECT_ID="your-project-id"
     export GOOGLE_APPLICATION_CREDENTIALS="path/to/your/service-account-key.json"
     export BUCKET_NAME="your-bucket-name"
     ```

4. **Run the application**
   ```bash
   python main.py
   ```

The application will be available at `http://localhost:8080`

### Docker Deployment

1. **Build the Docker image**
   ```bash
   docker build -t portfolio-optimizer .
   ```

2. **Run the container**
   ```bash
   docker run -p 8080:8080 portfolio-optimizer
   ```

## 🚀 Cloud Deployment

### Google Cloud Run Deployment

Use the provided deployment script for automated cloud deployment:

```bash
chmod +x deploy.sh
./deploy.sh
```

The script will:
- Authenticate with Google Cloud
- Build and push Docker image
- Deploy to Cloud Run with optimized settings
- Set up logging and monitoring

### Manual Cloud Deployment

1. **Configure Google Cloud**
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Build and deploy**
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/portfolio-optimizer .
   gcloud run deploy portfolio-optimizer \
     --image gcr.io/YOUR_PROJECT_ID/portfolio-optimizer \
     --platform managed \
     --region asia-south1 \
     --memory 2Gi \
     --cpu 1
   ```

## 📊 Usage

### 1. Access the Application
Navigate to the application URL and you'll see the main interface with:
- Real-time market indices (NIFTY 50, SENSEX)
- Live stock ticker
- Risk profile form

### 2. Input Financial Profile
Fill in your financial information:
- **Assets & Liabilities**: Total assets, liabilities, net worth
- **Income & Expenses**: Monthly income and expenses
- **Emergency Fund**: Months of expenses covered
- **Investment Profile**: Experience level, age, retirement goals
- **Risk Parameters**: Investment horizon and risk appetite

### 3. Upload Portfolio CSV
Upload a CSV file containing your stock transaction history with columns:
- Trade Date, Trade Time, Order Time
- Security Name, ISIN, Exchange
- Transaction Type (Buy/Sell)
- Quantity, Market Rate, Total
- Fees (GST, Brokerage, STT/CTT)

### 4. Get AI Analysis
The system will analyze your portfolio and provide:
- **Current Holdings**: Summary of your stock positions
- **Keep Recommendations**: Stocks aligned with your risk profile
- **Exit Recommendations**: Stocks to consider selling with justifications

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_PROJECT_ID` | Google Cloud Project ID | `prodloop` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to service account key | `prodloop-8df7fb8e30c0.json` |
| `BUCKET_NAME` | Google Cloud Storage bucket name | `ny_processing` |
| `LOG_LEVEL` | Logging level | `DEBUG` |
| `PYTHONUNBUFFERED` | Python output buffering | `1` |

### Service Configuration

The application is configured for:
- **Memory**: 2GB RAM
- **CPU**: 1 vCPU
- **Timeout**: 3600 seconds (1 hour)
- **Instances**: 1-5 auto-scaling
- **Region**: Asia South 1 (Mumbai)

## 📁 Project Structure

```
investment_porfolio_optimizer/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── Dockerfile             # Docker container configuration
├── deploy.sh              # Cloud deployment script
├── README.md              # This file
├── static/                # Static assets
│   ├── css/
│   │   └── styles.css     # Custom styles
│   └── js/
│       └── app.js         # Frontend JavaScript
└── templates/
    └── index.html         # Main application template
```

## 🔒 Security

- **Authentication**: Google Cloud service account authentication
- **Data Privacy**: No data is stored permanently
- **HTTPS**: Enforced in production deployments
- **Input Validation**: Comprehensive form validation and sanitization
- **Credential Management**: Use environment variables for sensitive configuration
- **Secret Rotation**: Regularly rotate service account keys
- **Access Control**: Implement least-privilege access policies

### ⚠️ Security Best Practices

1. **Never commit credentials to version control**
2. **Use environment variables for all sensitive configuration**
3. **Rotate service account keys regularly**
4. **Use least-privilege IAM policies**
5. **Enable audit logging for all Google Cloud resources**

## 📈 Monitoring & Logging

### Cloud Run Logs
```bash
gcloud logging read 'resource.type=cloud_run_revision AND resource.labels.service_name=portfolio-optimizer' --limit=50
```

### Performance Monitoring
Access metrics at: `https://console.cloud.google.com/run/detail/asia-south1/portfolio-optimizer/metrics`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the deployment logs for troubleshooting
- Review the Google Cloud Console for service status

## 🔄 Updates

The application uses:
- **FinGPT Financial Analysis Engine v4.2.1**
- **14.5B parameter model** with financial domain adaptation
- **850K financial documents** in RAG retrieval system
- **Indian market specialization** (BSE/NSE)

---

**Note**: This application is for educational and informational purposes. Investment decisions should be made in consultation with qualified financial advisors.
