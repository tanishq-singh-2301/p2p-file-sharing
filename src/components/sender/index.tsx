import { useContext, useEffect } from "react";
import { WebSocketCtx } from '@/context/websocket';
import peerConfig from '@/utils/peerConfig';

interface SocketMessage {
    type?: string;
    sdp?: string;
    myId?: string;
    candidate: string;
}

const Sender = () => {
    const { uuid, ws, send } = useContext(WebSocketCtx);

    useEffect(() => {
        const pc = new RTCPeerConnection(peerConfig);
        const dc = pc.createDataChannel("data-channel");

        (window as any).send = (data: string) => dc?.send(data);

        dc.addEventListener("close", () => console.log("Closed"));
        dc.addEventListener("message", ({ data }) => console.log(data));
        dc.addEventListener("open", () => {
            ws?.close();
            console.log("Opened");
        });

        if (!ws) return;

        ws.onmessage = async ({ data: rawData }) => {
            if (typeof rawData !== "string") return;
            if (rawData.length === 0) return;

            try {
                const { type, myId, sdp, candidate } = (JSON.parse(rawData)?.message as SocketMessage);

                if (!type || !myId) return;

                switch (type) {
                    case "can-i-get-a-offer":
                        const offer = await pc.createOffer();
                        pc.setLocalDescription(offer);

                        const addCandidate = ({ candidate }: RTCPeerConnectionIceEvent) => {
                            send({
                                type: "sendto",
                                sendTo: myId,
                                message: {
                                    type: "offer",
                                    sdp: JSON.stringify(pc.localDescription),
                                    myId: uuid,
                                    candidate: JSON.stringify(candidate)
                                }
                            });

                            pc.removeEventListener("icecandidate", addCandidate)
                        }

                        pc.addEventListener("icecandidate", addCandidate);
                        break;

                    case "answer":
                        if (!sdp || !candidate) return;

                        await pc.setRemoteDescription(JSON.parse(sdp));
                        await pc.addIceCandidate(new RTCIceCandidate(JSON.parse(candidate)));
                        break;
                }
            } catch (error) {
                console.error(error);
            }
        }

        // eslint-disable-next-line
    }, []);

    return (
        <div></div>
    )
}

export default Sender;