import type {ErrorComponentProps} from "@tanstack/react-router";

export default function ErrorComponent({ error }: ErrorComponentProps) {
	let statusCode = 500;

	if (error instanceof Error) {
		const match = error.message.match(/(\d{3})/);
		if (match) {
			statusCode = parseInt(match[1]);
		}
	}

	if (!statusCode || statusCode < 100 || statusCode > 599) {
		statusCode = 500;
	}

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				minHeight: "100vh",
				padding: "20px",
				fontFamily: "system-ui, -apple-system, sans-serif",
			}}
		>
			<h1>Oops! Error {statusCode}</h1>
			<img
				src={`https://http.cat/${statusCode}`}
				alt={`HTTP ${statusCode} error cat`}
				style={{
					maxWidth: "100%",
					height: "auto",
					marginTop: "20px",
					borderRadius: "8px",
				}}
			/>
			<p style={{ marginTop: "20px" }}>
				{error.message || "Something went wrong"}
			</p>
			<button
				onClick={() => (window.location.href = "/")}
				style={{
					marginTop: "20px",
					padding: "10px 20px",
					backgroundColor: "#007bff",
					color: "white",
					border: "none",
					borderRadius: "4px",
					cursor: "pointer",
					fontSize: "16px",
				}}
			>
				Go Home
			</button>
		</div>
	);
}
