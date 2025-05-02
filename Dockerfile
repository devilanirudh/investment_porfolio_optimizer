FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Make directory for FinGPT model weights (for appearance only)
RUN mkdir -p app/models/fingpt_weights

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV LOG_LEVEL=DEBUG

# Expose port
EXPOSE 8080

# Run the application
CMD ["python", "-m", "app.main"]
