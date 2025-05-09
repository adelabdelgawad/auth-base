# Use an official Python runtime as a base image
FROM python:3.12-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Install system dependencies first
RUN apt-get update && apt-get install -y \
    curl gnupg apt-transport-https \
    build-essential \
    unixodbc \
    unixodbc-dev \
    libpq-dev \
    libldap2-dev \
    libsasl2-dev

# Add the Microsoft package repository 
RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - && \
    curl https://packages.microsoft.com/config/debian/11/prod.list > /etc/apt/sources.list.d/mssql-release.list

# First remove conflicting packages
RUN apt-get update && \
    apt-get remove -y libodbc2 libodbcinst2 unixodbc-common && \
    apt-get autoremove -y

# Install ODBC driver with force-overwrite option
RUN apt-get update && \
    apt-get download libodbc1 odbcinst odbcinst1debian2 && \
    dpkg --force-overwrite -i *.deb && \
    rm *.deb && \
    ACCEPT_EULA=Y apt-get install -y msodbcsql17 mssql-tools

# Clean up APT cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy the application into the container
COPY . .

# Set the working directory
WORKDIR /app

# Now install Python packages
RUN uv sync --frozen --no-cache

# Expose the port your application runs on
EXPOSE 8000

# Command to run the application
CMD ["uv", "run", "fastapi", "run", "main.py"]