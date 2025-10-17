
# TSun WhatsApp Chat Viewer

<div align="center">
  <img src="https://cdn-icons-png.flaticon.com/512/5968/5968841.png" alt="TSun Chat Viewer Logo" width="120" />
</div>

<h3 align="center">
  Transform your plain WhatsApp chat exports into a stunning, interactive, and luxurious visual experience.
</h3>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Badge"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript Badge"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS Badge"/>
</p>

---

## ✨ Overview

TSun Chat Viewer is not just another text file reader. It's a sophisticated web application designed to parse and display your exported WhatsApp chats in a beautiful, modern, and feature-rich interface. Built with a focus on aesthetics and user experience, it brings your conversations to life with a stunning glassmorphism design, rich text formatting, and powerful search capabilities.

<br>

<div align="center">
  <img src="https://i.imgur.com/gOJZLdF.png" alt="Screenshot of TSun Chat Viewer Interface" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);" />
  <p><em>The elegant "Milk White Glass" interface in action.</em></p>
</div>

<br>

## 🚀 Key Features

- **Load from Gist URL:** Securely view your chats by simply pasting the raw URL of a GitHub Gist. Your chat data is fetched directly by your browser and is never stored on a server.
- **Stunning Glassmorphism UI:** A luxurious "blurry glass" design that feels modern and elegant. The entire interface is built with layered, semi-transparent elements that create a sense of depth.
- **Light & Dark Modes:** A seamless theme-toggle experience that maintains the beautiful glass effect in both light (Milk White Glass) and dark (Deep Space Glass) modes.
- **Full Text Formatting Support:** Renders all standard WhatsApp formatting and more:
  - `*bold text*` ⮕ **bold text**
  - `_italic text_` ⮕ *italic text*
  - `~strikethrough~` ⮕ ~~strikethrough~~
  - ```monospace``` ⮕ `monospace`
  - **Custom Color Codes:** Supports special syntax (`[ff8800]text`) for colored text, perfect for styled messages.
- **Powerful Real-time Search:** Instantly search your entire chat history. Search results are highlighted in real-time for easy visibility without losing context.
- **Fully Responsive:** Enjoy a pixel-perfect experience whether you're on a desktop, tablet, or mobile device.
- **Custom Styled Scrollbar:** A sleek, minimalist scrollbar that complements the UI and replaces the clunky browser default.

## 🛠️ How to Use

Follow these simple steps to view your chat:

1.  **Export Your WhatsApp Chat:**
    - Open the WhatsApp chat you want to view.
    - Tap the three-dots menu (⋮) > `More` > `Export chat`.
    - Choose **"Without media"** for the fastest and most compatible experience.
    - Save the resulting `.txt` file to your device.

2.  **Create a GitHub Gist:**
    - Go to [gist.github.com](https://gist.github.com/).
    - Open the exported `.txt` file on your computer and copy its entire content.
    - Paste the content into the main text area of the Gist.
    - Give it a filename (e.g., `whatsapp-chat.txt`).
    - Click the **"Create public gist"** button.

3.  **Get the Raw URL:**
    - On the Gist page, find the **"Raw"** button in the top-right corner of your file.
    - Click it. This will open a new page displaying the plain text content.
    - **Copy the URL** from your browser's address bar. It should look something like `https://gist.githubusercontent.com/.../raw/.../chat.txt`.

4.  **Load in TSun Chat Viewer:**
    - Open the TSun Chat Viewer application.
    - Paste the raw Gist URL into the input modal that appears.
    - Click **"View Chat"** and enjoy the magic!

## 💻 Tech Stack

This project is built with a modern, performant, and scalable tech stack:

- **Frontend:** [React](https://react.dev/) (with Hooks)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Icons8](https://icons8.com)

## 🙏 Credits & Acknowledgements

- **Development:** Made With 🫀 By ༯𝙎ค૯𝙀𝘿✘🫀
- **Studio:** All Credits To TSun Studio
- **Icons:** Beautiful 3D icons provided by [Icons8](https://icons8.com).

---

This project is open-source and available for personal use. Feel free to fork, modify, and share!
