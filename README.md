# Personal Website (GitHub Pages Starter)

Barebone static starter for a personal site.

## Files

- `index.html` - main page
- `styles.css` - basic styles
- `script.js` - tiny JS helper

## Publish on GitHub Pages

1. Create a GitHub repository named `<your-username>.github.io`.
2. Push these files to the `main` branch.
3. In GitHub: `Settings` > `Pages`.
4. Under **Build and deployment**:
   - Source: `Deploy from a branch`
   - Branch: `main` and `/ (root)`
5. Save. Your site will be live at `https://<your-username>.github.io`.

## Local preview

Open `index.html` directly, or run a simple local server:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.
