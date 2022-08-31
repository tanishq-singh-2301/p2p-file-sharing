import { useEffect, useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import { WebSocketCtx } from "@/context/websocket";
import usePeerOffer from '@/hooks/peerOffer';

interface ReceivedFile {
	name: string;
	size: number;
	type: string;
	arrayBuffer: any;
	receivedSize: number;
}

const DownloadPage = () => {
	const { pathname } = useLocation();
	const { send, uuid: myId, ws } = useContext(WebSocketCtx);
	const pc = usePeerOffer({ connectTo: pathname.split("/")[1], myId, send, ws, });
	const [dc, setDC] = useState<Map<string, RTCDataChannel>>(new Map());
	const [file, setFile] = useState<ReceivedFile | null>(null);


	useEffect(() => {
		window.onbeforeunload = () => pc.close();
		window.onunload = () => pc.close();
		const localDc = new Map<string, RTCDataChannel>(new Map());
		
		pc.ondatachannel = ({ channel }) => {
			channel.onclose = () => console.log(channel.label, " :: Closed");
			channel.onopen = () => {
				ws?.close();
				console.log(channel.label, " :: Opened");
			};

			localDc.set(channel.label, channel);
			setDC(localDc);
		};

		// eslint-disable-next-line
	}, [pc]);

	useEffect(() => {
		const labels = [...dc.keys()];
		if(labels.length !== 2) return;

		const infoDc = dc.get("file-info");
		const dataDc = dc.get("file-data");

		if(!dataDc || !infoDc) return;

		dataDc.binaryType = "arraybuffer";

		infoDc.onmessage = ({ data: rawData }) => {
			try {
				const { type, data } = JSON.parse(rawData);

				switch (type) {
					case "file-info":
						setFile({
							arrayBuffer: [],
							name: data.name,
							receivedSize: 0,
							size: data.size,
							type: data.type
						});
						break;
				}
			}
			catch (error) {
				console.error(error);
			}
		}

		dataDc.onmessage = ({ data }) => {
			if(!file) return;

			const arrayBuffer = data as ArrayBuffer;
			const tempBuffer = file.arrayBuffer;
			tempBuffer.push(arrayBuffer);

			const newFile: ReceivedFile = {
				...file,
				arrayBuffer: tempBuffer,
				receivedSize: file.receivedSize + arrayBuffer.byteLength,
			}

			setFile(newFile);
		}

		// eslint-disable-next-line
	}, [dc]);

	useEffect(() => {
		if(!file) return;

		if(file.receivedSize === file.size){
			const received = new Blob(file.arrayBuffer);

			const downloadAnchor = document.createElement("a");

			downloadAnchor.href = URL.createObjectURL(received);
			downloadAnchor.download = file.name;
			downloadAnchor.textContent = `Click to download '${file.name}' (${file.size} bytes)`;
			downloadAnchor.style.display = 'block';

			downloadAnchor.click();

			// const bitrate = Math.round(receivedSize * 8 / ((new Date()).getTime() - timestampStart));
			// bitrateDiv.innerHTML = `<strong>Average Bitrate:</strong> ${bitrate} kbits/sec (max: ${bitrateMax} kbits/sec)`;
		}
	}, [file]);

	return (
		<div>
			<button
				onClick={() => {
					const infoDc = dc.get("file-info");
					infoDc && infoDc.send(JSON.stringify({ type: "send-file-info" }));
				}}
			>File Info</button>

			<button
				onClick={() => {
					const infoDc = dc.get("file-info");
					infoDc && file && infoDc.send(JSON.stringify({ type: "send-file-data" }));
				}}
				disabled={!file}
			>File Data</button>

			{ file && <progress max={1} value={file.receivedSize / file.size} /> }
		</div>
	);
};

export default DownloadPage;
