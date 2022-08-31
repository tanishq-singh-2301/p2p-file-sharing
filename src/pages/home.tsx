import Sender from "@/components/sender";
import { useRef, useState, useContext } from "react";
import { WebSocketCtx } from "@/context/websocket";

const Home = () => {
	const input = useRef<HTMLInputElement | null>(null);
	const { uuid } = useContext(WebSocketCtx);
	const [listen, setListen] = useState<File | null>(null);
	const [url, setUrl] = useState<string>("");

	return (
		<div className="h-full w-full">
			<main className="h-full w-full flex flex-col justify-center items-center">
				<input
					type="file"
					ref={input}
					multiple
					onChange={() => {
						if (
							uuid &&
							uuid.length &&
							input.current &&
							input.current.files &&
							input.current.files[0]
						) {
							setUrl(window.location.href.concat(uuid));
							setListen(input.current.files[0]);
						}
					}}
				/>

				{listen && <Sender file={listen} />}

				{url && <span className="text-base font-semibold">{url}</span>}
			</main>
		</div>
	);
};

export default Home;
