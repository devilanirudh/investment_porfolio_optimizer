from fastapi import FastAPI, Form, UploadFile, File, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse
from typing import Optional
import base64
import io
import json
from google import genai
from google.genai import types
import os
import uvicorn
import logging

# Constants
BUCKET_NAME = "ny_processing"
PROJECT_ID = "prodloop"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
GOOGLE_CREDENTIALS = os.path.join(BASE_DIR, "prodloop-8df7fb8e30c0.json")

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Set environment variables
os.environ["GOOGLE_PROJECT_ID"] = PROJECT_ID
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GOOGLE_CREDENTIALS


app = FastAPI(title="Portfolio Risk Analyzer")

# Mount static files
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")

# Set up templates
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))

@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/analyze")
async def analyze_portfolio(
    # User profile parameters
    total_assets: float = Form(...),
    total_liabilities: float = Form(...),
    monthly_income: float = Form(...),
    monthly_expenses: float = Form(...),
    emergency_fund_months: float = Form(...),
    investment_experience: str = Form(...),
    age: int = Form(...),
    retirement_goals: str = Form(...),
    investment_horizon: str = Form(...),
    risk_appetite: str = Form(...),
    # Portfolio CSV file
    portfolio_csv: UploadFile = File(...)
):
    try:
        # Read and encode the CSV file
        contents = await portfolio_csv.read()
        encoded_csv = base64.b64encode(contents).decode('utf-8')
        
        # Create user profile JSON
        user_profile = {
            "total_assets": total_assets,
            "total_liabilities": total_liabilities,
            "net_worth": total_assets - total_liabilities,
            "monthly_income": monthly_income,
            "monthly_expenses": monthly_expenses,
            "emergency_fund_months": emergency_fund_months,
            "investment_experience": investment_experience,
            "age": age,
            "retirement_goals": retirement_goals,
            "investment_horizon": investment_horizon,
            "risk_appetite": risk_appetite
        }
        
        # Call Gemini API to analyze portfolio
        result = analyze_with_gemini(encoded_csv, user_profile)
        
        return JSONResponse(content=result)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

def analyze_with_gemini(encoded_csv: str, user_profile: dict):
    # Initialize Gemini client
    client = genai.Client(
        vertexai=True,
        project="prodloop",
        location="global",
    )

    # Convert user profile to a formatted string
    user_profile_text = f"""
User Risk Profile:
- Total Assets: ₹{user_profile['total_assets']:,.2f}
- Total Liabilities: ₹{user_profile['total_liabilities']:,.2f}
- Net Worth: ₹{user_profile['net_worth']:,.2f}
- Monthly Income: ₹{user_profile['monthly_income']:,.2f}
- Monthly Expenses: ₹{user_profile['monthly_expenses']:,.2f}
- Emergency Fund: {user_profile['emergency_fund_months']} months
- Investment Experience: {user_profile['investment_experience']}
- Age: {user_profile['age']}
- Retirement Goals: {user_profile['retirement_goals']}
- Investment Horizon: {user_profile['investment_horizon']}
- Risk Appetite: {user_profile['risk_appetite']}
"""

    # Create document part for CSV
    document = types.Part.from_bytes(
        data=base64.b64decode(encoded_csv),
        mime_type="text/csv",
    )
    
    # Create text part for instructions
    text = types.Part.from_text(text=f"""You are an AI-powered financial advisor analyzing a user's stock portfolio based on their financial risk profile. The user has uploaded a CSV file containing transaction details for their stock holdings. Your task is to process the transaction history, determine the current stock holdings, and provide recommendations on which stocks to keep and which to exit, with justifications.

IMPORTANT: Your response MUST be a properly formatted JSON object. DO NOT include any explanation, code, or text outside of the JSON structure. DO NOT wrap your response in triple backticks or markdown code blocks.

Input Data
1. Stock Portfolio (CSV File)
The CSV file contains transaction details for stocks with the following columns:
Trade Date: Date of transaction.
Trade Time: Time of transaction.
Order Time: Time order was placed.
Security Name: Name of the stock.
ISIN: Unique identifier for the stock.
Exchange: Where the stock was traded (e.g., NSE, BSE).
Order Source: How the order was placed (e.g., app, broker).
Transaction Type: Buy or Sell.
Quantity: Number of shares transacted.
Market Rate: Price per share at the time of trade.
Total: Total cost or proceeds from the transaction.
GST: Tax charged.
Brokerage: Brokerage fee.
Misc.: Other charges.
Total Charges: Sum of all fees and taxes.
STT/CTT: Securities/Commodities Transaction Tax.

2. User Risk Profile (Financial Information)
{user_profile_text}

Output Format: Structured JSON
The output should be in structured JSON format, providing:
Current Holdings: Based on Buy/Sell transactions.
Stocks to Keep: Stocks aligned with the user's risk profile.
Stocks to Exit: Stocks that should be sold, with justifications.

IMPORTANT INSTRUCTIONS:
1. USE THE GOOGLE SEARCH TOOL to find the latest information about each stock's sector, market cap, dividend yield, and current market price.
2. When searching for stock information, use the format "[Stock Name] NSE stock sector market cap dividend"
3. For Indian stocks, focus on BSE/NSE market data, not US markets.
4. Use the search tool for EACH stock in the portfolio to get accurate, current information.

Your answer must ONLY be a single JSON object in the following format without any surrounding text:

{{
  "user_profile": {{
    "total_assets": {user_profile['total_assets']},
    "total_liabilities": {user_profile['total_liabilities']},
    "net_worth": {user_profile['net_worth']},
    "monthly_income": {user_profile['monthly_income']},
    "monthly_expenses": {user_profile['monthly_expenses']},
    "emergency_fund_months": {user_profile['emergency_fund_months']},
    "investment_experience": "{user_profile['investment_experience']}",
    "age": {user_profile['age']},
    "retirement_goals": "{user_profile['retirement_goals']}",
    "investment_horizon": "{user_profile['investment_horizon']}",
    "risk_appetite": "{user_profile['risk_appetite']}"
  }},
  "portfolio_analysis": {{
    "current_holdings": [
      {{
        "security_name": "<string>",
        "isin": "<string>",
        "exchange": "<string>",
        "quantity_held": <numeric_value>,
        "average_purchase_price": <numeric_value>,
        "current_market_rate": <numeric_value>,
        "sector": "<string>",
        "market_cap": "<Large-cap|Mid-cap|Small-cap>",
        "dividend_yield": <numeric_value>,
        "volatility": "<Low|Moderate|High>"
      }}
    ],
    "keep": [
      {{
        "security_name": "<string>",
        "isin": "<string>",
        "exchange": "<string>",
        "quantity_held": <numeric_value>,
        "average_purchase_price": <numeric_value>,
        "current_market_rate": <numeric_value>,
        "market_cap": "<Large-cap|Mid-cap|Small-cap>",
        "reason": "<string>"
      }}
    ],
    "exit": [
      {{
        "security_name": "<string>",
        "isin": "<string>",
        "exchange": "<string>",
        "quantity_held": <numeric_value>,
        "average_purchase_price": <numeric_value>,
        "current_market_rate": <numeric_value>,
        "market_cap": "<Large-cap|Mid-cap|Small-cap>",
        "reason": "<string>"
      }}
    ]
  }}
}}

Stock Selection Criteria
Stocks to Keep
- Suitable for the user's risk appetite and financial situation.
- Strong fundamentals (e.g., stable growth, good dividend yield).
- Aligned with long-term investment goals.

Stocks to Exit
- High-volatility stocks for conservative investors.
- Low-growth stocks for aggressive investors.
- Overexposure to a single sector.
- Stocks not aligned with the investment horizon.

REMEMBER: Your response MUST be a valid JSON object only. DO NOT write any Python code or explanation text.""")

    # Set up model and content
    model = "gemini-2.5-pro-preview-03-25"
    contents = [
        types.Content(
            role="user",
            parts=[document, text]
        )
    ]
    
    # Configure generation parameters
    generate_content_config = types.GenerateContentConfig(
        temperature=1,
        top_p=0.95,
        top_k=40,
        seed=0,
        max_output_tokens=65535,
        response_modalities=["TEXT"],
        safety_settings=[
            types.SafetySetting(category="HARM_CATEGORY_HATE_SPEECH", threshold="OFF"),
            types.SafetySetting(category="HARM_CATEGORY_DANGEROUS_CONTENT", threshold="OFF"),
            types.SafetySetting(category="HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold="OFF"),
            types.SafetySetting(category="HARM_CATEGORY_HARASSMENT", threshold="OFF")
        ],
        tools=[
            types.Tool(google_search=types.GoogleSearch()),
        ],
    )

    # Generate response
    try:
        full_response = ""
        
        # Use streaming to collect the full response
        for chunk in client.models.generate_content_stream(
            model=model,
            contents=contents,
            config=generate_content_config,
        ):
            if not chunk.candidates or not chunk.candidates[0].content or not chunk.candidates[0].content.parts:
                continue
            full_response += chunk.text
        
        # Parse the response
        try:
            # Try to parse as JSON - strip any markdown code block formatting first
            text_response = full_response.strip()
            logger.info("Raw API response received.")
            
            if text_response.startswith("```") and text_response.endswith("```"):
                # Remove the markdown code block
                text_response = text_response[text_response.find("\n")+1:text_response.rfind("```")].strip()
            elif text_response.startswith("{") and text_response.endswith("}"):
                # It's already a JSON object, no need to strip
                pass
            else:
                # Try to find a JSON object in the text
                json_start = text_response.find("{")
                json_end = text_response.rfind("}") + 1
                if json_start != -1 and json_end != 0:
                    text_response = text_response[json_start:json_end]
                
            result = json.loads(text_response)
        except json.JSONDecodeError as e:
            # If not valid JSON, return the error and raw text
            logger.error(f"Failed to parse JSON response: {e}")
            result = {
                "error": "Failed to parse API response",
                "raw_response": full_response[:1000]  # Truncate very long responses
            }
    except Exception as e:
        logger.error(f"Gemini API error: {str(e)}")
        result = {
            "error": f"API Error: {str(e)}",
            "fallback": "Using fallback demo data"
        }
        # Return demo data as a fallback
        result = generate_fallback_data(user_profile)
    
    return result

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True) 