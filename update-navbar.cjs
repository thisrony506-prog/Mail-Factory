const fs = require('fs');
let code = fs.readFileSync('Navbar.tsx', 'utf-8');
code = code.replace("import { motion, AnimatePresence } from 'motion/react';\n", "");

code = code.replace(/<AnimatePresence>/g, "");
code = code.replace(/<\/AnimatePresence>/g, "");

// Backdrop motion.div -> div
code = code.replace(
  /<motion\.div\s*initial=\{\{ opacity: 0 \}\}\s*animate=\{\{ opacity: 1 \}\}\s*exit=\{\{ opacity: 0 \}\}\s*transition=\{\{ duration: 0\.2 \}\}\s*className="([^"]+)"/g,
  '<div className="$1 animate-fade-in"'
);

// Drawer motion.div -> div
code = code.replace(
  /<motion\.div\s*initial=\{\{ x: '-100%' \}\}\s*animate=\{\{ x: 0 \}\}\s*exit=\{\{ x: '-100%' \}\}\s*transition=\{\{[^}]+\}\}\s*className="([^"]+)"/g,
  '<div className="$1 animate-slide-in-right"'
);

code = code.replace(/<\/motion\.div>/g, "</div>");

fs.writeFileSync('Navbar.tsx', code);
