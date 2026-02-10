FROM node:20-bullseye

# Install PHP and dependencies
RUN apt-get update && apt-get install -y \
    php \
    php-cli \
    php-common \
    php-mbstring \
    php-xml \
    php-bcmath \
    php-pgsql \
    php-zip \
    php-curl \
    unzip \
    curl \
    git \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Create user for Hugging Face (optional but safer)
RUN useradd -m -u 1000 user

# Set working directory and ownership
WORKDIR /app
RUN chown -R user:user /app

# Switch to user (Hugging Face runs as 1000 by default in some spaces)
USER user

# Copy package files
COPY --chown=user:user package.json package-lock.json ./
RUN npm install

# Copy composer files
COPY --chown=user:user composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader

# Copy the rest of the application
COPY --chown=user:user . .

# Build frontend assets if needed (Vite)
RUN npm run build

# Expose port 7860 (Hugging Face default)
EXPOSE 7860

# Start command: Use port 7860 for the web interface
CMD ["npx", "concurrently", "php artisan serve --host=0.0.0.0 --port=7860", "npm run dev", "node bot/index.js"]
