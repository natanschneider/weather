import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import ErrorComponent from "@/pages/ErrorComponent";
import NotFound from "@/pages/NotFound";

export function getRouter() {
	const router = createTanStackRouter({
		defaultNotFoundComponent: () => <NotFound />,
		defaultErrorComponent: ({ error, reset }) => (
			<ErrorComponent error={error} reset={reset} />
		),
		routeTree,
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
	});

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
