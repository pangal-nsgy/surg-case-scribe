# Contributing to ACGME Case Log Assistant

Thank you for considering contributing to the ACGME Case Log Assistant project!

## Development Workflow

We follow a GitFlow-inspired branching model:

1. **`main` branch**: Production-ready code. Protected and requires code review before merges.
2. **`develop` branch**: Integration branch for ongoing development.
3. **Feature branches**: Create from `develop` for new features.
4. **Hotfix branches**: Create from `main` for urgent fixes.

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a new branch from `develop` for your work
   ```
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

## Making Changes

1. Make your changes
2. Ensure the code passes linting: `npm run lint`
3. Make sure the application builds: `npm run build`
4. Commit your changes with a descriptive message

## Pull Request Process

1. Push your branch to your fork
2. Create a pull request against the `develop` branch
3. Fill out the PR template completely
4. Request review from the relevant code owners
5. Address any feedback from reviews

## Commit Message Format

We use conventional commits formatting:

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, missing semicolons)
- `refactor:` - Code changes that neither fix bugs nor add features
- `test:` - Adding or modifying tests
- `chore:` - Changes to the build process or auxiliary tools

Example: `feat: add file upload component`

## Code Style

This project uses ESLint and Prettier for code formatting.

## Release Process

1. Changes merged to `develop` are deployed to staging environments
2. When ready for release, we create a PR from `develop` to `main`
3. After approval, the PR is merged and tagged with a version number
4. The `main` branch is automatically deployed to production 