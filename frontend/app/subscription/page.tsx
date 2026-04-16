"use client";

import { AppShell } from "@/components/layout/AppShell";
import {
	eyebrowClass,
	ledeClass,
	mutedClass,
	nestedPanelClass,
	pageTitleClass,
	panelClass,
	sectionTitleClass,
	statCardClass,
	statsGridClass,
	statValueClass,
} from "@/lib/ui";

export default function SubscriptionPage() {
	return (
		<AppShell>
			<section className={panelClass}>
				<div className="flex flex-col gap-3">
					<p className={eyebrowClass}>Account</p>
					<h1 className={pageTitleClass}>Subscription</h1>
					<p className={ledeClass}>Track the mocked plan and usage envelope for the MVP.</p>
				</div>
				<div className={statsGridClass}>
					<article className={statCardClass}>
						<div className={mutedClass}>Plan</div>
						<strong className={statValueClass}>Starter</strong>
					</article>
					<article className={statCardClass}>
						<div className={mutedClass}>Seats</div>
						<strong className={statValueClass}>1 / 3</strong>
					</article>
					<article className={statCardClass}>
						<div className={mutedClass}>Voice minutes</div>
						<strong className={statValueClass}>420</strong>
					</article>
				</div>
				<article className={nestedPanelClass}>
					<h2 className={sectionTitleClass}>Subscription readiness</h2>
					<p className={ledeClass}>Subscription controls are simulated in this MVP and can be connected to a real provider later.</p>
				</article>
			</section>
		</AppShell>
	);
}