import Hero from "@/components/Hero";
import AboutSection from "@/components/About-Section";

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center">
			<Hero />
			<AboutSection />
		</main>
	);
}
