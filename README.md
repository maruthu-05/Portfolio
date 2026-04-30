# Portfolio Website

This folder contains a self-contained portfolio website.

## Files

- `index.html` is the page.
- `styles.css` controls the layout and visual design.
- `script.js` loads the local profile data.
- `profile.json` is where you can place your GitHub, LinkedIn, and resume path.
- `links.txt` is also supported if you prefer a plain text file.

## How to use

1. Put your resume file in this folder and name it `resume.pdf`, or change the `resume` field in `profile.json` or `links.txt`.
2. Replace the placeholder values in `profile.json` or `links.txt` with your real GitHub and LinkedIn URLs or ids.
3. Open `index.html` in a browser, or serve the folder with any static file server.

## links.txt format

Use one value per line, for example:

```text
name: Your Name
email: you@example.com
github: your-github-id
linkedin: your-linkedin-id
resume: resume.pdf
```
