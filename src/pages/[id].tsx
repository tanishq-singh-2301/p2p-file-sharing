import { useEffect, useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import { WebSocketCtx } from "@/context/websocket";
import usePeerOffer from "@/hooks/peerOffer";

interface ReceivedFile {
	name: string;
	size: number;
	type: string;
	arrayBuffer: any[];
	receivedSize: number;
}

const DownloadPage = () => {
	const { pathname } = useLocation();
	const { send, uuid: myId, ws } = useContext(WebSocketCtx);
	const pc = usePeerOffer({
		connectTo: pathname.split("/")[1],
		myId,
		send,
		ws,
	});
	const [dc, setDC] = useState<Map<string, RTCDataChannel>>(new Map());
	const [file, setFile] = useState<ReceivedFile | null>(null);

	useEffect(() => {
		window.onbeforeunload = () => pc.close();
		window.onunload = () => pc.close();
		const localDc = new Map<string, RTCDataChannel>(new Map());

		pc.ondatachannel = ({ channel }) => {
			channel.onclose = () => console.warn(channel.label, " :: Closed");
			channel.onopen = () => {
				ws?.close();
				console.warn(channel.label, " :: Opened");
			};

			localDc.set(channel.label, channel);
			setDC(localDc);
		};

		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		if ([...dc.keys()].length !== 2) return;

		const infoDc = dc.get("file-info");
		const dataDc = dc.get("file-data");

		if (!dataDc || !infoDc) return;

		let tempFile: ReceivedFile | null;
		dataDc.binaryType = "arraybuffer";

		infoDc.onmessage = ({ data: rawData }) => {
			try {
				const { type, data } = JSON.parse(rawData);

				switch (type) {
					case "file-info":
						tempFile = {
							arrayBuffer: [],
							name: data.name,
							receivedSize: 0,
							size: data.size,
							type: data.type,
						};
						console.log(tempFile);
						setFile(tempFile);
						break;
				}
			} catch (error) {
				console.error(error);
			}
		};

		dataDc.onmessage = ({ data }) => {
			if (!tempFile) return;

			if (data === "EOFD") return setFile(tempFile);

			const tempBuffer = tempFile.arrayBuffer;
			tempBuffer.push(data as ArrayBuffer);

			tempFile = {
				...tempFile,
				arrayBuffer: tempBuffer,
				receivedSize:
					tempFile.receivedSize + (data as ArrayBuffer).byteLength,
			};

			setFile(tempFile);
		};

		// eslint-disable-next-line
	}, [dc]);

	useEffect(() => {
		if (file && file.receivedSize === file.size) {
			console.log(file);
			const received = new Blob(file.arrayBuffer);

			const downloadAnchor = document.createElement("a");

			downloadAnchor.href = URL.createObjectURL(received);
			downloadAnchor.download = file.name;
			downloadAnchor.textContent = `Click to download '${file.name}' (${file.size} bytes)`;
			downloadAnchor.style.display = "block";

			downloadAnchor.click();
		}
	}, [file]);

	return (
		<div>
			{[...dc.keys()].length === 2 ? (
				<div>
					<button
						onClick={() => {
							const infoDc = dc.get("file-info");
							infoDc &&
								infoDc.send(
									JSON.stringify({ type: "send-file-info" })
								);
						}}
					>
						File Info
					</button>

					<button
						onClick={() => {
							const infoDc = dc.get("file-info");

							if (infoDc && file)
								infoDc.send(
									JSON.stringify({ type: "send-file-data" })
								);
						}}
						disabled={!file}
					>
						File Data
					</button>

					{file && (
						<progress
							max={1}
							value={file.receivedSize / file.size}
						/>
					)}
				</div>
			) : (
				<div>Not Connected</div>
			)}
		</div>
	);
};

export default DownloadPage;
