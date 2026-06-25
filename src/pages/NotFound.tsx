export default function NotFound() {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				minHeight: "100vh",
				padding: "20px",
			}}
		>
			<h1>Error 404</h1>

			<img
				src={`https://http.cat/404`}
				alt={`HTTP 404 error`}
				style={{
					maxWidth: "500px",
					width: "100%",
					height: "auto",
					marginTop: "20px",
					borderRadius: "8px",
				}}
				onError={(e) => {
					const img = e.target as HTMLImageElement;
					img.src = `https://http.cat/404`;
				}}
			/>

			<p
				style={{
					marginTop: "20px",
					maxWidth: "500px",
					textAlign: "center",
				}}
			>
				Page not found
			</p>

			<button
				onClick={() => (window.location.href = "/")}
				style={{
					marginTop: "20px",
					padding: "10px 20px",
					backgroundColor: "#007bff",
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
