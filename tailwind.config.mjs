/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				indochine: {
					teal: '#2D5F5D',
					emerald: '#4A6F4F',
				},
				primary: {
					green: '#9DAF73',
				},
				brass: {
					gold: '#C8A97E',
					mustard: '#D4A547',
					tarnished: '#9B7E52',
				},
				cream: {
					rice: '#F9F5E3',
					accent: '#F9F5E3',
				},
				beige: {
					sand: '#F1E7D6',
					light: '#ECE4DE',
				},
				white: {
					warm: '#F6EFE9',
					cool: '#FAFAF8',
				},
				mahogany: {
					dark: '#4A3B2A',
				},
				walnut: {
					brown: '#3A2F2A',
				},
				ebony: {
					black: '#1F1C1A',
				},
				charcoal: {
					wood: '#241A0F',
				},
				text: {
					brown: '#4A3B2A',
					main: '#3A2F2A',
				},
				burnt: {
					sienna: '#9C5532',
				},
				grey: {
					subtle: '#CCCCCC',
				},
				black: {
					off: '#141110',
				},
				brown: {
					dark: '#1F1C1A',
				}
			},
			fontFamily: {
				serif: ['Merriweather', 'serif'],
				sans: ['Open Sans', 'sans-serif'],
			},
			spacing: {
				'xs': '8px',
				'sm': '16px',
				'md': '24px',
				'lg': '40px',
				'xl': '60px',
				'2xl': '80px',
				'3xl': '120px',
			},
			boxShadow: {
				'sm': '0 2px 10px rgba(0, 0, 0, 0.05)',
				'md': '0 5px 20px rgba(0, 0, 0, 0.08)',
				'lg': '0 10px 30px rgba(0, 0, 0, 0.12)',
				'xl': '0 15px 45px rgba(0, 0, 0, 0.2)',
				'brass': '0 5px 20px rgba(200, 169, 126, 0.3)',
				'teal': '0 8px 20px rgba(45, 95, 93, 0.3)',
			},
			transitionTimingFunction: {
				'smooth': 'cubic-bezier(0.22, 1, 0.36, 1)',
			},
			borderRadius: {
				'pill': '50px',
				'round': '60px',
			}
		},
	},
	plugins: [],
}
