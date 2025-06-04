FROM python:3.10-slim

WORKDIR /app/flaskBackend

# Copy requirements first to leverage caching
COPY flaskBackend/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the Flask code
COPY flaskBackend/ .

# Expose internal port
EXPOSE 5000

# Run Flask app
CMD ["python", "app.py"]
