const configuration: RTCConfiguration = {
	iceServers: [
		{
			urls: [
				// "stun:stun1.l.google.com:19302",
				// "stun:stun2.l.google.com:19302",
				"stun:openrelay.metered.ca:80",
			],
		},
		{
			urls: ["turn:openrelay.metered.ca:80"],
			username: "openrelayproject",
			credential: "openrelayproject",
		},
		// {
		//     urls: ["turn:openrelay.metered.ca:443"],
		//     username: "openrelayproject",
		//     credential: "openrelayproject",
		// }
	]
};

export default configuration;
