import { useContext, useEffect, useState } from "react";
import { WebSocketCtx } from "@/context/websocket";
import peerConfig from "@/utils/peerConfig";

interface SocketMessage {
	type?: string;
	sdp?: string;
	myId?: string;
	candidate?: string;
}

const Sender = () => {
	const { uuid, ws, send } = useContext(WebSocketCtx);
	const [online, setOnline] = useState<boolean>(false);

	useEffect(() => {
		let pc = new RTCPeerConnection(peerConfig);
		let dc = pc.createDataChannel("data-channel");

		(window as any).send = (data: string) => dc?.send(data);
		(window as any).ws = ws;

		dc.addEventListener("close", () => {
			console.log("Closed");
			setOnline(false);
		});

		dc.addEventListener("message", ({ data }) => console.log(data));

		dc.addEventListener("open", () => {
			ws?.close();
			setOnline(true);
			console.log("Opened");
		});

		pc.addEventListener("connectionstatechange", () =>
			console.warn(pc.connectionState)
		);

		if (!ws) return;

		ws.onmessage = async ({ data: rawData }) => {
			if (typeof rawData !== "string") return;
			if (rawData.length === 0) return;

			try {
				const { type } = JSON.parse(rawData);

				if (type === "sendto") {
					const { type, myId, sdp, candidate } = JSON.parse(rawData)?.message as SocketMessage;

					if (!type || !myId) return;

					pc.addEventListener(
						"icecandidate",
						({ candidate }) =>
							candidate &&
							send({
								type: "sendto",
								sendTo: myId,
								message: {
									type: "candidate",
									candidate: JSON.stringify(candidate),
									myId: uuid,
								},
							})
					);

					switch (type) {
						case "can-i-get-a-offer":
							await pc.createOffer().then(async (offer) => {
								await pc.setLocalDescription(offer);

								send({
									type: "sendto",
									sendTo: myId,
									message: {
										type: "offer",
										sdp: JSON.stringify(offer),
										myId: uuid,
									},
								});
							});

							break;

						case "answer":
							if (sdp)
								await pc.setRemoteDescription(JSON.parse(sdp));

							break;

						case "candidate":
							if (candidate)
								await pc.addIceCandidate(JSON.parse(candidate));

							break;

						default:
							break;
					}
				}

                else if (type === "pong"){
                    console.warn("Maintaining ws")
                }
			} catch (error) {
				console.error(error as Error);
			}
		};

		// eslint-disable-next-line
	}, []);

	return (
		<div>
			{online ? <span>Connected</span> : <span>Not connected</span>}
		</div>
	);
};

export default Sender;
