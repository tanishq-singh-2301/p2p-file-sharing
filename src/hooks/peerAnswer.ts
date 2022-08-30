import peerConfig from "@/utils/peerConfig";
import { useEffect } from "react";
import { SendJsonMessage, WebSocketLike } from "react-use-websocket/dist/lib/types";

interface SocketMessage {
	type?: string;
	sdp?: string;
	myId?: string;
	candidate?: string;
}

interface PeerAnswerInterface {
    send: SendJsonMessage;
    ws: WebSocketLike | null;
    myId: string | null;
}

const PeerAnswer = ({ myId, send, ws }: PeerAnswerInterface) => {
	const pc = new RTCPeerConnection(peerConfig);
	
	useEffect(() => {
        if(!ws || !myId) return;

        ws.onmessage = async ({ data: rawData }) => {
            if (rawData.length === 0) return;

			try {
				const { type: dataType } = JSON.parse(rawData);

				if (dataType === "sendto") {
					const { type: messageType, myId: connectTo, sdp, candidate } = JSON.parse(rawData)?.message as SocketMessage;

					if (!messageType || !connectTo) return;

                    pc.onicecandidate = async ({ candidate }) => candidate && send({
                        type: "sendto",
                        sendTo: connectTo,
                        message: {
                            type: "candidate",
                            candidate: JSON.stringify(candidate),
                            myId,
                        },
                    });

                    switch (messageType) {
						case "can-i-get-a-offer":
							await pc.createOffer().then(async (offer) => {
								await pc.setLocalDescription(offer);

								send({
									type: "sendto",
									sendTo: connectTo,
									message: {
										type: "offer",
										sdp: JSON.stringify(offer),
										myId,
									},
								});
							});
							break;

						case "answer":
							sdp && await pc.setRemoteDescription(JSON.parse(sdp));
							break;

						case "candidate":
							candidate && await pc.addIceCandidate(JSON.parse(candidate));
							break;
					}
                }

                else if (dataType === "pong"){
                    console.warn("Maintaining ws")
                }
            }
            catch(error) {
                console.error(error);
            }
        }

		// eslint-disable-next-line
    }, []);

    return pc;
}

export default PeerAnswer;