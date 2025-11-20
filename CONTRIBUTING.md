# Contributing to Discord Clone

Thank you for your interest in contributing! Here are some guidelines.

## How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Test thoroughly**
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

## Code Style

### JavaScript
- Use ES6+ features
- 2 spaces for indentation
- Semicolons required
- Use `const` and `let`, not `var`
- Meaningful variable names

### CSS
- Follow BEM naming convention when possible
- Use CSS variables for colors
- Mobile-first responsive design
- Comment complex selectors

### SQL
- UPPERCASE keywords
- snake_case for table and column names
- Proper indexing on foreign keys

## Project Structure

```
discord-clone/
├── server/              # Backend code
│   ├── routes/         # API endpoints
│   ├── middleware/     # Express middleware
│   ├── database.js     # Database connection
│   ├── socket.js       # WebSocket handlers
│   └── server.js       # Main server file
├── public/             # Frontend code
│   ├── css/           # Stylesheets
│   ├── js/            # JavaScript files
│   ├── index.html     # Login page
│   └── app.html       # Main app
└── README.md
```

## Adding New Features

### Backend API Endpoint
1. Create route file in `server/routes/`
2. Add middleware if needed
3. Import and use in `server.js`
4. Update API documentation

### Frontend Feature
1. Add HTML structure in appropriate file
2. Style in CSS files
3. Add JavaScript functionality
4. Ensure mobile responsive

### WebSocket Event
1. Add handler in `server/socket.js`
2. Add client listener in `public/js/`
3. Document in API.md

## Testing

Before submitting:
1. Test all new features
2. Check browser console for errors
3. Verify database queries work
4. Test on different browsers
5. Check mobile responsiveness

## Bug Reports

Include:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/OS information
- Screenshots if applicable

## Feature Requests

Include:
- Clear description
- Use case
- Proposed implementation (optional)
- Any relevant examples

## Security

If you find a security vulnerability:
- **DO NOT** open a public issue
- Email details privately
- Allow time for a fix before disclosure

## Questions?

Feel free to open an issue for questions or clarifications.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
