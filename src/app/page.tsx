import Hero from "@/components/hero";
import AboutSection from "@/components/about-section";
import PageWrapper from "@/components/page-wrapper";

export default function Home() {
	return (
		<PageWrapper>
			<main className="flex min-h-screen flex-col justify-center items-center">
				<Hero />
				<AboutSection />
			</main>
		</PageWrapper>
	);
}
