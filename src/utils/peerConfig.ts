const configuration: RTCConfiguration = {
	iceServers: [
		{
			urls: [
				"stun:stun.l.google.com:19302",
				"stun:openrelay.metered.ca:80",
                "stun:global.stun.twilio.com:3478"
			],
		},
// 		{
// 			urls: ["turn:openrelay.metered.ca:80"],
// 			username: "openrelayproject",
// 			credential: "openrelayproject",
// 		},
// 		{
// 		    urls: ["turn:openrelay.metered.ca:443"],
// 		    username: "openrelayproject",
// 		    credential: "openrelayproject",
// 		}
	]
};

export default configuration;
