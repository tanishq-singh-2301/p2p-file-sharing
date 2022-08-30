import { useEffect, useState } from "react";
import {
	SendJsonMessage,
	WebSocketLike,
} from "react-use-websocket/dist/lib/types";
import peerConfig from "@/utils/peerConfig";

interface PeerOfferInterface {
	ws: WebSocketLike | null;
	send: SendJsonMessage;
	connectTo: string | null;
	myId: string | null;
}

interface SocketMessage {
	type?: string;
	sdp?: string;
	myId?: string;
	candidate?: string;
}

const PeerOffer = ({ connectTo, send, ws, myId }: PeerOfferInterface) => {
	const pc = new RTCPeerConnection(peerConfig);
	const [ready, setReady] = useState<boolean>(true);

	useEffect(() => {
		if (!ws || !myId || !connectTo) return;

		ws.onmessage = async ({ data: rawData }) => {
			if (rawData.length === 0) return;
			if (!pc) return;

			try {
				const { type: dataType } = JSON.parse(rawData);

				if (dataType === "sendto") {
					const {
						type: messageType,
						myId,
						sdp,
						candidate,
					} = JSON.parse(rawData)?.message as SocketMessage;

					if (!messageType || !myId) return;

					switch (messageType) {
						case "offer":
							if (!sdp) return;
							await pc.setRemoteDescription(JSON.parse(sdp));

							await pc.createAnswer().then(async (answer) => {
								await pc.setLocalDescription(answer);

								send({
									type: "sendto",
									sendTo: connectTo,
									message: {
										type: "answer",
										sdp: JSON.stringify(answer),
										myId,
									},
								});
							});
							break;

						case "candidate":
							candidate &&
								(await pc.addIceCandidate(
									JSON.parse(candidate)
								));

							break;
					}
				} else if (dataType === "pong") {
					console.warn("Maintaining ws");
				}
			} catch (error) {
				console.error(error);
			}
		};

		// eslint-disable-next-line
	}, [connectTo, myId]);

	useEffect(() => {
		if (!ws || !myId || !connectTo) return;

		if (ready) {
			send({
				type: "sendto",
				sendTo: connectTo,
				message: {
					type: "can-i-get-a-offer",
					myId,
				},
			});

			setReady(false);
		}

		pc.onicecandidate = ({ candidate }) =>
			candidate &&
			send({
				type: "sendto",
				sendTo: connectTo,
				message: {
					type: "candidate",
					candidate: JSON.stringify(candidate),
					myId,
				},
			});

		// eslint-disable-next-line
	}, [pc]);

	return pc;
};

export default PeerOffer;