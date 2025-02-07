FROM python:3.12-slim

WORKDIR /app

ENV PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=0 \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    POETRY_VIRTUALENVS_CREATE=false \
    POETRY_NO_INTERACTION=1

RUN groupadd --system deploy && useradd --system -g deploy deploy

RUN pip install "poetry==1.8.4"

COPY pyproject.toml poetry.lock ./
RUN poetry install --no-root --no-dev

COPY . .

USER deploy

ENTRYPOINT ["bash", "entrypoint.sh"]

EXPOSE 8000

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]
