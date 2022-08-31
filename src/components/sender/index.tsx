import { useContext, useEffect, useState } from "react";
import { WebSocketCtx } from "@/context/websocket";
import usePeerAnswer from "@/hooks/peerAnswer";

interface SenderInterface {
	file: File;
}

const Sender = ({ file }: SenderInterface) => {
	const { uuid: myId, ws, send } = useContext(WebSocketCtx);
	const [online, setOnline] = useState<boolean>(false);
	const [progress, setProgress] = useState<number>(0);
	const pc = usePeerAnswer({ myId, send, ws });

	useEffect(() => {
		window.onbeforeunload = () => pc.close();
		window.onunload = () => pc.close();
		
		const infoDc = pc.createDataChannel("file-info");
		const dataDc = pc.createDataChannel("file-data");
		dataDc.binaryType = "arraybuffer";

		infoDc.onopen = () => {
			setOnline(true);
			ws?.close();
		};
		dataDc.onopen = () => console.log("Opened");

		infoDc.onclose = () => setOnline(false);
		dataDc.onclose = () => console.log("Closed");

		infoDc.onmessage = ({ data: rawData }) => {
			try {
				const { type } = JSON.parse(rawData);

				switch (type) {
					case "send-file-info":
						infoDc.send(JSON.stringify({
							type: "file-info",
							data: {
								name: file.name,
								size: file.size,
								type: file.type
							}
						}));
						break;

					case "send-file-data":
						let offset = 0;
						const chunkSize = 16384;
						const fileReader = new FileReader();

						fileReader.onerror = ev => console.error('Error reading file:', ev);
						fileReader.onabort = ev => console.log('File reading aborted:', ev);
						fileReader.onload = (ev) => {
							const fileData = ev.target?.result as ArrayBuffer;
							if(!fileData) return;

							dataDc.send(fileData);
							offset += fileData.byteLength;
							setProgress(offset / file.size);

							if (offset < file.size)
								readSlice(offset);
						};

						const readSlice = (o: number) => fileReader.readAsArrayBuffer(file.slice(offset, o + chunkSize));

						readSlice(0);
						break;
				}
			}
			catch (error) {
				console.error(error);	
			}
		}
		
		// eslint-disable-next-line
	}, []);

	return (
		<div>
			{online ? <span>Connected</span> : <span>Not connected</span>}
			{ <progress max={1} value={progress} /> }
		</div>
	);
};

export default Sender;
