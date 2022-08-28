import { useContext, useEffect, useState } from "react";
import { WebSocketCtx } from '@/context/websocket';
import peerConfig from '@/utils/peerConfig';

interface SocketMessage {
    type?: string;
    sdp?: string;
    myId?: string;
}

const Sender = () => {
    const [inUse, setInUse] = useState<boolean>(false);
    const { uuid, ws, send } = useContext(WebSocketCtx);

    useEffect(() => {
        const pc = new RTCPeerConnection(peerConfig);
        const dc = pc.createDataChannel("data-channel");

        dc.addEventListener("open", () => setInUse(true));
        dc.addEventListener("close", () => setInUse(false));
        dc.addEventListener("message", ({ data }) => console.log(data));

        if (!ws) return;

        ws.onmessage = async ({ data: rawData }) => {
            if (typeof rawData !== "string") return;
            if (rawData.length === 0) return;

            try {
                const { type, myId, sdp } = (JSON.parse(rawData)?.message as SocketMessage);

                if (!type || !myId) return;

                switch (type) {
                    case "can-i-get-a-offer":
                        if (inUse) {
                            send({
                                type: "sendto",
                                sendTo: myId,
                                message: {
                                    type: "inuse",
                                    sdp: "",
                                    myId: uuid
                                }
                            });

                            return;
                        }

                        const offer = await pc.createOffer();
                        pc.setLocalDescription(offer);

                        const addCandidate = () => {
                            send({
                                type: "sendto",
                                sendTo: myId,
                                message: {
                                    type: "offer",
                                    sdp: JSON.stringify(pc.localDescription),
                                    myId: uuid
                                }
                            });

                            pc.removeEventListener("icecandidate", addCandidate)
                        }

                        pc.addEventListener("icecandidate", addCandidate);
                        break;

                    case "answer":
                        if (!sdp) return;
                        await pc.setRemoteDescription(JSON.parse(sdp));
                        break;
                }
            } catch (error) {
                console.error(error);
            }
        }

        // eslint-disable-next-line
    }, []);

    return (
        <div>

        </div>
    )
}

export default Sender;