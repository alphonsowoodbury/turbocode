"""Main application entry point for Turbo."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from turbo.utils.config import get_settings


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = get_settings()

    app = FastAPI(
        title="Turbo API",
        description="AI-powered local project management and development platform",
        version="1.0.0",
        debug=settings.debug,
    )

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.security.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Add API routes
    from turbo.api.v1 import router as api_router
    app.include_router(api_router)

    @app.get("/")
    async def root():
        """Root endpoint."""
        return {"message": "Turbo API", "version": "1.0.0"}

    @app.get("/health")
    async def health_check():
        """Health check endpoint."""
        return {"status": "healthy"}

    return app


# Create the app instance
app = create_app()


if __name__ == "__main__":
    import uvicorn
    settings = get_settings()

    uvicorn.run(
        "turbo.main:app",
        host=settings.api.host,
        port=settings.api.port,
        reload=settings.api.reload,
    )