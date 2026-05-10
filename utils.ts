@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Quicksand", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Quicksand", sans-serif;

  /* Natural Base Palette */
  --color-natural-beige: #F7F3EE;
  --color-natural-earth: #5D5750;
  
  --color-natural-green-muted: #DCE4D1;
  --color-natural-green-strong: #A3B18A;
  --color-natural-green-deep: #4A5D23;
  
  --color-natural-peach-muted: #EAC0BD;
  --color-natural-peach-strong: #8C5F5B;
  
  --color-natural-blue-muted: #B4D4EE;
  --color-natural-blue-strong: #547BA0;
  
  --color-natural-yellow-muted: #F3E99F;
  --color-natural-yellow-strong: #A69A3B;
  
  /* Dynamic Variables */
  --color-accent-muted: var(--theme-accent-muted, #DCE4D1);
  --color-accent-strong: var(--theme-accent-strong, #A3B18A);
  --color-accent-deep: var(--theme-accent-deep, #4A5D23);

  --color-bg-primary: var(--theme-bg, #F7F3EE);
  --color-text-main: var(--theme-text, #5D5750);
  --color-text-muted: var(--theme-text-muted, #8E8881);
}

@layer base {
  body {
    @apply bg-bg-primary text-text-main font-sans transition-colors duration-300;
  }
}

.dark {
  --theme-bg: #1A1A1A;
  --theme-text: #FDFCFB;
  --theme-text-muted: #BDB9B1;
  
  --color-natural-beige: #2A2825;
  --color-natural-earth: #FDFCFB;
  
  & .bento-card {
    @apply bg-white/5 border-white/10;
  }
  
  & aside {
    @apply bg-white/5 border-white/5;
  }

  & header, & footer {
    @apply text-white;
  }
}

.bento-card {
  @apply bg-white/70 border-[1.5px] border-[#E6DFD6] rounded-[24px] backdrop-blur-md shadow-sm transition-all duration-300;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #D1C7BD;
  border-radius: 10px;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

