"use client"

import { useState, useEffect } from "react"
import { Github, Twitter, Instagram, Youtube, MessageCircle, Music, ArrowUpRight } from "lucide-react"

const socialLinks = [
	
	
	
	
	
	
	
	{
		name: "Twitter",
		icon: Twitter,
		href: "https://x.com/_Delmu",
		username: "@_Delmu",
		bio: "たまに動画作る厨二病のひと...",
	},
	{
		name: "Instagram",
		icon: Instagram,
		href: "https://www.instagram.com/_delmu/",
		username: "@_delmu",
		bio: "品性の欠片も無いです。リョ...",
	},
	{
		name: "YouTube",
		icon: Youtube,
		href: "https://www.youtube.com/@Delmu",
		username: "@Delmu",
		bio: "🇯🇵/20↑ All fiction. My delusion. ",
	},
	
	
	
	
	
	
	
	
	
	
	
	
	
	
]

export function SocialLinks() {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
	const [introPhase, setIntroPhase] = useState<"hidden" | "sweep" | "done">("hidden")
	const [itemsVisible, setItemsVisible] = useState(false)

	useEffect(() => {
		const handleStartSocialAnimation = () => {
			setIntroPhase("sweep")
		}

		window.addEventListener("startSocialAnimation", handleStartSocialAnimation)
		return () => window.removeEventListener("startSocialAnimation", handleStartSocialAnimation)
	}, [])

	useEffect(() => {
		if (introPhase === "sweep") {
			const timer = setTimeout(() => {
				setIntroPhase("done")
				setItemsVisible(true)
			}, 500)
			return () => clearTimeout(timer)
		}
	}, [introPhase])





	return (
		<div className="relative p-6 card overflow-hidden">
			<div
				className="absolute inset-0 bg-white z-30 pointer-events-none"
				style={{
					clipPath:
						introPhase === "hidden"
							? "inset(0 100% 0 0)"
							: introPhase === "sweep"
							? "inset(0 0 0 0)"
							: "inset(0 0 0 100%)",
					transition: "clip-path 0.5s cubic-bezier(0.32, 0.72, 0, 1)",
				}}
			/>

			<div className="space-y-1">
				{socialLinks.map((link, index) => (
					<a
						key={link.name}
					href={link.href}
							target="_blank"
							rel="noopener noreferrer"
						className="group relative block overflow-hidden"
						onMouseEnter={() => setHoveredIndex(index)}
						onMouseLeave={() => setHoveredIndex(null)}
						style={{
							opacity: itemsVisible ? 1 : 0,
							transform: itemsVisible ? "translateY(0)" : "translateY(10px)",
							transition: "opacity 0.3s ease, transform 0.3s ease",
							transitionDelay: `${index * 0.05}s`,
						}}
					>
						<div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
							<div
								className="absolute top-0 bottom-0 left-0 bg-white"
								style={{
									width: hoveredIndex === index ? "50%" : "0%",
									transition: "width 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
								}}
							/>
							<div
								className="absolute top-0 bottom-0 right-0 bg-white"
								style={{
									width: hoveredIndex === index ? "50%" : "0%",
									transition: "width 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
								}}
							/>
						</div>

						<div
							className="flex items-center gap-4 p-3 -mx-1 relative z-10"
							style={{
								transition: "all 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
							}}
						>
							<div
								className="w-10 h-10 flex items-center justify-center border flex-shrink-0"
								style={{
									backgroundColor: hoveredIndex === index ? "black" : "rgba(255,255,255,0.05)",
									borderColor: hoveredIndex === index ? "black" : "rgba(255,255,255,0.1)",
									transition: "all 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
								}}
							>
								<link.icon
									className="w-4 h-4"
									style={{
										color: hoveredIndex === index ? "white" : "rgba(255,255,255,0.7)",
										transition: "color 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
									}}
								/>
							</div>

							<div className="flex-1 min-w-0">
								<span
									className="text-sm block font-medium"
									style={{
										color: hoveredIndex === index ? "black" : "rgba(255,255,255,0.8)",
										transition: "color 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
									}}
								>
									{link.name}
								</span>

								<div
									className="overflow-hidden"
									style={{
										maxHeight: hoveredIndex === index ? "40px" : "0px",
										opacity: hoveredIndex === index ? 1 : 0,
										transition: "max-height 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease",
									}}
								>
									<span className="text-xs text-black/60 block mt-0.5">{link.username}</span>
									<span className="text-[11px] text-black/40 block truncate">{link.bio}</span>
								</div>
							</div>

							<ArrowUpRight
								className="w-4 h-4 flex-shrink-0"
								style={{
									color: hoveredIndex === index ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.2)",
									transform: hoveredIndex === index ? "translate(2px, -2px)" : "translate(0, 0)",
									transition: "all 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
								}}
							/>
						</div>
					</a>
				))}
			</div>



		</div>
	)
}
